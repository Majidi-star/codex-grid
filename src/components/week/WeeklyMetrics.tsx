"use client";
import React, { useState, useEffect } from "react";
import { WeeklySummary } from "@prisma/client";
import { updateWeeklySummary, computeWeeklyAutoSums } from "@/lib/actions/weeklySummary";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { useDebounce } from "@/hooks/useDebounce";

export default function WeeklyMetrics({ summary }: { summary: WeeklySummary }) {
  const [deepWorkHours, setDeepWorkHours] = useState(summary.totalDeepWorkHours?.toString() || "0");
  const [workHours, setWorkHours] = useState(summary.totalWorkHours?.toString() || "0");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isComputing, setIsComputing] = useState(false);

  const debouncedDeep = useDebounce(deepWorkHours, 500);
  const debouncedWork = useDebounce(workHours, 500);

  useEffect(() => {
    // Only auto-compute on initial load if null
    if (summary.totalDeepWorkHours === null || summary.totalWorkHours === null) {
      computeWeeklyAutoSums(summary.sprintId, summary.weekNumber, false).then(updated => {
        if (updated) {
          setDeepWorkHours(updated.totalDeepWorkHours?.toString() || "0");
          setWorkHours(updated.totalWorkHours?.toString() || "0");
        }
      });
    }
  }, [summary.sprintId, summary.weekNumber, summary.totalDeepWorkHours, summary.totalWorkHours]);

  useEffect(() => {
    if (debouncedDeep !== summary.totalDeepWorkHours?.toString() || debouncedWork !== summary.totalWorkHours?.toString()) {
      updateWeeklySummary(summary.id, {
        totalDeepWorkHours: parseFloat(debouncedDeep) || 0,
        totalWorkHours: parseFloat(debouncedWork) || 0,
      });
    }
  }, [debouncedDeep, debouncedWork, summary.id, summary.totalDeepWorkHours, summary.totalWorkHours]);

  const handleRecompute = async () => {
    setIsComputing(true);
    setShowConfirm(false);
    try {
      const updated = await computeWeeklyAutoSums(summary.sprintId, summary.weekNumber, true);
      if (updated) {
        setDeepWorkHours(updated.totalDeepWorkHours?.toString() || "0");
        setWorkHours(updated.totalWorkHours?.toString() || "0");
      }
    } finally {
      setIsComputing(false);
    }
  };

  const violations = summary.codexViolationCountJson 
    ? JSON.parse(summary.codexViolationCountJson) 
    : {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Metrics</h2>
        {!summary.locked && (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isComputing}
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition disabled:opacity-50"
          >
            {isComputing ? "Computing..." : "Recompute from Logs"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deep Work Hours</label>
          <input
            type="number"
            step="0.1"
            value={deepWorkHours}
            onChange={(e) => setDeepWorkHours(e.target.value)}
            disabled={summary.locked}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            Avg: {((parseFloat(deepWorkHours) || 0) / 7).toFixed(1)} hrs/day
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Work Hours</label>
          <input
            type="number"
            step="0.1"
            value={workHours}
            onChange={(e) => setWorkHours(e.target.value)}
            disabled={summary.locked}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            Avg: {((parseFloat(workHours) || 0) / 7).toFixed(1)} hrs/day
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Codex Violations</h3>
        {Object.keys(violations).length > 0 ? (
          <ul className="space-y-2">
            {Object.entries(violations).map(([law, count]) => (
              <li key={law} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">{law}</span>
                <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">{count as number}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No violations logged this week.</p>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Recompute Metrics?"
        message="This will overwrite your manual edits with values computed from your Daily Logs. Are you sure?"
        confirmText="Recompute"
        onConfirm={handleRecompute}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
