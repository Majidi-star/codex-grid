import React from "react";
import RadialProgress from "../shared/RadialProgress";
import { format } from "date-fns";
import Link from "next/link";
import { ChevronDownIcon } from "@/components/tailadmin/icons"; // We'll rotate it for left/right
import DayNavigator from "./DayNavigator";

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
      <div className="flex items-center gap-4">
        {dayNumber > 1 ? (
          <Link href={`/day/${dayNumber - 1}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <div className="rotate-90">
              <ChevronDownIcon />
            </div>
          </Link>
        ) : (
          <div className="p-2 text-transparent cursor-default">
            <ChevronDownIcon />
          </div>
        )}
        
        <div className="text-center min-w-[200px]">
          <DayNavigator currentDay={dayNumber} />
          <p className="text-gray-500 mt-1">{format(date, "EEEE, MMMM do, yyyy")} &bull; Week {weekNumber}</p>
        </div>

        {dayNumber < 84 ? (
          <Link href={`/day/${dayNumber + 1}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <div className="-rotate-90">
              <ChevronDownIcon />
            </div>
          </Link>
        ) : (
          <div className="p-2 text-transparent cursor-default">
            <ChevronDownIcon />
          </div>
        )}
      </div>
      <div>
        <RadialProgress value={dayNumber} max={84} label="Sprint" size={140} />
      </div>
    </div>
  );
}
