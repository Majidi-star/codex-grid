"use client";
import React, { useState, useEffect } from "react";
import { DailyLog } from "@prisma/client";
import { updateDailyLog } from "@/lib/actions/dailyLog";
import { useDebounce } from "@/hooks/useDebounce";
import { CODEX_LAW } from "@/lib/enums";

export default function DayEndReview({ dailyLog }: { dailyLog: DailyLog }) {
  const [sleepTime, setSleepTime] = useState(dailyLog.sleepTime || "");
  const [codexLawAtRisk, setCodexLawAtRisk] = useState(dailyLog.codexLawAtRisk || "None");
  const [preventionMethod, setPreventionMethod] = useState(dailyLog.preventionMethod || "");
  const [codexLawViolated, setCodexLawViolated] = useState(dailyLog.codexLawViolated || "None");
  const [whyViolated, setWhyViolated] = useState(dailyLog.whyViolated || "");
  const [correctionForTomorrow, setCorrectionForTomorrow] = useState(dailyLog.correctionForTomorrow || "");

  const debouncedPrevention = useDebounce(preventionMethod, 500);
  const debouncedWhy = useDebounce(whyViolated, 500);
  const debouncedCorrection = useDebounce(correctionForTomorrow, 500);
  const debouncedSleep = useDebounce(sleepTime, 500);

  useEffect(() => {
    updateDailyLog(dailyLog.id, {
      sleepTime: debouncedSleep,
      codexLawAtRisk,
      preventionMethod: debouncedPrevention,
      codexLawViolated,
      whyViolated: debouncedWhy,
      correctionForTomorrow: debouncedCorrection,
    });
  }, [
    debouncedSleep,
    codexLawAtRisk,
    debouncedPrevention,
    codexLawViolated,
    debouncedWhy,
    debouncedCorrection,
    dailyLog.id
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Day-End Review</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sleep Time</label>
          <input
            type="time"
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
            disabled={dailyLog.locked}
            className="w-full sm:w-1/3 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Codex Law at Risk</label>
            <select
              value={codexLawAtRisk}
              onChange={(e) => setCodexLawAtRisk(e.target.value)}
              disabled={dailyLog.locked}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {CODEX_LAW.map(law => (
                <option key={law} value={law}>{law}</option>
              ))}
            </select>
          </div>
          {codexLawAtRisk !== "None" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prevention Method</label>
              <input
                type="text"
                value={preventionMethod}
                onChange={(e) => setPreventionMethod(e.target.value)}
                disabled={dailyLog.locked}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Codex Law Violated</label>
            <select
              value={codexLawViolated}
              onChange={(e) => setCodexLawViolated(e.target.value)}
              disabled={dailyLog.locked}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {CODEX_LAW.map(law => (
                <option key={law} value={law}>{law}</option>
              ))}
            </select>
          </div>
          {codexLawViolated !== "None" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Why Violated?</label>
              <input
                type="text"
                value={whyViolated}
                onChange={(e) => setWhyViolated(e.target.value)}
                disabled={dailyLog.locked}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>
          )}
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correction for Tomorrow</label>
          <textarea
            value={correctionForTomorrow}
            onChange={(e) => setCorrectionForTomorrow(e.target.value)}
            disabled={dailyLog.locked}
            className="w-full h-24 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed resize-y text-sm"
          />
        </div>
      </div>
    </div>
  );
}
