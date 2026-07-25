"use client";
import React, { useState, useEffect } from "react";
import { SixWeekSummary } from "@prisma/client";
import { updateSixWeekSummary } from "@/lib/actions/sixWeekSummary";
import { useDebounce } from "@/hooks/useDebounce";

export default function BlockReflections({ summary }: { summary: SixWeekSummary }) {
  const [biggestWin, setBiggestWin] = useState(summary.biggestWin || "");
  const [biggestFailure, setBiggestFailure] = useState(summary.biggestFailure || "");

  const debouncedWin = useDebounce(biggestWin, 500);
  const debouncedFailure = useDebounce(biggestFailure, 500);

  useEffect(() => {
    updateSixWeekSummary(summary.id, {
      biggestWin: debouncedWin,
      biggestFailure: debouncedFailure,
    });
  }, [debouncedWin, debouncedFailure, summary.id]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Block Reflections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biggest Win</label>
          <textarea
            value={biggestWin}
            onChange={(e) => setBiggestWin(e.target.value)}
            className="w-full h-32 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition resize-y text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biggest Failure / Lesson</label>
          <textarea
            value={biggestFailure}
            onChange={(e) => setBiggestFailure(e.target.value)}
            className="w-full h-32 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition resize-y text-sm"
          />
        </div>
      </div>
    </div>
  );
}
