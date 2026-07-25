"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SixWeekSummaryInputSchema = z.object({
  aggregateDeepWorkHours: z.number().nullable().optional(),
  aggregateWorkHours: z.number().nullable().optional(),
  overallGoalTrendJson: z.string().nullable().optional(),
  biggestWin: z.string().nullable().optional(),
  biggestFailure: z.string().nullable().optional(),
  codexViolationTrendJson: z.string().nullable().optional(),
  adjustmentsForNextBlock: z.string().nullable().optional(),
  northStarStillAccurate: z.boolean().nullable().optional(),
  updatedNorthStarText: z.string().nullable().optional(),
});

export async function updateSixWeekSummary(id: string, input: Partial<z.infer<typeof SixWeekSummaryInputSchema>>) {
  const data = SixWeekSummaryInputSchema.partial().parse(input);
  const record = await prisma.sixWeekSummary.update({ where: { id }, data });
  revalidatePath(`/block/${record.blockNumber}`);
  return record;
}

export async function computeBlockAutoSums(sprintId: string, blockNumber: number, forceOverwrite = false) {
  const summary = await prisma.sixWeekSummary.findUnique({
    where: { sprintId_blockNumber: { sprintId, blockNumber } }
  });

  if (!summary) return null;

  if (!forceOverwrite && summary.aggregateDeepWorkHours !== null && summary.aggregateWorkHours !== null) {
    return summary;
  }

  const weeks = blockNumber === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12];
  
  const weeklySummaries = await prisma.weeklySummary.findMany({
    where: { sprintId, weekNumber: { in: weeks } }
  });

  let aggDeep = 0;
  let aggWork = 0;

  for (const w of weeklySummaries) {
    aggDeep += w.totalDeepWorkHours || 0;
    aggWork += w.totalWorkHours || 0;
  }

  aggDeep = Number(aggDeep.toFixed(2));
  aggWork = Number(aggWork.toFixed(2));

  const updated = await prisma.sixWeekSummary.update({
    where: { id: summary.id },
    data: {
      aggregateDeepWorkHours: forceOverwrite || summary.aggregateDeepWorkHours === null ? aggDeep : summary.aggregateDeepWorkHours,
      aggregateWorkHours: forceOverwrite || summary.aggregateWorkHours === null ? aggWork : summary.aggregateWorkHours,
    }
  });

  revalidatePath(`/block/${blockNumber}`);
  return updated;
}
