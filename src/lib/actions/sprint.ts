"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function completeSprint(id: string) {
  const record = await prisma.sprint.update({
    where: { id },
    data: { status: "completed" }
  });
  revalidatePath("/");
  revalidatePath("/sprints");
  return record;
}

export async function setActiveSprint(id: string) {
  // Deactivate any existing active sprint
  await prisma.sprint.updateMany({
    where: { status: "active" },
    data: { status: "completed" }
  });

  const record = await prisma.sprint.update({
    where: { id },
    data: { status: "active" }
  });
  
  revalidatePath("/");
  revalidatePath("/sprints");
  return record;
}

export async function createSprint(input: { sprintName: string; northStar: string; startDate?: string }) {
  // Deactivate any existing active sprint just in case
  await prisma.sprint.updateMany({
    where: { status: "active" },
    data: { status: "completed" }
  });

  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 84); // 12 weeks

  const record = await prisma.sprint.create({
    data: {
      status: "active",
      startDate,
      endDate,
      northStars: {
        create: {
          statement: input.northStar,
          version: 1,
          isActive: true
        }
      }
    }
  });

  revalidatePath("/");
  return record;
}

export async function trashSprint(id: string) {
  const sprint = await prisma.sprint.findUnique({ where: { id } });
  
  const record = await prisma.sprint.update({
    where: { id },
    // If it was active, mark it completed as it goes to trash
    data: { 
      deletedAt: new Date(),
      status: sprint?.status === "active" ? "completed" : undefined 
    }
  });

  if (sprint?.status === "active") {
    // Find the most recently created, undeleted sprint to fallback to
    const fallbackSprint = await prisma.sprint.findFirst({
      where: { deletedAt: null, id: { not: id } },
      orderBy: { createdAt: "desc" }
    });

    if (fallbackSprint) {
      await prisma.sprint.update({
        where: { id: fallbackSprint.id },
        data: { status: "active" }
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/sprints");
  revalidatePath("/sprints/trash");
  return record;
}

export async function restoreSprint(id: string) {
  const record = await prisma.sprint.update({
    where: { id },
    data: { deletedAt: null }
  });
  revalidatePath("/sprints");
  revalidatePath("/sprints/trash");
  return record;
}

export async function deleteSprintPermanently(id: string) {
  // With SQLite, we can just delete the sprint and cascade will handle the rest if set up properly.
  // Since onDelete: Cascade is only explicitly set on some relations in schema, we may need to manually clean up or Prisma does it if we configured it.
  // Let's rely on Prisma deleting it and cascading if we have it or deleting related items.
  // Actually, wait, let's delete explicitly if there is no cascade on NorthStar, Goal, etc.
  
  // First, get related goals to delete WeeklyGoalProgress
  const goals = await prisma.goal.findMany({ where: { sprintId: id } });
  const goalIds = goals.map(g => g.id);

  // Get related weekly summaries to delete their progress & battles
  const weeklySummaries = await prisma.weeklySummary.findMany({ where: { sprintId: id } });
  const weeklySummaryIds = weeklySummaries.map(ws => ws.id);

  // Get related daily logs
  const dailyLogs = await prisma.dailyLog.findMany({ where: { sprintId: id } });
  const dailyLogIds = dailyLogs.map(dl => dl.id);

  // Delete dependencies in correct order to avoid foreign key constraints errors
  await prisma.weeklyGoalProgress.deleteMany({ where: { OR: [{ weeklySummaryId: { in: weeklySummaryIds } }, { goalId: { in: goalIds } }] } });
  await prisma.nextWeekBattle.deleteMany({ where: { weeklySummaryId: { in: weeklySummaryIds } } });
  await prisma.leftover.deleteMany({ where: { dailyLogId: { in: dailyLogIds } } });
  await prisma.move.deleteMany({ where: { dailyLogId: { in: dailyLogIds } } });
  await prisma.opsLogEntry.deleteMany({ where: { dailyLogId: { in: dailyLogIds } } });

  await prisma.goal.deleteMany({ where: { sprintId: id } });
  await prisma.weeklyPlanRow.deleteMany({ where: { sprintId: id } });
  await prisma.dailyLog.deleteMany({ where: { sprintId: id } });
  await prisma.weeklySummary.deleteMany({ where: { sprintId: id } });
  await prisma.sixWeekSummary.deleteMany({ where: { sprintId: id } });
  await prisma.northStar.deleteMany({ where: { sprintId: id } });

  const sprint = await prisma.sprint.findUnique({ where: { id } });

  const record = await prisma.sprint.delete({
    where: { id }
  });

  if (sprint?.status === "active") {
    // Find the most recently created, undeleted sprint to fallback to
    const fallbackSprint = await prisma.sprint.findFirst({
      where: { deletedAt: null, id: { not: id } },
      orderBy: { createdAt: "desc" }
    });

    if (fallbackSprint) {
      await prisma.sprint.update({
        where: { id: fallbackSprint.id },
        data: { status: "active" }
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/sprints");
  revalidatePath("/sprints/trash");
  return record;
}
