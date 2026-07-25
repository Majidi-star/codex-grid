"use client";
import React, { useState, useEffect } from "react";
import { SixWeekSummary } from "@prisma/client";
import { updateSixWeekSummary, computeBlockAutoSums } from "@/lib/actions/sixWeekSummary";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { useDebounce } from "@/hooks/useDebounce";

export default function BlockMetrics({ summary }: { summary: SixWeekSummary }) {
  const [deepWorkHours, setDeepWorkHours] = useState(summary.aggregateDeepWorkHours?.toString() || "0");
  const [workHours, setWorkHours] = useState(summary.aggregateWorkHours?.toString() || "0");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isComputing, setIsComputing] = useState(false);

  const debouncedDeep = useDebounce(deepWorkHours, 500);
  const debouncedWork = useDebounce(workHours, 500);

  useEffect(() => {
    if (summary.aggregateDeepWorkHours === null || summary.aggregateWorkHours === null) {
      computeBlockAutoSums(summary.sprintId, summary.blockNumber, false).then(updated => {
        if (updated) {
          setDeepWorkHours(updated.aggregateDeepWorkHours?.toString() || "0");
          setWorkHours(updated.aggregateWorkHours?.toString() || "0");
        }
      });
    }
  }, [summary.sprintId, summary.blockNumber, summary.aggregateDeepWorkHours, summary.aggregateWorkHours]);

  useEffect(() => {
    if (debouncedDeep !== summary.aggregateDeepWorkHours?.toString() || debouncedWork !== summary.aggregateWorkHours?.toString()) {
      updateSixWeekSummary(summary.id, {
        aggregateDeepWorkHours: parseFloat(debouncedDeep) || 0,
        aggregateWorkHours: parseFloat(debouncedWork) || 0,
      });
    }
  }, [debouncedDeep, debouncedWork, summary.id, summary.aggregateDeepWorkHours, summary.aggregateWorkHours]);

  const handleRecompute = async () => {
    setIsComputing(true);
    setShowConfirm(false);
    try {
      const updated = await computeBlockAutoSums(summary.sprintId, summary.blockNumber, true);
      if (updated) {
        setDeepWorkHours(updated.aggregateDeepWorkHours?.toString() || "0");
        setWorkHours(updated.aggregateWorkHours?.toString() || "0");
      }
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Block Aggregates</h2>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isComputing}
          className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition disabled:opacity-50"
        >
          {isComputing ? "Computing..." : "Recompute from Weeks"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deep Work Hours (6 weeks)</label>
          <input
            type="number"
            step="0.1"
            value={deepWorkHours}
            onChange={(e) => setDeepWorkHours(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Work Hours (6 weeks)</label>
          <input
            type="number"
            step="0.1"
            value={workHours}
            onChange={(e) => setWorkHours(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Recompute Aggregates?"
        message="This will overwrite your manual edits with the sum of your 6 Weekly Summaries. Are you sure?"
        confirmText="Recompute"
        onConfirm={handleRecompute}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
