"use client";
import React, { useState, useEffect } from "react";
import { Goal, WeeklyGoalProgress } from "@prisma/client";
import { upsertWeeklyGoalProgress } from "@/lib/actions/weeklyGoalProgress";
import { useDebounce } from "@/hooks/useDebounce";

function GoalProgressRow({
  weeklySummaryId,
  goal,
  progress,
  locked,
}: {
  weeklySummaryId: string;
  goal: Goal;
  progress: WeeklyGoalProgress | undefined;
  locked: boolean;
}) {
  const [progressPercent, setProgressPercent] = useState(progress?.progressPercent?.toString() || "");
  const [expectedText, setExpectedText] = useState(progress?.expectedText || "");
  const [evidenceText, setEvidenceText] = useState(progress?.evidenceText || "");

  const debouncedPercent = useDebounce(progressPercent, 500);
  const debouncedExpected = useDebounce(expectedText, 500);
  const debouncedEvidence = useDebounce(evidenceText, 500);

  useEffect(() => {
    // Wait until there's a valid percentage before upserting initially to avoid 0% junk data
    if (debouncedPercent) {
      upsertWeeklyGoalProgress(weeklySummaryId, goal.id, {
        progressPercent: parseInt(debouncedPercent, 10) || 0,
        expectedText: debouncedExpected,
        evidenceText: debouncedEvidence,
      });
    }
  }, [debouncedPercent, debouncedExpected, debouncedEvidence, weeklySummaryId, goal.id]);

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition">
      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 align-top max-w-[200px] truncate" title={goal.goalText}>
        {goal.goalText}
      </td>
      <td className="py-3 px-4 align-top w-28">
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            value={progressPercent}
            onChange={(e) => setProgressPercent(e.target.value)}
            disabled={locked}
            className="w-full px-3 py-1.5 border border-gray-200 rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
        </div>
      </td>
      <td className="py-3 px-4 align-top">
        <textarea
          value={expectedText}
          onChange={(e) => setExpectedText(e.target.value)}
          disabled={locked}
          placeholder="What did you expect?"
          className="w-full min-h-[60px] px-3 py-1.5 text-sm border border-gray-200 rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed resize-y"
        />
      </td>
      <td className="py-3 px-4 align-top">
        <textarea
          value={evidenceText}
          onChange={(e) => setEvidenceText(e.target.value)}
          disabled={locked}
          placeholder="Link or evidence"
          className="w-full min-h-[60px] px-3 py-1.5 text-sm border border-gray-200 rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed resize-y"
        />
      </td>
    </tr>
  );
}

export default function GoalProgressTable({
  weeklySummaryId,
  goals,
  progressList,
  locked,
}: {
  weeklySummaryId: string;
  goals: Goal[];
  progressList: WeeklyGoalProgress[];
  locked: boolean;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Goal Progress</h2>
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="py-3 px-4 font-semibold w-1/4">Goal</th>
            <th className="py-3 px-4 font-semibold w-28">Progress %</th>
            <th className="py-3 px-4 font-semibold">Expected</th>
            <th className="py-3 px-4 font-semibold">Evidence (Link/Text)</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => {
            const progress = progressList.find((p) => p.goalId === goal.id);
            return (
              <GoalProgressRow
                key={goal.id}
                weeklySummaryId={weeklySummaryId}
                goal={goal}
                progress={progress}
                locked={locked}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
