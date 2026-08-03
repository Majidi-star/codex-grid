"use client";
import React, { useState, useEffect } from "react";
import { updateDailyLog } from "@/lib/actions/dailyLog";
import { DailyLog, NorthStar } from "@prisma/client";

// Levenshtein distance calculation
const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
};

const getSimilarity = (s1: string, s2: string): number => {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - getLevenshteinDistance(longer, shorter)) / longerLength;
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const checkCloseEnough = (typed: string, target: string): boolean => {
  const normTyped = normalizeText(typed);
  const normTarget = normalizeText(target);
  
  if (!normTyped) return false;
  if (normTyped === normTarget) return true;

  // 1. Character-based similarity (Levenshtein distance >= 75%)
  const levSim = getSimilarity(normTyped, normTarget);
  if (levSim >= 0.75) return true;

  // 2. Word-based overlap similarity (overlap >= 75% of target words)
  const typedWords = new Set(normTyped.split(" "));
  const targetWords = normTarget.split(" ");
  if (targetWords.length === 0) return false;

  let matchCount = 0;
  for (const word of targetWords) {
    if (typedWords.has(word)) {
      matchCount++;
    }
  }

  const wordOverlap = matchCount / targetWords.length;
  if (wordOverlap >= 0.75) return true;

  return false;
};

export default function NorthStarStrip({
  northStar,
  dailyLog
}: {
  northStar: NorthStar;
  dailyLog: DailyLog;
}) {
  const [typedText, setTypedText] = useState("");
  const [reaffirmed, setReaffirmed] = useState(dailyLog.northStarReaffirmed);

  useEffect(() => {
    const saved = localStorage.getItem(`northstar_typed_${dailyLog.id}`);
    if (saved) {
      setTypedText(saved);
      const isMatch = checkCloseEnough(saved, northStar.statement);
      setReaffirmed(isMatch || dailyLog.northStarReaffirmed);
    } else {
      setTypedText(dailyLog.northStarReaffirmed ? northStar.statement : "");
      setReaffirmed(dailyLog.northStarReaffirmed);
    }
  }, [dailyLog.id, dailyLog.northStarReaffirmed, northStar.statement]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedText(val);
    localStorage.setItem(`northstar_typed_${dailyLog.id}`, val);
    
    // Check if it matches close enough
    const isMatch = checkCloseEnough(val, northStar.statement);
    
    if (isMatch !== reaffirmed) {
      setReaffirmed(isMatch);
      await updateDailyLog(dailyLog.id, { northStarReaffirmed: isMatch });
    }
  };

  return (
    <div className="bg-brand-50 dark:bg-brand-900/10 p-5 rounded-2xl mb-8 border border-brand-100 dark:border-brand-800/30 shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
            Daily North Star Reaffirmation
          </span>
          <p className="text-gray-800 dark:text-gray-200 font-serif italic text-lg select-all">
            &ldquo;{northStar.statement}&rdquo;
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={typedText}
              onChange={handleChange}
              placeholder="Type your North Star statement exactly to reaffirm..."
              className={`w-full px-4 py-2 text-sm rounded-xl border outline-none transition bg-white dark:bg-gray-900 dark:text-white ${
                reaffirmed 
                  ? "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20" 
                  : "border-gray-200 focus:border-brand-500 dark:border-gray-700"
              }`}
            />
            {reaffirmed && (
              <span className="absolute right-3 top-2.5 text-emerald-500 text-xs font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                ✓ Reaffirmed
              </span>
            )}
          </div>
          {!reaffirmed && (
            <span className="text-xs text-gray-500 dark:text-gray-400 sm:w-48 text-center sm:text-left">
              Type the statement above to unlock your day.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

