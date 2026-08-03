"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getChatSessions() {
  return await prisma.chatSession.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createChatSession(title: string = "New Chat") {
  const session = await prisma.chatSession.create({
    data: { title }
  });
  revalidatePath("/");
  return session;
}

export async function deleteChatSession(sessionId: string) {
  // Safe delete: delete messages first to be database agnostic
  await prisma.chatMessage.deleteMany({
    where: { chatSessionId: sessionId }
  });
  await prisma.chatSession.delete({
    where: { id: sessionId }
  });
  revalidatePath("/");
  return true;
}

export async function renameChatSession(sessionId: string, title: string) {
  const session = await prisma.chatSession.update({
    where: { id: sessionId },
    data: { title }
  });
  revalidatePath("/");
  return session;
}

export async function getChatMessages(sessionId?: string | null) {
  return await prisma.chatMessage.findMany({
    where: { chatSessionId: sessionId || null },
    orderBy: { createdAt: "asc" }
  });
}

export async function addChatMessage(role: string, content: string, sessionId?: string | null) {
  const message = await prisma.chatMessage.create({
    data: { 
      role, 
      content,
      chatSessionId: sessionId || null
    }
  });

  // If this is the first user message, update title automatically
  if (sessionId && role === "user") {
    const count = await prisma.chatMessage.count({
      where: { chatSessionId: sessionId }
    });
    if (count === 1) {
      const cleanContent = content.startsWith("<!--") ? content.replace(/<!--.*?-->/gs, "") : content;
      const title = cleanContent.length > 25 ? cleanContent.substring(0, 25) + "..." : cleanContent;
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title }
      });
    }
  }

  revalidatePath("/");
  return message;
}

export async function clearChatHistory(sessionId?: string | null) {
  await prisma.chatMessage.deleteMany({
    where: { chatSessionId: sessionId || null }
  });
  revalidatePath("/");
  return true;
}

export async function truncateChatHistory(messageId: string, sessionId?: string | null) {
  const messages = await prisma.chatMessage.findMany({
    where: { chatSessionId: sessionId || null },
    orderBy: { createdAt: "asc" }
  });
  const targetIndex = messages.findIndex(m => m.id === messageId);
  if (targetIndex !== -1) {
    const idsToDelete = messages.slice(targetIndex).map(m => m.id);
    if (idsToDelete.length > 0) {
      await prisma.chatMessage.deleteMany({
        where: {
          id: {
            in: idsToDelete
          }
        }
      });
    }
  }
  revalidatePath("/");
  return true;
}
