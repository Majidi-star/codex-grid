"use client";
import React, { useState, useEffect } from "react";
import { NextWeekBattle } from "@prisma/client";
import { upsertNextWeekBattle } from "@/lib/actions/nextWeekBattle";
import { useDebounce } from "@/hooks/useDebounce";

function BattleInput({
  weeklySummaryId,
  orderIndex,
  initialText,
  locked
}: {
  weeklySummaryId: string;
  orderIndex: number;
  initialText: string;
  locked: boolean;
}) {
  const [text, setText] = useState(initialText);
  const debouncedText = useDebounce(text, 500);

  useEffect(() => {
    if (debouncedText !== initialText) {
      upsertNextWeekBattle(weeklySummaryId, orderIndex, debouncedText);
    }
  }, [debouncedText, initialText, weeklySummaryId, orderIndex]);

  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 text-xs font-bold shrink-0">
        {orderIndex}
      </span>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={locked}
        placeholder={`Battle ${orderIndex} for next week`}
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default function NextWeekBattles({
  weeklySummaryId,
  battles,
  locked
}: {
  weeklySummaryId: string;
  battles: NextWeekBattle[];
  locked: boolean;
}) {
  const getBattleText = (index: number) => {
    return battles.find(b => b.orderIndex === index)?.battleText || "";
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top 3 Battles for Next Week</h2>
      <div className="space-y-3">
        {[1, 2, 3].map(index => (
          <BattleInput
            key={index}
            weeklySummaryId={weeklySummaryId}
            orderIndex={index}
            initialText={getBattleText(index)}
            locked={locked}
          />
        ))}
      </div>
    </div>
  );
}
