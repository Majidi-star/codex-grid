"use client";
import React, { useState, useEffect } from "react";
import { DailyLog, CodexLaw } from "@prisma/client";
import { updateDailyLog } from "@/lib/actions/dailyLog";
import { useDebounce } from "@/hooks/useDebounce";

export default function DayEndReview({ dailyLog, codexLaws }: { dailyLog: DailyLog, codexLaws: CodexLaw[] }) {
  const parseJsonArray = (str: string | null) => {
    if (!str || str === "None") return [];
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [str];
    } catch {
      return [str];
    }
  };

  const [sleepTime, setSleepTime] = useState(dailyLog.sleepTime || "");
  const [codexLawAtRisk, setCodexLawAtRisk] = useState<string[]>(parseJsonArray(dailyLog.codexLawAtRisk));
  const [preventionMethod, setPreventionMethod] = useState(dailyLog.preventionMethod || "");
  const [codexLawViolated, setCodexLawViolated] = useState<string[]>(parseJsonArray(dailyLog.codexLawViolated));
  const [whyViolated, setWhyViolated] = useState(dailyLog.whyViolated || "");
  const [correctionForTomorrow, setCorrectionForTomorrow] = useState(dailyLog.correctionForTomorrow || "");

  const toggleAtRisk = (law: string) => {
    if (dailyLog.locked) return;
    if (law === "None") {
      setCodexLawAtRisk([]);
      return;
    }
    setCodexLawAtRisk(prev => prev.includes(law) ? prev.filter(l => l !== law) : [...prev, law]);
  };

  const toggleViolated = (law: string) => {
    if (dailyLog.locked) return;
    if (law === "None") {
      setCodexLawViolated([]);
      return;
    }
    setCodexLawViolated(prev => prev.includes(law) ? prev.filter(l => l !== law) : [...prev, law]);
  };

  const debouncedPrevention = useDebounce(preventionMethod, 500);
  const debouncedWhy = useDebounce(whyViolated, 500);
  const debouncedCorrection = useDebounce(correctionForTomorrow, 500);
  const debouncedSleep = useDebounce(sleepTime, 500);

  useEffect(() => {
    updateDailyLog(dailyLog.id, {
      sleepTime: debouncedSleep,
      codexLawAtRisk: codexLawAtRisk.length > 0 ? JSON.stringify(codexLawAtRisk) : "None",
      preventionMethod: debouncedPrevention,
      codexLawViolated: codexLawViolated.length > 0 ? JSON.stringify(codexLawViolated) : "None",
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
            <div className="flex flex-wrap gap-2 mt-2">
              {codexLaws.map(law => (
                <button
                  key={law.id}
                  type="button"
                  onClick={() => toggleAtRisk(law.title)}
                  disabled={dailyLog.locked}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium transition border ${
                    codexLawAtRisk.includes(law.title)
                      ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700"
                  } disabled:opacity-50`}
                >
                  {law.title}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCodexLawAtRisk([])}
                disabled={dailyLog.locked}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition border ${
                  codexLawAtRisk.length === 0
                    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700"
                } disabled:opacity-50`}
              >
                None
              </button>
            </div>
          </div>
          {codexLawAtRisk.length > 0 && (
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
            <div className="flex flex-wrap gap-2 mt-2">
              {codexLaws.map(law => (
                <button
                  key={law.id}
                  type="button"
                  onClick={() => toggleViolated(law.title)}
                  disabled={dailyLog.locked}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium transition border ${
                    codexLawViolated.includes(law.title)
                      ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700"
                  } disabled:opacity-50`}
                >
                  {law.title}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCodexLawViolated([])}
                disabled={dailyLog.locked}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition border ${
                  codexLawViolated.length === 0
                    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700"
                } disabled:opacity-50`}
              >
                None
              </button>
            </div>
          </div>
          {codexLawViolated.length > 0 && (
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
