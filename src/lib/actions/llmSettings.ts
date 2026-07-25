"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLLMSettings() {
  const settings = await prisma.lLMSettings.findUnique({
    where: { id: "global" }
  });
  
  if (!settings) {
    return {
      provider: "ollama",
      endpointUrl: "http://localhost:11434/api/generate",
      apiKey: null,
      modelName: "llama3",
      systemPrompt: null,
      proxyEnabled: false,
      proxyUrl: null
    };
  }
  return settings;
}

export async function updateLLMSettings(data: {
  provider: string;
  endpointUrl: string;
  apiKey: string | null;
  modelName: string;
  systemPrompt: string | null;
  proxyEnabled: boolean;
  proxyUrl: string | null;
}) {
  const settings = await prisma.lLMSettings.upsert({
    where: { id: "global" },
    update: data,
    create: { id: "global", ...data }
  });
  revalidatePath("/settings");
  revalidatePath("/");
  return settings;
}
