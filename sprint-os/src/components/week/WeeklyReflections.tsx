"use client";
import React, { useState, useEffect } from "react";
import { WeeklySummary } from "@prisma/client";
import { updateWeeklySummary } from "@/lib/actions/weeklySummary";
import { useDebounce } from "@/hooks/useDebounce";
import { ENERGY_LEVEL } from "@/lib/enums";

export default function WeeklyReflections({ summary }: { summary: WeeklySummary }) {
  const [whatWorked, setWhatWorked] = useState(summary.whatWorked || "");
  const [whatFailed, setWhatFailed] = useState(summary.whatFailed || "");
  const [mostRepetitiveIssue, setMostRepetitiveIssue] = useState(summary.mostRepetitiveIssue || "");
  const [redFlags, setRedFlags] = useState(summary.redFlags || "");
  const [victoryMoment, setVictoryMoment] = useState(summary.victoryMoment || "");
  const [correctionNextWeek, setCorrectionNextWeek] = useState(summary.correctionNextWeek || "");

  const [energyLevel, setEnergyLevel] = useState(summary.energyLevel || "");
  const [motivation, setMotivation] = useState(summary.motivation ?? 5);
  const [trustInGoal, setTrustInGoal] = useState(summary.trustInGoal ?? 50);
  const [manifestSentence, setManifestSentence] = useState(summary.manifestSentence || "");
  const [reviewedCodexBook, setReviewedCodexBook] = useState(summary.reviewedCodexBook || false);

  const debouncedWhatWorked = useDebounce(whatWorked, 500);
  const debouncedWhatFailed = useDebounce(whatFailed, 500);
  const debouncedIssue = useDebounce(mostRepetitiveIssue, 500);
  const debouncedRedFlags = useDebounce(redFlags, 500);
  const debouncedVictory = useDebounce(victoryMoment, 500);
  const debouncedCorrection = useDebounce(correctionNextWeek, 500);
  const debouncedManifest = useDebounce(manifestSentence, 500);

  useEffect(() => {
    updateWeeklySummary(summary.id, {
      whatWorked: debouncedWhatWorked,
      whatFailed: debouncedWhatFailed,
      mostRepetitiveIssue: debouncedIssue,
      redFlags: debouncedRedFlags,
      victoryMoment: debouncedVictory,
      correctionNextWeek: debouncedCorrection,
      energyLevel,
      motivation,
      trustInGoal,
      manifestSentence: debouncedManifest,
      reviewedCodexBook,
    });
  }, [
    debouncedWhatWorked,
    debouncedWhatFailed,
    debouncedIssue,
    debouncedRedFlags,
    debouncedVictory,
    debouncedCorrection,
    energyLevel,
    motivation,
    trustInGoal,
    debouncedManifest,
    reviewedCodexBook,
    summary.id
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">State Strip</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
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
          <div className="lg:col-span-4">
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
    </div>
  );
}
