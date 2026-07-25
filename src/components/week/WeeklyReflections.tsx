"use client";
import React, { useState, useEffect } from "react";
import { WeeklySummary } from "@prisma/client";
import { updateWeeklySummary } from "@/lib/actions/weeklySummary";
import { useDebounce } from "@/hooks/useDebounce";

export default function WeeklyReflections({ summary }: { summary: WeeklySummary }) {
  const [whatWorked, setWhatWorked] = useState(summary.whatWorked || "");
  const [whatFailed, setWhatFailed] = useState(summary.whatFailed || "");
  const [mostRepetitiveIssue, setMostRepetitiveIssue] = useState(summary.mostRepetitiveIssue || "");
  const [redFlags, setRedFlags] = useState(summary.redFlags || "");
  const [victoryMoment, setVictoryMoment] = useState(summary.victoryMoment || "");
  const [correctionNextWeek, setCorrectionNextWeek] = useState(summary.correctionNextWeek || "");

  const debouncedWhatWorked = useDebounce(whatWorked, 500);
  const debouncedWhatFailed = useDebounce(whatFailed, 500);
  const debouncedIssue = useDebounce(mostRepetitiveIssue, 500);
  const debouncedRedFlags = useDebounce(redFlags, 500);
  const debouncedVictory = useDebounce(victoryMoment, 500);
  const debouncedCorrection = useDebounce(correctionNextWeek, 500);

  useEffect(() => {
    updateWeeklySummary(summary.id, {
      whatWorked: debouncedWhatWorked,
      whatFailed: debouncedWhatFailed,
      mostRepetitiveIssue: debouncedIssue,
      redFlags: debouncedRedFlags,
      victoryMoment: debouncedVictory,
      correctionNextWeek: debouncedCorrection,
    });
  }, [
    debouncedWhatWorked,
    debouncedWhatFailed,
    debouncedIssue,
    debouncedRedFlags,
    debouncedVictory,
    debouncedCorrection,
    summary.id
  ]);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reflections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">What Worked</label>
            <textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              disabled={summary.locked}
              className="w-full h-24 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed resize-y text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">What Failed</label>
            <textarea
              value={whatFailed}
              onChange={(e) => setWhatFailed(e.target.value)}
              disabled={summary.locked}
              className="w-full h-24 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed resize-y text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Most Repetitive Issue</label>
            <textarea
              value={mostRepetitiveIssue}
              onChange={(e) => setMostRepetitiveIssue(e.target.value)}
              disabled={summary.locked}
              className="w-full h-24 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed resize-y text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Red Flags</label>
            <textarea
              value={redFlags}
              onChange={(e) => setRedFlags(e.target.value)}
              disabled={summary.locked}
              className="w-full h-24 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed resize-y text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Victory Moment</label>
            <textarea
              value={victoryMoment}
              onChange={(e) => setVictoryMoment(e.target.value)}
              disabled={summary.locked}
              className="w-full h-24 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed resize-y text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correction for Next Week</label>
            <textarea
              value={correctionNextWeek}
              onChange={(e) => setCorrectionNextWeek(e.target.value)}
              disabled={summary.locked}
              className="w-full h-24 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed resize-y text-sm"
            />
          </div>
        </div>
    </div>
  );
}
