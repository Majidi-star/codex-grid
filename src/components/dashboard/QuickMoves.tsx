"use client";
import React from "react";
import { Move, Leftover } from "@prisma/client";
import { toggleMove } from "@/lib/actions/move";

export default function QuickMoves({
  moves,
  leftovers,
  locked
}: {
  moves: Move[];
  leftovers: Leftover[];
  locked: boolean;
}) {
  const handleToggle = async (id: string, currentStatus: boolean) => {
    if (locked) return;
    await toggleMove(id, !currentStatus);
  };

  const sortedMoves = [...moves].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Today&apos;s Moves</h2>
        {sortedMoves.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No moves logged for today yet.</p>
        ) : (
          <div className="space-y-2">
            {sortedMoves.map((move) => (
              <div
                key={move.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition ${
                  move.done 
                    ? "bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800" 
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={move.done}
                    onChange={() => handleToggle(move.id, move.done)}
                    disabled={locked}
                    className="w-5 h-5 text-brand-600 bg-white border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-800 dark:border-gray-600 cursor-pointer disabled:cursor-not-allowed transition"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${
                    move.done 
                      ? "text-gray-400 dark:text-gray-500 line-through" 
                      : "text-gray-900 dark:text-gray-100"
                  }`}>
                    {move.taskText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {leftovers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Leftovers from Yesterday</h3>
          <div className="space-y-2">
            {leftovers.map(leftover => (
              <div
                key={leftover.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10"
              >
                <div className="pt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={false}
                    disabled={true}
                    className="w-5 h-5 bg-white border-gray-300 rounded opacity-50 cursor-not-allowed dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {leftover.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
