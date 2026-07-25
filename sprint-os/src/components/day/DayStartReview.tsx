"use client";
import React, { useState, useEffect } from "react";
import { DailyLog } from "@prisma/client";
import { updateDailyLog } from "@/lib/actions/dailyLog";
import { useDebounce } from "@/hooks/useDebounce";
import { ENERGY_LEVEL } from "@/lib/enums";

export default function DayStartReview({ dailyLog }: { dailyLog: DailyLog }) {
  const [criticalTarget, setCriticalTarget] = useState(dailyLog.criticalTarget || "");
  const [criticalReality, setCriticalReality] = useState(dailyLog.criticalReality || "");
  const [energyLevel, setEnergyLevel] = useState(dailyLog.energyLevel || "");
  const [whyEnergy, setWhyEnergy] = useState(dailyLog.energyWhy || "");
  const [focusKiller, setFocusKiller] = useState(dailyLog.focusKiller || "");
  const [focusKillerSolution, setFocusKillerSolution] = useState(dailyLog.solutionForTomorrow || "");

  const debouncedWhy = useDebounce(whyEnergy, 500);
  const debouncedKiller = useDebounce(focusKiller, 500);
  const debouncedSolution = useDebounce(focusKillerSolution, 500);
  const debouncedTarget = useDebounce(criticalTarget, 500);
  const debouncedReality = useDebounce(criticalReality, 500);

  useEffect(() => {
    updateDailyLog(dailyLog.id, {
      criticalTarget: debouncedTarget || undefined,
      criticalReality: debouncedReality || undefined,
      energyLevel: energyLevel || undefined,
      energyWhy: debouncedWhy,
      focusKiller: debouncedKiller,
      solutionForTomorrow: debouncedSolution,
    });
  }, [
    debouncedTarget,
    debouncedReality,
    energyLevel,
    debouncedWhy,
    debouncedKiller,
    debouncedSolution,
    dailyLog.id
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Critical Number</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Target</label>
            <input
              type="number"
              value={criticalTarget}
              onChange={(e) => setCriticalTarget(e.target.value)}
              disabled={dailyLog.locked}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Reality</label>
            <input
              type="number"
              value={criticalReality}
              onChange={(e) => setCriticalReality(e.target.value)}
              disabled={dailyLog.locked}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Energy & Focus</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Energy Level</label>
            <select
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              disabled={dailyLog.locked}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <option value="">-</option>
              {ENERGY_LEVEL.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Why?</label>
            <input
              type="text"
              value={whyEnergy}
              onChange={(e) => setWhyEnergy(e.target.value)}
              disabled={dailyLog.locked}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Focus Killer</label>
            <input
              type="text"
              value={focusKiller}
              onChange={(e) => setFocusKiller(e.target.value)}
              disabled={dailyLog.locked}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Solution</label>
            <input
              type="text"
              value={focusKillerSolution}
              onChange={(e) => setFocusKillerSolution(e.target.value)}
              disabled={dailyLog.locked}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
