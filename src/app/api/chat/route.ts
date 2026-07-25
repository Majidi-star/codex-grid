import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // 1. Fetch LLM Settings
    const settings = await prisma.lLMSettings.upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global" }
    });

    // 2. Build Context
    // Codex
    const profile = await prisma.codexProfile.findUnique({ where: { id: "global" } });
    const laws = await prisma.codexLaw.findMany();
    const doctrine = laws.filter(l => l.type === "doctrine");
    const gatekeeper = laws.filter(l => l.type === "gatekeeper");
    const blades = await prisma.codexBlade.findMany({ include: { principles: true } });

    // Active Sprint
    const activeSprint = await prisma.sprint.findFirst({
      where: { status: "active" },
      include: {
        northStars: { where: { isActive: true } },
        dailyLogs: { orderBy: { dayNumber: "asc" } }
      }
    });

    let systemPrompt = `You are Sprint OS AI, the ultimate productivity and philosophy copilot for the user.
Your goal is to help them navigate their active sprint, hold them accountable to their Codex, and answer any questions.

=== THE CODEX ===
Long-Term Goal: ${profile?.longTermGoal || "None"}
Final Mission: ${profile?.finalMission || "None"}

[Doctrine (Personal Rules)]
${doctrine.map(l => `- ${l.title}: ${l.description || ""}`).join("\n")}

[Gate Keeper (Rules for others)]
${gatekeeper.map(l => `- ${l.title}: ${l.description || ""}`).join("\n")}

[The Blades]
${blades.map(b => `${b.title}:\n${b.principles.map(p => `  - ${p.title}: ${p.description || ""}`).join("\n")}`).join("\n")}

=== ACTIVE SPRINT ===
`;

    if (activeSprint) {
      systemPrompt += `Sprint ID: ${activeSprint.id}\nStart Date: ${activeSprint.startDate}\n`;
      if (activeSprint.northStars.length > 0) {
        systemPrompt += `North Star: ${activeSprint.northStars[0].statement}\n`;
      }
      systemPrompt += `Days Logged: ${activeSprint.dailyLogs.length}\n`;
    } else {
      systemPrompt += `No active sprint right now.\n`;
    }

    if (settings.systemPrompt) {
      systemPrompt += `\n=== CUSTOM INSTRUCTIONS ===\n${settings.systemPrompt}\n`;
    }

    // 3. Fetch History
    const history = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "asc" }
    });

    // Add the new user message to history in DB immediately
    const userMsg = await prisma.chatMessage.create({
      data: { role: "user", content: message }
    });

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message }
    ];

    // 4. Call LLM
    let reply = "";

    // Dynamically import node-fetch and agent to bypass native fetch limits
    const fetchMod = await import("node-fetch");
    const fetch = fetchMod.default;
    
    let agent: any = undefined;
    if (settings.proxyEnabled && settings.proxyUrl) {
      const { SocksProxyAgent } = await import("socks-proxy-agent");
      agent = new SocksProxyAgent(settings.proxyUrl);
    }

    if (settings.provider === "ollama") {
      // Ollama format (non-streaming for simplicity in this implementation)
      const res = await fetch(settings.endpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: settings.modelName,
          messages: messages,
          stream: false
        }),
        agent
      });
      if (!res.ok) throw new Error("Ollama API Error");
      const data = await res.json() as any;
      reply = data.message?.content || "";
    } else {
      // OpenAI / OpenAI Compatible
      const res = await fetch(settings.endpointUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(settings.apiKey ? { "Authorization": `Bearer ${settings.apiKey}` } : {})
        },
        body: JSON.stringify({
          model: settings.modelName,
          messages: messages,
          stream: false
        }),
        agent
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI API Error: ${err}`);
      }
      const data = await res.json() as any;
      reply = data.choices?.[0]?.message?.content || "";
    }

    // Save assistant reply
    await prisma.chatMessage.create({
      data: { role: "assistant", content: reply }
    });

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to call LLM" }, { status: 500 });
  }
}
