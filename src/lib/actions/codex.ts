"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =======================
// Codex Profile Actions
// =======================

export async function getCodexProfile() {
  const profile = await prisma.codexProfile.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" }
  });

  return profile;
}

export async function updateCodexProfile(input: {
  longTermGoal?: string | null;
  finalMission?: string | null;
  signatureName?: string | null;
  signatureDate?: Date | null;
}) {
  const profile = await prisma.codexProfile.upsert({
    where: { id: "global" },
    update: input,
    create: {
      id: "global",
      ...input
    }
  });
  revalidatePath("/codex");
  return profile;
}

// =======================
// Codex Blade Actions
// =======================

export async function getCodexBlades() {
  return await prisma.codexBlade.findMany({
    include: { principles: { orderBy: { orderIndex: 'asc' } } },
    orderBy: { orderIndex: 'asc' }
  });
}

export async function createCodexBlade(input: { title: string; orderIndex?: number }) {
  const record = await prisma.codexBlade.create({
    data: {
      title: input.title,
      orderIndex: input.orderIndex || 0,
    }
  });
  revalidatePath("/codex");
  return record;
}

export async function updateCodexBlade(id: string, input: { title?: string; orderIndex?: number }) {
  const record = await prisma.codexBlade.update({
    where: { id },
    data: input
  });
  revalidatePath("/codex");
  return record;
}

export async function deleteCodexBlade(id: string) {
  const record = await prisma.codexBlade.delete({
    where: { id }
  });
  revalidatePath("/codex");
  return record;
}

// =======================
// Codex Blade Principle Actions
// =======================

export async function createCodexBladePrinciple(input: { bladeId: string; title: string; description?: string; orderIndex?: number }) {
  const record = await prisma.codexBladePrinciple.create({
    data: {
      bladeId: input.bladeId,
      title: input.title,
      description: input.description,
      orderIndex: input.orderIndex || 0,
    }
  });
  revalidatePath("/codex");
  return record;
}

export async function updateCodexBladePrinciple(id: string, input: { title?: string; description?: string | null; orderIndex?: number }) {
  const record = await prisma.codexBladePrinciple.update({
    where: { id },
    data: input
  });
  revalidatePath("/codex");
  return record;
}

export async function deleteCodexBladePrinciple(id: string) {
  const record = await prisma.codexBladePrinciple.delete({
    where: { id }
  });
  revalidatePath("/codex");
  return record;
}
