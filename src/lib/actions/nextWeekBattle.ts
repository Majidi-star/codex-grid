"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertNextWeekBattle(
  weeklySummaryId: string, 
  orderIndex: number, 
  battleText: string
) {
  // We don't have a unique constraint on (weeklySummaryId, orderIndex) so we have to manually check.
  const existing = await prisma.nextWeekBattle.findFirst({
    where: { weeklySummaryId, orderIndex }
  });

  let record;
  if (existing) {
    record = await prisma.nextWeekBattle.update({
      where: { id: existing.id },
      data: { battleText },
      include: { weeklySummary: true }
    });
  } else {
    record = await prisma.nextWeekBattle.create({
      data: { weeklySummaryId, orderIndex, battleText },
      include: { weeklySummary: true }
    });
  }

  revalidatePath(`/week/${record.weeklySummary.weekNumber}/summary`);
  return record;
}
