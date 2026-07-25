"use client";
import React, { useState, useEffect } from "react";
import { SixWeekSummary, Sprint } from "@prisma/client";
import { updateSixWeekSummary } from "@/lib/actions/sixWeekSummary";
import { useDebounce } from "@/hooks/useDebounce";

export default function NorthStarReview({
  summary,
  originalNorthStar
}: {
  summary: SixWeekSummary;
  originalNorthStar: string;
}) {
  const [adjustments, setAdjustments] = useState(summary.adjustmentsForNextBlock || "");
  const [stillAccurate, setStillAccurate] = useState(summary.northStarStillAccurate ?? true);
  const [updatedNorthStar, setUpdatedNorthStar] = useState(summary.updatedNorthStarText || "");

  const debouncedAdjustments = useDebounce(adjustments, 500);
  const debouncedUpdated = useDebounce(updatedNorthStar, 500);

  useEffect(() => {
    updateSixWeekSummary(summary.id, {
      adjustmentsForNextBlock: debouncedAdjustments,
      northStarStillAccurate: stillAccurate,
      updatedNorthStarText: debouncedUpdated,
    });
  }, [
    debouncedAdjustments,
    stillAccurate,
    debouncedUpdated,
    summary.id
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">North Star & Adjustments</h2>
      
      {summary.blockNumber === 1 ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Adjustments for Next Block (Weeks 7-12)
          </label>
          <textarea
            value={adjustments}
            onChange={(e) => setAdjustments(e.target.value)}
            className="w-full h-24 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition resize-y text-sm"
            placeholder="What needs to change for the second half of the sprint?"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Original North Star</h4>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{originalNorthStar}</p>
          </div>
          
          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={stillAccurate}
                onChange={(e) => setStillAccurate(e.target.checked)}
                className="w-5 h-5 text-brand-600 bg-white border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Is this North Star still accurate for your next 12-week sprint?
              </span>
            </label>

            {!stillAccurate && (
              <div className="mt-4 p-4 border border-brand-200 dark:border-brand-900/30 bg-brand-50/50 dark:bg-brand-900/10 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rewrite North Star for Next Sprint
                </label>
                <textarea
                  value={updatedNorthStar}
                  onChange={(e) => setUpdatedNorthStar(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition resize-y text-sm"
                  placeholder="Draft your new North Star here..."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
