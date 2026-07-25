"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DailyLogInputSchema = z.object({
  sprintId: z.string(),
  dayNumber: z.number().int(),
  date: z.coerce.date(),
  northStarReaffirmed: z.boolean().optional(),
  
  sleepTime: z.string().optional(),
  codexLawAtRisk: z.string().optional(),
  preventionMethod: z.string().optional(),
  codexLawViolated: z.string().optional(),
  whyViolated: z.string().optional(),
  correctionForTomorrow: z.string().optional(),
  criticalTarget: z.string().optional(),
  criticalReality: z.string().optional(),
  energyLevel: z.string().optional(),
  energyWhy: z.string().optional(),
  focusKiller: z.string().optional(),
  solutionForTomorrow: z.string().optional(),

  useFreeformOpsLog: z.boolean().optional(),
  freeformOpsLog: z.string().optional(),
  locked: z.boolean().optional(),
});

export async function createDailyLog(input: z.infer<typeof DailyLogInputSchema>) {
  const data = DailyLogInputSchema.parse(input);
  const record = await prisma.dailyLog.create({
    data: {
      ...data,
      weekNumber: Math.ceil(data.dayNumber / 7)
    }
  });
  
  if (data.dayNumber > 1) {
    const prevLog = await prisma.dailyLog.findUnique({
      where: {
        sprintId_dayNumber: { sprintId: data.sprintId, dayNumber: data.dayNumber - 1 }
      },
      include: { moves: { where: { done: false } } }
    });

    if (prevLog && prevLog.moves.length > 0) {
      await prisma.leftover.createMany({
        data: prevLog.moves.map((m) => ({
          dailyLogId: record.id,
          sourceMoveId: m.id,
          description: m.taskText,
        }))
      });
    }
  }
  
  revalidatePath(`/day/${data.dayNumber}`);
  return record;
}

export async function updateDailyLog(id: string, input: Partial<z.infer<typeof DailyLogInputSchema>>) {
  const data = DailyLogInputSchema.partial().parse(input);
  const record = await prisma.dailyLog.update({ where: { id }, data });
  // We don't have the dayNumber in scope easily, but we know the path depends on it. 
  // Let's just revalidate everything since this is local-only.
  revalidatePath("/", "layout");
  return record;
}

export async function deleteDailyLog(id: string) {
  await prisma.dailyLog.delete({ where: { id } });
  revalidatePath("/", "layout");
}
