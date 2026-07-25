"use client";
import React, { useState, useEffect } from "react";
import { WeeklySummary } from "@prisma/client";
import { updateWeeklySummary } from "@/lib/actions/weeklySummary";
import { useDebounce } from "@/hooks/useDebounce";
import { SKILL_STAGE } from "@/lib/enums";

export default function LearningSection({ summary }: { summary: WeeklySummary }) {
  const [skillStage, setSkillStage] = useState(summary.skillStage || "");
  const [vsGreatsComparison, setVsGreatsComparison] = useState(summary.vsGreatsComparison || "");
  const [needMoreChallenge, setNeedMoreChallenge] = useState(summary.needMoreChallenge || false);
  const [needScheduleUpdate, setNeedScheduleUpdate] = useState(summary.needScheduleUpdate || false);
  const [analyzedMistakeLedger, setAnalyzedMistakeLedger] = useState(summary.analyzedMistakeLedger || false);

  const debouncedComparison = useDebounce(vsGreatsComparison, 500);

  useEffect(() => {
    updateWeeklySummary(summary.id, {
      skillStage,
      vsGreatsComparison: debouncedComparison,
      needMoreChallenge,
      needScheduleUpdate,
      analyzedMistakeLedger,
    });
  }, [
    skillStage,
    debouncedComparison,
    needMoreChallenge,
    needScheduleUpdate,
    analyzedMistakeLedger,
    summary.id
  ]);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Learning & Practice</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Skill Stage
            <span className="ml-2 text-xs text-gray-400 font-normal italic" title="Stay Associative to keep growing">(Stay Associative to keep growing)</span>
          </label>
          <select
            value={skillStage}
            onChange={(e) => setSkillStage(e.target.value)}
            disabled={summary.locked}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <option value="">-</option>
            {SKILL_STAGE.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">How vs. the Greats</label>
          <input
            type="text"
            value={vsGreatsComparison}
            onChange={(e) => setVsGreatsComparison(e.target.value)}
            disabled={summary.locked}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
          />
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={needMoreChallenge}
              onChange={(e) => setNeedMoreChallenge(e.target.checked)}
              disabled={summary.locked}
              className="w-5 h-5 text-brand-600 bg-white border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Need More Challenge</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={needScheduleUpdate}
              onChange={(e) => setNeedScheduleUpdate(e.target.checked)}
              disabled={summary.locked}
              className="w-5 h-5 text-brand-600 bg-white border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Need Schedule Update</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analyzedMistakeLedger}
              onChange={(e) => setAnalyzedMistakeLedger(e.target.checked)}
              disabled={summary.locked}
              className="w-5 h-5 text-brand-600 bg-white border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Analyzed Mistake Ledger</span>
          </label>
        </div>
      </div>
    </div>
  );
}
