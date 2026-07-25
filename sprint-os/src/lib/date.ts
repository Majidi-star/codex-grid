import { differenceInCalendarDays, addDays } from "date-fns";

export function getDayNumber(sprintStartDate: Date, targetDate: Date = new Date()): number {
  const diff = differenceInCalendarDays(targetDate, sprintStartDate);
  return Math.min(Math.max(diff + 1, 1), 84);
}

export function getWeekNumber(dayNumber: number): number {
  return Math.min(Math.ceil(dayNumber / 7), 12);
}

export function getDateForDayNumber(sprintStartDate: Date, dayNumber: number): Date {
  return addDays(sprintStartDate, dayNumber - 1);
}

export function getBlockNumber(weekNumber: number): 1 | 2 {
  return weekNumber <= 6 ? 1 : 2;
}
