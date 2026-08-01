import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TOOL_DEFINITIONS, executeTool } from "@/lib/tools";

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
        goals: { orderBy: { orderIndex: "asc" } },
        weeklyPlanRows: { orderBy: { weekNumber: "asc" } },
        dailyLogs: { 
          orderBy: { dayNumber: "asc" },
          include: {
            moves: { orderBy: { orderIndex: "asc" } },
            leftovers: true,
            opsLogEntries: { orderBy: { startTime: "asc" } }
          }
        },
        weeklySummaries: {
          orderBy: { weekNumber: "asc" },
          include: {
            goalProgress: { include: { goal: true } },
            battles: { orderBy: { orderIndex: "asc" } }
          }
        },
        sixWeekSummaries: { orderBy: { blockNumber: "asc" } }
      }
    });

    let systemPrompt = `You are Sprint OS AI, the ultimate productivity and philosophy copilot for the user.
Your goal is to help them navigate their active sprint, hold them accountable to their Codex, and answer any questions.
You have access to tools to modify the database. If the user asks you to create a goal, add a move, log something, or modify their rules, ALWAYS use the appropriate tool.

=== DATA IMPORT RULES ===
When importing or updating Daily Log and Ops Log details:
1. Ops Log activityType classification:
   - "deep_work": Highly focused, distraction-free cognitive effort on goals (e.g. programming, reading/studying AI, designing, prep work, deep planning).
   - "work": Standard administrative or routine tasks (e.g. quick emails, light task execution).
   - "rest": Sleeping, relaxation, leisure, meals, music, park walks, exercise, imagination, rest, and breakfast. Do NOT classify rest, imagination, music, or eating as "deep_work" or "work".
   - "other": Miscellaneous tasks that don't fit the above.
2. Codex Laws at Risk and Violated:
   - Must be formatted as a stringified JSON array of the EXACT titles of the Codex laws, e.g. '["Reaction"]' or '["Words"]'. If no laws are violated or at risk, use "None".
   - Never write the description, a colon, or a combined description in the array (e.g. do NOT write '["Reaction: I am never reacting. Calm in all situations."]' – write exactly '["Reaction"]').
   - Never write plain text titles (like 'Reaction'); always wrap them in an array and stringify them (e.g. '["Reaction"]').
   - Select only from the active law titles listed under Doctrine or Gate Keeper.
3. Energy Level:
   - Must be mapped to exactly "High", "Medium", or "Low" (capitalized, full word).
4. Reaffirming North Star:
   - Set 'northStarReaffirmed' to true if the user reaffirms their North Star.
5. Critical Number:
   - 'criticalTarget' and 'criticalReality' must be updated when importing daily logs.
   - They MUST be pure numeric values (e.g., "2" or "2.12"). Do NOT include units like "hours". Convert colon times like "2:07" to decimal hours (e.g. "2.12") so they can render correctly in the UI's number inputs.


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
      systemPrompt += `Sprint ID: ${activeSprint.id}\nStart Date: ${activeSprint.startDate}\nEnd Date: ${activeSprint.endDate}\n`;
      
      if (activeSprint.northStars.length > 0) {
        systemPrompt += `North Star: ${activeSprint.northStars[0].statement}\n`;
      }
      
      if (activeSprint.goals.length > 0) {
        systemPrompt += `\n[Goals]\n`;
        activeSprint.goals.forEach(g => {
          systemPrompt += `- [ID: ${g.id}] ${g.goalText} (Deadline: ${g.deadline})\n`;
          systemPrompt += `  Success: ${g.successLooksLike}\n`;
          systemPrompt += `  Why: ${g.whyImportant}\n`;
        });
      }

      if (activeSprint.weeklyPlanRows.length > 0) {
        systemPrompt += `\n[Weekly Plan Rows]\n`;
        activeSprint.weeklyPlanRows.forEach(w => {
          systemPrompt += `- Week ${w.weekNumber}: Focus: ${w.focusArea} | Delivery: ${w.delivery} | Diff: ${w.difficulty}\n`;
        });
      }

      if (activeSprint.dailyLogs.length > 0) {
        systemPrompt += `\n[Daily Logs]\n`;
        activeSprint.dailyLogs.forEach(d => {
          systemPrompt += `Day ${d.dayNumber} [Log ID: ${d.id}] (Week ${d.weekNumber}, Date: ${d.date})\n`;
          if (d.criticalTarget) systemPrompt += `  Target: ${d.criticalTarget} -> Reality: ${d.criticalReality || 'Pending'}\n`;
          if (d.energyLevel) systemPrompt += `  Energy: ${d.energyLevel} (Why: ${d.energyWhy || 'N/A'})\n`;
          if (d.focusKiller) systemPrompt += `  Focus Killer: ${d.focusKiller}\n`;
          if (d.codexLawViolated && d.codexLawViolated !== "None") {
            systemPrompt += `  Violated Law: ${d.codexLawViolated} (Why: ${d.whyViolated || 'N/A'})\n`;
          }
          if (d.moves.length > 0) {
            systemPrompt += `  Moves:\n`;
            d.moves.forEach(m => {
              systemPrompt += `    [Move ID: ${m.id}] [${m.done ? 'x' : ' '}] ${m.taskText}\n`;
            });
          }
          if (d.opsLogEntries.length > 0) {
            systemPrompt += `  Ops Log:\n`;
            d.opsLogEntries.forEach(o => {
              systemPrompt += `    ${o.startTime}-${o.endTime}: ${o.activity} (${o.activityType || 'Uncategorized'})\n`;
            });
          }
          if (d.useFreeformOpsLog && d.freeformOpsLog) {
            systemPrompt += `  Freeform Ops Log: ${d.freeformOpsLog}\n`;
          }
        });
      }

      if (activeSprint.weeklySummaries.length > 0) {
        systemPrompt += `\n[Weekly Summaries]\n`;
        activeSprint.weeklySummaries.forEach(ws => {
          systemPrompt += `Week ${ws.weekNumber}:\n`;
          systemPrompt += `  Deep Work: ${ws.totalDeepWorkHours || 0}h | Total Work: ${ws.totalWorkHours || 0}h\n`;
          if (ws.whatWorked) systemPrompt += `  Worked: ${ws.whatWorked}\n`;
          if (ws.whatFailed) systemPrompt += `  Failed: ${ws.whatFailed}\n`;
          if (ws.goalProgress.length > 0) {
            systemPrompt += `  Goal Progress:\n`;
            ws.goalProgress.forEach(gp => {
              systemPrompt += `    - ${gp.goal.goalText}: ${gp.progressPercent}% (${gp.evidenceText || 'No evidence'})\n`;
            });
          }
        });
      }

      if (activeSprint.sixWeekSummaries.length > 0) {
        systemPrompt += `\n[Six Week Summaries]\n`;
        activeSprint.sixWeekSummaries.forEach(sws => {
          systemPrompt += `Block ${sws.blockNumber}:\n`;
          systemPrompt += `  Deep Work: ${sws.aggregateDeepWorkHours || 0}h | Total Work: ${sws.aggregateWorkHours || 0}h\n`;
          if (sws.biggestWin) systemPrompt += `  Biggest Win: ${sws.biggestWin}\n`;
          if (sws.biggestFailure) systemPrompt += `  Biggest Failure: ${sws.biggestFailure}\n`;
        });
      }
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
    await prisma.chatMessage.create({
      data: { role: "user", content: message }
    });

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message }
    ];

    // Dynamically import node-fetch and agent to bypass native fetch limits
    const fetchMod = await import("node-fetch");
    const fetch = fetchMod.default;
    
    let agent: any = undefined;
    if (settings.proxyEnabled && settings.proxyUrl) {
      const { SocksProxyAgent } = await import("socks-proxy-agent");
      agent = new SocksProxyAgent(settings.proxyUrl);
    }

    // 4. Recursive Tool Calling Loop
    let maxIterations = 15;
    let iteration = 0;
    let finalReply = "";

    while (iteration < maxIterations) {
      iteration++;
      let toolCalls = null;
      let replyText = "";
      let messageToAppend = null;

      if (settings.provider === "ollama") {
        const res = await fetch(settings.endpointUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: settings.modelName,
            messages: messages,
            stream: false,
            tools: TOOL_DEFINITIONS
          }),
          agent
        });
        if (!res.ok) throw new Error("Ollama API Error");
        const data = await res.json() as any;
        messageToAppend = data.message;
        replyText = data.message?.content || "";
        toolCalls = data.message?.tool_calls;
      } else {
        const res = await fetch(settings.endpointUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(settings.apiKey ? { "Authorization": `Bearer ${settings.apiKey}` } : {})
          },
          body: JSON.stringify({
            model: settings.modelName,
            messages: messages,
            stream: false,
            tools: TOOL_DEFINITIONS
          }),
          agent
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`OpenAI API Error: ${err}`);
        }
        const data = await res.json() as any;
        messageToAppend = data.choices?.[0]?.message;
        replyText = data.choices?.[0]?.message?.content || "";
        toolCalls = data.choices?.[0]?.message?.tool_calls;
      }

      // Append assistant's message to messages
      if (messageToAppend) {
        messages.push(messageToAppend);
      }

      if (toolCalls && toolCalls.length > 0) {
        // Execute all tool calls
        for (const tc of toolCalls) {
          const functionName = tc.function.name;
          // Ollama passes arguments as object, OpenAI passes them as stringified JSON
          let functionArgs = {};
          try {
            functionArgs = typeof tc.function.arguments === "string" 
              ? JSON.parse(tc.function.arguments) 
              : tc.function.arguments;
          } catch (e) {
            console.error("Failed to parse function args:", e);
          }
          
          let resultStr = "";
          try {
            const result = await executeTool(functionName, functionArgs);
            resultStr = typeof result === "string" ? result : JSON.stringify(result);
          } catch (err: any) {
            resultStr = `Error executing ${functionName}: ${err.message}`;
          }

          // Append tool response
          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            name: functionName,
            content: resultStr
          });
        }
      } else {
        // No tool calls, we have the final answer
        finalReply = replyText;
        break;
      }
    }

    // Fallback if max iterations reached
    if (!finalReply) {
      finalReply = "I performed some actions but reached the iteration limit before finalizing a response.";
    }

    // Save assistant reply
    await prisma.chatMessage.create({
      data: { role: "assistant", content: finalReply }
    });

    return NextResponse.json({ reply: finalReply });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to call LLM" }, { status: 500 });
  }
}
