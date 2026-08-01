import { prisma } from "./prisma";

export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_active_sprint",
      description: "Retrieves the current active sprint, including its North Star and goals.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_sprint",
      description: "Starts a new 12-week sprint.",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string", description: "ISO Date string" },
          endDate: { type: "string", description: "ISO Date string" },
        },
        required: ["startDate", "endDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "manage_goal",
      description: "Adds or updates a goal for a sprint.",
      parameters: {
        type: "object",
        properties: {
          sprintId: { type: "string" },
          goalId: { type: "string", description: "Omit to create a new goal" },
          goalText: { type: "string" },
          successLooksLike: { type: "string" },
          deadline: { type: "string", description: "ISO Date string" },
          whyImportant: { type: "string" },
          isLearningGoal: { type: "boolean" },
          orderIndex: { type: "number" },
        },
        required: ["sprintId", "goalText", "successLooksLike", "deadline", "whyImportant", "orderIndex"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_daily_log",
      description: "Gets the log and moves for a specific date.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "ISO Date string or YYYY-MM-DD. Defaults to today." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_daily_log",
      description: "Creates a daily log for a sprint.",
      parameters: {
        type: "object",
        properties: {
          sprintId: { type: "string" },
          dayNumber: { type: "number" },
          weekNumber: { type: "number" },
          date: { type: "string", description: "ISO Date string" },
        },
        required: ["sprintId", "dayNumber", "weekNumber", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_daily_log",
      description: "Updates existing metrics on a daily log.",
      parameters: {
        type: "object",
        properties: {
          logId: { type: "string" },
          criticalTarget: { type: "string" },
          criticalReality: { type: "string" },
          energyLevel: { type: "string" },
          energyWhy: { type: "string" },
          focusKiller: { type: "string" },
          solutionForTomorrow: { type: "string" },
          sleepTime: { type: "string" },
          codexLawAtRisk: { type: "string" },
          preventionMethod: { type: "string" },
          codexLawViolated: { type: "string" },
          whyViolated: { type: "string" },
          correctionForTomorrow: { type: "string" },
          northStarReaffirmed: { type: "boolean" },
        },
        required: ["logId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "manage_move",
      description: "Adds, updates, or checks off a Move (task) on a daily log.",
      parameters: {
        type: "object",
        properties: {
          logId: { type: "string" },
          moveId: { type: "string", description: "Omit to create a new Move" },
          taskText: { type: "string" },
          done: { type: "boolean" },
          orderIndex: { type: "number" },
        },
        required: ["logId", "taskText", "orderIndex"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_codex",
      description: "Reads the complete Codex (Profile, Laws, Blades).",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_codex_law",
      description: "Adds a new Doctrine or Gatekeeper law to the Codex.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["doctrine", "gatekeeper"] },
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["type", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weekly_summary",
      description: "Retrieves the weekly summary for a given sprint and week number.",
      parameters: {
        type: "object",
        properties: {
          sprintId: { type: "string" },
          weekNumber: { type: "number" },
        },
        required: ["sprintId", "weekNumber"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_weekly_summary",
      description: "Creates or drafts a weekly summary for a sprint.",
      parameters: {
        type: "object",
        properties: {
          sprintId: { type: "string" },
          weekNumber: { type: "number" },
          whatWorked: { type: "string" },
          whatFailed: { type: "string" },
          correctionNextWeek: { type: "string" },
        },
        required: ["sprintId", "weekNumber"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_ops_log_entry",
      description: "Adds a time-blocked Ops Log entry to a daily log.",
      parameters: {
        type: "object",
        properties: {
          logId: { type: "string" },
          startTime: { type: "string", description: "e.g., 09:00" },
          endTime: { type: "string", description: "e.g., 10:30" },
          activity: { type: "string" },
          activityType: { type: "string", enum: ["deep_work", "work", "rest", "other"] },
        },
        required: ["logId", "startTime", "endTime", "activity"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "batch_update_day",
      description: "Creates or updates a daily log, replacing its moves and ops log entries in one batch operation.",
      parameters: {
        type: "object",
        properties: {
          sprintId: { type: "string" },
          dayNumber: { type: "number" },
          weekNumber: { type: "number" },
          date: { type: "string", description: "ISO Date string or YYYY-MM-DD" },
          metrics: {
            type: "object",
            description: "Daily metrics to update",
            properties: {
              criticalTarget: { type: "string" },
              criticalReality: { type: "string" },
              energyLevel: { type: "string" },
              energyWhy: { type: "string" },
              focusKiller: { type: "string" },
              solutionForTomorrow: { type: "string" },
              sleepTime: { type: "string" },
              codexLawAtRisk: { type: "string" },
              preventionMethod: { type: "string" },
              codexLawViolated: { type: "string" },
              whyViolated: { type: "string" },
              correctionForTomorrow: { type: "string" },
              useFreeformOpsLog: { type: "boolean" },
              freeformOpsLog: { type: "string" },
              northStarReaffirmed: { type: "boolean" }
            }
          },
          moves: {
            type: "array",
            description: "List of moves to replace existing moves",
            items: {
              type: "object",
              properties: {
                taskText: { type: "string" },
                done: { type: "boolean" },
                orderIndex: { type: "number" }
              },
              required: ["taskText", "orderIndex"]
            }
          },
          opsLogEntries: {
            type: "array",
            description: "List of ops log entries to replace existing ones",
            items: {
              type: "object",
              properties: {
                startTime: { type: "string", description: "e.g., 09:00" },
                endTime: { type: "string", description: "e.g., 10:30" },
                activity: { type: "string" },
                activityType: { type: "string", enum: ["deep_work", "work", "rest", "other"] }
              },
              required: ["startTime", "endTime", "activity"]
            }
          }
        },
        required: ["sprintId", "dayNumber", "weekNumber", "date"]
      }
    }
  }
];

export async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case "get_active_sprint": {
      const sprint = await prisma.sprint.findFirst({
        where: { status: "active" },
        include: { northStars: true, goals: true },
      });
      if (!sprint) return "No active sprint found.";
      return sprint;
    }

    case "create_sprint": {
      const { startDate, endDate } = args;
      const sprint = await prisma.sprint.create({
        data: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: "active",
        },
      });
      return sprint;
    }

    case "manage_goal": {
      const { sprintId, goalId, goalText, successLooksLike, deadline, whyImportant, isLearningGoal, orderIndex } = args;
      if (goalId) {
        return await prisma.goal.update({
          where: { id: goalId },
          data: { goalText, successLooksLike, deadline: new Date(deadline), whyImportant, isLearningGoal, orderIndex },
        });
      } else {
        return await prisma.goal.create({
          data: { sprintId, goalText, successLooksLike, deadline: new Date(deadline), whyImportant, isLearningGoal: isLearningGoal || false, orderIndex },
        });
      }
    }

    case "get_daily_log": {
      const { date } = args || {};
      let queryDate;
      if (date) {
        queryDate = new Date(date);
      } else {
        const now = new Date();
        queryDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      }

      const startOfDay = new Date(queryDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const log = await prisma.dailyLog.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: { moves: true, leftovers: true },
      });

      if (!log) return "No daily log found for the given date.";
      return log;
    }

    case "create_daily_log": {
      const { sprintId, dayNumber, weekNumber, date } = args;
      return await prisma.dailyLog.create({
        data: {
          sprintId,
          dayNumber,
          weekNumber,
          date: new Date(date),
        },
      });
    }

    case "update_daily_log": {
      const { logId, ...updateData } = args;
      return await prisma.dailyLog.update({
        where: { id: logId },
        data: updateData,
      });
    }

    case "manage_move": {
      const { logId, moveId, taskText, done, orderIndex } = args;
      if (moveId) {
        return await prisma.move.update({
          where: { id: moveId },
          data: { taskText, done, orderIndex },
        });
      } else {
        return await prisma.move.create({
          data: { dailyLogId: logId, taskText, done: done || false, orderIndex },
        });
      }
    }

    case "get_codex": {
      const profile = await prisma.codexProfile.findFirst();
      const laws = await prisma.codexLaw.findMany({ where: { isActive: true } });
      const blades = await prisma.codexBlade.findMany({
        include: { principles: true },
        orderBy: { orderIndex: 'asc' },
      });
      return { profile, laws, blades };
    }

    case "add_codex_law": {
      const { type, title, description } = args;
      return await prisma.codexLaw.create({
        data: { type, title, description },
      });
    }

    case "get_weekly_summary": {
      const { sprintId, weekNumber } = args;
      const summary = await prisma.weeklySummary.findUnique({
        where: {
          sprintId_weekNumber: { sprintId, weekNumber },
        },
      });
      if (!summary) return "No weekly summary found.";
      return summary;
    }

    case "create_weekly_summary": {
      const { sprintId, weekNumber, whatWorked, whatFailed, correctionNextWeek } = args;
      return await prisma.weeklySummary.create({
        data: { sprintId, weekNumber, whatWorked, whatFailed, correctionNextWeek },
      });
    }

    case "add_ops_log_entry": {
      const { logId, startTime, endTime, activity, activityType } = args;
      return await prisma.opsLogEntry.create({
        data: { dailyLogId: logId, startTime, endTime, activity, activityType },
      });
    }

    case "batch_update_day": {
      const { sprintId, dayNumber, weekNumber, date, metrics, moves, opsLogEntries } = args;

      return await prisma.$transaction(async (tx) => {
        // 1. Find or create the DailyLog
        let log = await tx.dailyLog.findUnique({
          where: {
            sprintId_dayNumber: { sprintId, dayNumber }
          }
        });

        if (!log) {
          log = await tx.dailyLog.create({
            data: {
              sprintId,
              dayNumber,
              weekNumber,
              date: new Date(date),
            }
          });
        }

        // 2. Update metrics if provided
        if (metrics) {
          log = await tx.dailyLog.update({
            where: { id: log.id },
            data: {
              ...metrics,
              date: metrics.date ? new Date(metrics.date) : log.date
            }
          });
        }

        // 3. Replace Moves if provided
        if (moves !== undefined) {
          // Delete existing moves
          await tx.move.deleteMany({
            where: { dailyLogId: log.id }
          });
          // Recreate new moves
          if (moves && moves.length > 0) {
            await tx.move.createMany({
              data: moves.map((m: any) => ({
                dailyLogId: log.id,
                taskText: m.taskText,
                done: m.done || false,
                orderIndex: m.orderIndex
              }))
            });
          }
        }

        // 4. Replace Ops Log Entries if provided
        if (opsLogEntries !== undefined) {
          // Delete existing ops log entries
          await tx.opsLogEntry.deleteMany({
            where: { dailyLogId: log.id }
          });
          // Recreate new ones
          if (opsLogEntries && opsLogEntries.length > 0) {
            await tx.opsLogEntry.createMany({
              data: opsLogEntries.map((o: any) => ({
                dailyLogId: log.id,
                startTime: o.startTime,
                endTime: o.endTime,
                activity: o.activity,
                activityType: o.activityType || null
              }))
            });
          }
        }

        // Return updated log with relations
        return await tx.dailyLog.findUnique({
          where: { id: log.id },
          include: { moves: true, opsLogEntries: true }
        });
      });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
