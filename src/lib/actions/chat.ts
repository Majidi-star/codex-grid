"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getChatMessages() {
  return await prisma.chatMessage.findMany({
    orderBy: { createdAt: "asc" }
  });
}

export async function addChatMessage(role: string, content: string) {
  const message = await prisma.chatMessage.create({
    data: { role, content }
  });
  // Note: revalidatePath might not be needed if chat client fetches via API, but good for SSR
  revalidatePath("/");
  return message;
}

export async function clearChatHistory() {
  await prisma.chatMessage.deleteMany({});
  revalidatePath("/");
  return true;
}
