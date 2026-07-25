"use client";
import React, { useState, useEffect } from "react";
import { WeeklySummary } from "@prisma/client";
import { updateWeeklySummary } from "@/lib/actions/weeklySummary";
import { useDebounce } from "@/hooks/useDebounce";
import { ENERGY_LEVEL } from "@/lib/enums";

export default function WeeklyStateStrip({ summary }: { summary: WeeklySummary }) {
  const [energyLevel, setEnergyLevel] = useState(summary.energyLevel || "");
  const [motivation, setMotivation] = useState(summary.motivation ?? 5);
  const [trustInGoal, setTrustInGoal] = useState(summary.trustInGoal ?? 50);
  const [manifestSentence, setManifestSentence] = useState(summary.manifestSentence || "");
  const [reviewedCodexBook, setReviewedCodexBook] = useState(summary.reviewedCodexBook || false);

  const debouncedManifest = useDebounce(manifestSentence, 500);

  useEffect(() => {
    updateWeeklySummary(summary.id, {
      energyLevel,
      motivation,
      trustInGoal,
      manifestSentence: debouncedManifest,
      reviewedCodexBook,
    });
  }, [
    energyLevel,
    motivation,
    trustInGoal,
    debouncedManifest,
    reviewedCodexBook,
    summary.id
  ]);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">State Strip</h2>
      <div className="flex flex-col gap-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Energy Level</label>
          <select
            value={energyLevel}
            onChange={(e) => setEnergyLevel(e.target.value)}
            disabled={summary.locked}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <option value="">-</option>
            {ENERGY_LEVEL.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivation (1-10): {motivation}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={motivation}
            onChange={(e) => setMotivation(parseInt(e.target.value, 10))}
            disabled={summary.locked}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trust in Goal (0-100%): {trustInGoal}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={trustInGoal}
            onChange={(e) => setTrustInGoal(parseInt(e.target.value, 10))}
            disabled={summary.locked}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
          />
        </div>
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={reviewedCodexBook}
              onChange={(e) => setReviewedCodexBook(e.target.checked)}
              disabled={summary.locked}
              className="w-5 h-5 text-brand-600 bg-white border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reviewed Codex Book</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manifest Sentence</label>
          <input
            type="text"
            value={manifestSentence}
            onChange={(e) => setManifestSentence(e.target.value)}
            disabled={summary.locked}
            placeholder="I am..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
