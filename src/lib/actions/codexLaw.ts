"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getActiveCodexLaws() {
  return await prisma.codexLaw.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  });
}

export async function getAllCodexLaws() {
  return await prisma.codexLaw.findMany({
    orderBy: { createdAt: 'asc' }
  });
}

export async function createCodexLaw(input: { title: string; description?: string }) {
  const record = await prisma.codexLaw.create({
    data: {
      title: input.title,
      description: input.description,
      isActive: true,
    }
  });
  revalidatePath("/codex");
  revalidatePath("/");
  return record;
}

export async function updateCodexLaw(id: string, input: { title?: string; description?: string; isActive?: boolean }) {
  const record = await prisma.codexLaw.update({
    where: { id },
    data: input
  });
  revalidatePath("/codex");
  revalidatePath("/");
  return record;
}

export async function deleteCodexLaw(id: string) {
  const record = await prisma.codexLaw.delete({
    where: { id }
  });
  revalidatePath("/codex");
  revalidatePath("/");
  return record;
}

export async function initializeDefaultCodexLaws() {
  const count = await prisma.codexLaw.count();
  if (count === 0) {
    await prisma.codexLaw.createMany({
      data: [
        { title: "Law1", description: "Default Codex Law 1" },
        { title: "Law2", description: "Default Codex Law 2" },
        { title: "Law3", description: "Default Codex Law 3" },
      ]
    });
  }
}
