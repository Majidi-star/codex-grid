import React from "react";
import RadialProgress from "../shared/RadialProgress";
import { format } from "date-fns";

export default function DayHeader({
  dayNumber,
  date,
  weekNumber
}: {
  dayNumber: number;
  date: Date;
  weekNumber: number;
}) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Day {dayNumber}/84</h1>
        <p className="text-gray-500 mt-1">{format(date, "EEEE, MMMM do, yyyy")} &bull; Week {weekNumber}</p>
      </div>
      <div>
        <RadialProgress value={dayNumber} max={84} label="Sprint" size={140} />
      </div>
    </div>
  );
}
