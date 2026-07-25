"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const LeftoverInputSchema = z.object({
  description: z.string().min(1, "Description is required"),
});

export async function updateLeftover(id: string, input: Partial<z.infer<typeof LeftoverInputSchema>>) {
  const data = LeftoverInputSchema.partial().parse(input);
  const record = await prisma.leftover.update({ 
    where: { id }, 
    data,
    include: { dailyLog: true }
  });
  
  revalidatePath(`/day/${record.dailyLog.dayNumber}`);
  return record;
}

export async function deleteLeftover(id: string) {
  const record = await prisma.leftover.findUnique({ where: { id }, include: { dailyLog: true } });
  if (record) {
    await prisma.leftover.delete({ where: { id } });
    revalidatePath(`/day/${record.dailyLog.dayNumber}`);
  }
}
