"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const WeeklyGoalProgressInputSchema = z.object({
  progressPercent: z.number().min(0).max(100),
  expectedText: z.string().optional(),
  evidenceText: z.string().optional(),
});

export async function upsertWeeklyGoalProgress(
  weeklySummaryId: string, 
  goalId: string, 
  input: Partial<z.infer<typeof WeeklyGoalProgressInputSchema>>
) {
  const data = WeeklyGoalProgressInputSchema.partial().parse(input);
  
  const record = await prisma.weeklyGoalProgress.upsert({
    where: {
      weeklySummaryId_goalId: {
        weeklySummaryId,
        goalId
      }
    },
    update: data,
    create: {
      weeklySummaryId,
      goalId,
      progressPercent: data.progressPercent ?? 0,
      expectedText: data.expectedText,
      evidenceText: data.evidenceText
    },
    include: { weeklySummary: true }
  });
  
  revalidatePath(`/week/${record.weeklySummary.weekNumber}/summary`);
  return record;
}
