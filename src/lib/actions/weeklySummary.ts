"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parse, differenceInMinutes } from "date-fns";

const WeeklySummaryInputSchema = z.object({
  totalDeepWorkHours: z.number().nullable().optional(),
  totalWorkHours: z.number().nullable().optional(),
  codexViolationCountJson: z.string().nullable().optional(),
  
  whatWorked: z.string().nullable().optional(),
  whatFailed: z.string().nullable().optional(),
  mostRepetitiveIssue: z.string().nullable().optional(),
  redFlags: z.string().nullable().optional(),
  victoryMoment: z.string().nullable().optional(),
  correctionNextWeek: z.string().nullable().optional(),
  
  energyLevel: z.string().nullable().optional(),
  motivation: z.number().nullable().optional(),
  trustInGoal: z.number().nullable().optional(),
  manifestSentence: z.string().nullable().optional(),
  reviewedCodexBook: z.boolean().optional(),
  
  skillStage: z.string().nullable().optional(),
  vsGreatsComparison: z.string().nullable().optional(),
  needMoreChallenge: z.boolean().optional(),
  needScheduleUpdate: z.boolean().optional(),
  analyzedMistakeLedger: z.boolean().optional(),
  
  locked: z.boolean().optional(),
});

export async function updateWeeklySummary(id: string, input: Partial<z.infer<typeof WeeklySummaryInputSchema>>) {
  const data = WeeklySummaryInputSchema.partial().parse(input);
  const record = await prisma.weeklySummary.update({ where: { id }, data });
  revalidatePath(`/week/${record.weekNumber}/summary`);
  return record;
}

export async function computeWeeklyAutoSums(sprintId: string, weekNumber: number, forceOverwrite = false) {
  const weeklySummary = await prisma.weeklySummary.findUnique({
    where: { sprintId_weekNumber: { sprintId, weekNumber } }
  });

  if (!weeklySummary) return null;

  // If we already have computed values and are not forcing, skip.
  if (!forceOverwrite && weeklySummary.totalDeepWorkHours !== null && weeklySummary.totalWorkHours !== null) {
    return weeklySummary;
  }

  const dailyLogs = await prisma.dailyLog.findMany({
    where: { sprintId, weekNumber },
    include: { opsLogEntries: true }
  });

  let deepWorkMins = 0;
  let workMins = 0;
  const codexViolations: Record<string, number> = {};

  for (const log of dailyLogs) {
    if (log.codexLawViolated && log.codexLawViolated !== "None") {
      let laws: string[] = [];
      try {
        laws = JSON.parse(log.codexLawViolated);
        if (!Array.isArray(laws)) laws = [log.codexLawViolated];
      } catch {
        laws = [log.codexLawViolated];
      }
      for (const law of laws) {
        if (law && law !== "None") {
          codexViolations[law] = (codexViolations[law] || 0) + 1;
        }
      }
    }

    for (const ops of log.opsLogEntries) {
      if (ops.activityType === "deep_work" || ops.activityType === "work") {
        const start = parse(ops.startTime, "HH:mm", new Date());
        let end = parse(ops.endTime, "HH:mm", new Date());
        
        if (end < start) {
          end = new Date(end.getTime() + 24 * 60 * 60 * 1000); // add 24 hours
        }
        
        const diffMins = differenceInMinutes(end, start);
        
        if (ops.activityType === "deep_work") {
          deepWorkMins += diffMins;
          workMins += diffMins; // deep work is also work
        } else if (ops.activityType === "work") {
          workMins += diffMins;
        }
      }
    }
  }

  const totalDeepWorkHours = Number((deepWorkMins / 60).toFixed(2));
  const totalWorkHours = Number((workMins / 60).toFixed(2));
  const codexViolationCountJson = JSON.stringify(codexViolations);

  const updated = await prisma.weeklySummary.update({
    where: { id: weeklySummary.id },
    data: {
      totalDeepWorkHours: forceOverwrite || weeklySummary.totalDeepWorkHours === null ? totalDeepWorkHours : weeklySummary.totalDeepWorkHours,
      totalWorkHours: forceOverwrite || weeklySummary.totalWorkHours === null ? totalWorkHours : weeklySummary.totalWorkHours,
      codexViolationCountJson: forceOverwrite || weeklySummary.codexViolationCountJson === null ? codexViolationCountJson : weeklySummary.codexViolationCountJson,
    }
  });

  revalidatePath(`/week/${weekNumber}/summary`);
  return updated;
}
