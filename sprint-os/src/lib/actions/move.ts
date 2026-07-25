"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MoveInputSchema = z.object({
  dailyLogId: z.string(),
  taskText: z.string().min(1, "Task text is required"),
  done: z.boolean().optional(),
});

export async function createMove(input: z.infer<typeof MoveInputSchema>) {
  const data = MoveInputSchema.parse(input);

  // Validate count < 5 server-side
  const existingCount = await prisma.move.count({
    where: { dailyLogId: data.dailyLogId }
  });

  if (existingCount >= 5) {
    throw new Error("Maximum of 5 moves allowed per day.");
  }

  const record = await prisma.move.create({ 
    data: {
      ...data,
      orderIndex: existingCount + 1
    } 
  });
  
  // We need to revalidate the day page.
  const dailyLog = await prisma.dailyLog.findUnique({ where: { id: data.dailyLogId } });
  if (dailyLog) {
    revalidatePath(`/day/${dailyLog.dayNumber}`);
  } else {
    revalidatePath("/", "layout");
  }
  return record;
}

export async function updateMove(id: string, input: Partial<z.infer<typeof MoveInputSchema>>) {
  const data = MoveInputSchema.partial().parse(input);
  const record = await prisma.move.update({ 
    where: { id }, 
    data,
    include: { dailyLog: true }
  });
  
  revalidatePath(`/day/${record.dailyLog.dayNumber}`);
  return record;
}

export async function toggleMove(id: string, done: boolean) {
  const record = await prisma.move.update({
    where: { id },
    data: { done },
    include: { dailyLog: true }
  });
  revalidatePath(`/day/${record.dailyLog.dayNumber}`);
  return record;
}

export async function deleteMove(id: string) {
  const record = await prisma.move.findUnique({ where: { id }, include: { dailyLog: true } });
  if (record) {
    await prisma.move.delete({ where: { id } });
    revalidatePath(`/day/${record.dailyLog.dayNumber}`);
  }
}
