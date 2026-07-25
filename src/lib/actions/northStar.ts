"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const NorthStarInputSchema = z.object({
  sprintId: z.string(),
  statement: z.string().min(1, "Statement is required"),
  version: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function createNorthStar(input: z.infer<typeof NorthStarInputSchema>) {
  const data = NorthStarInputSchema.parse(input);
  const record = await prisma.northStar.create({ data });
  revalidatePath("/setup");
  return record;
}

export async function updateNorthStar(id: string, input: Partial<z.infer<typeof NorthStarInputSchema>>) {
  const data = NorthStarInputSchema.partial().parse(input);
  const record = await prisma.northStar.update({ where: { id }, data });
  revalidatePath("/setup");
  return record;
}

export async function deleteNorthStar(id: string) {
  await prisma.northStar.delete({ where: { id } });
  revalidatePath("/setup");
}
