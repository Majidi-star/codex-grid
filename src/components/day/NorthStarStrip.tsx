"use client";
import React, { useState, useEffect } from "react";
import { updateDailyLog } from "@/lib/actions/dailyLog";
import { DailyLog, NorthStar } from "@prisma/client";

export default function NorthStarStrip({
  northStar,
  dailyLog
}: {
  northStar: NorthStar;
  dailyLog: DailyLog;
}) {
  const [typedText, setTypedText] = useState(dailyLog.northStarReaffirmed ? northStar.statement : "");
  const [reaffirmed, setReaffirmed] = useState(dailyLog.northStarReaffirmed);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedText(val);
    
    // Normalize comparison: ignore casing and trim whitespace
    const isMatch = val.trim().toLowerCase() === northStar.statement.trim().toLowerCase();
    
    if (isMatch !== reaffirmed) {
      setReaffirmed(isMatch);
      await updateDailyLog(dailyLog.id, { northStarReaffirmed: isMatch });
    }
  };

  return (
    <div className="bg-brand-50 dark:bg-brand-900/10 p-5 rounded-2xl mb-8 border border-brand-100 dark:border-brand-800/30 shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
            Daily North Star Reaffirmation
          </span>
          <p className="text-gray-800 dark:text-gray-200 font-serif italic text-lg select-all">
            &ldquo;{northStar.statement}&rdquo;
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={typedText}
              onChange={handleChange}
              placeholder="Type your North Star statement exactly to reaffirm..."
              className={`w-full px-4 py-2 text-sm rounded-xl border outline-none transition bg-white dark:bg-gray-900 dark:text-white ${
                reaffirmed 
                  ? "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20" 
                  : "border-gray-200 focus:border-brand-500 dark:border-gray-700"
              }`}
            />
            {reaffirmed && (
              <span className="absolute right-3 top-2.5 text-emerald-500 text-xs font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                ✓ Reaffirmed
              </span>
            )}
          </div>
          {!reaffirmed && (
            <span className="text-xs text-gray-500 dark:text-gray-400 sm:w-48 text-center sm:text-left">
              Type the statement above to unlock your day.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

