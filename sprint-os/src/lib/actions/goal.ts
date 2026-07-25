"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const GoalInputSchema = z.object({
  sprintId: z.string(),
  orderIndex: z.number().int(),
  goalText: z.string().min(1, "Goal text is required"),
  successLooksLike: z.string().min(1, "Success criteria is required"),
  deadline: z.coerce.date(),
  whyImportant: z.string().min(1, "Why important is required"),
  isLearningGoal: z.boolean().default(false),
});

export async function createGoal(input: z.infer<typeof GoalInputSchema>) {
  const data = GoalInputSchema.parse(input);
  const record = await prisma.goal.create({ data });
  revalidatePath("/setup");
  return record;
}

export async function updateGoal(id: string, input: Partial<z.infer<typeof GoalInputSchema>>) {
  const data = GoalInputSchema.partial().parse(input);
  const record = await prisma.goal.update({ where: { id }, data });
  revalidatePath("/setup");
  return record;
}

export async function deleteGoal(id: string) {
  await prisma.goal.delete({ where: { id } });
  revalidatePath("/setup");
}
