"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const WeeklyPlanRowInputSchema = z.object({
  focusArea: z.string().optional(),
  delivery: z.string().optional(),
  difficulty: z.number().int().min(1).max(10).optional(),
});

export async function updateWeeklyPlanRow(id: string, input: Partial<z.infer<typeof WeeklyPlanRowInputSchema>>) {
  const data = WeeklyPlanRowInputSchema.partial().parse(input);
  const record = await prisma.weeklyPlanRow.update({ where: { id }, data });
  revalidatePath("/roadmap");
  return record;
}
