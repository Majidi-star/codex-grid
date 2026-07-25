"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const OpsLogEntryInputSchema = z.object({
  dailyLogId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  activity: z.string().min(1, "Activity is required"),
  activityType: z.enum(["deep_work", "work", "rest", "other"]).optional(),
});

export async function createOpsLogEntry(input: z.infer<typeof OpsLogEntryInputSchema>) {
  const data = OpsLogEntryInputSchema.parse(input);
  const record = await prisma.opsLogEntry.create({ data });
  const log = await prisma.dailyLog.findUnique({ where: { id: data.dailyLogId } });
  if (log) revalidatePath(`/day/${log.dayNumber}`);
  return record;
}

export async function updateOpsLogEntry(id: string, input: Partial<z.infer<typeof OpsLogEntryInputSchema>>) {
  const data = OpsLogEntryInputSchema.partial().parse(input);
  const record = await prisma.opsLogEntry.update({ where: { id }, data, include: { dailyLog: true } });
  revalidatePath(`/day/${record.dailyLog.dayNumber}`);
  return record;
}

export async function deleteOpsLogEntry(id: string) {
  const record = await prisma.opsLogEntry.findUnique({ where: { id }, include: { dailyLog: true } });
  if (record) {
    await prisma.opsLogEntry.delete({ where: { id } });
    revalidatePath(`/day/${record.dailyLog.dayNumber}`);
  }
}
