"use client";
import React, { useState, useEffect } from "react";
import { Goal } from "@prisma/client";
import { updateGoal, deleteGoal } from "@/lib/actions/goal";
import { useDebounce } from "@/hooks/useDebounce";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

export default function GoalCard({ 
  goal, 
  sprintEndDate,
  locked,
  onDelete
}: { 
  goal: Goal;
  sprintEndDate: Date;
  locked: boolean;
  onDelete: (id: string) => void;
}) {
  const [goalText, setGoalText] = useState(goal.goalText);
  const [successLooksLike, setSuccessLooksLike] = useState(goal.successLooksLike);
  const [whyImportant, setWhyImportant] = useState(goal.whyImportant);
  const [isLearningGoal, setIsLearningGoal] = useState(goal.isLearningGoal);
  
  const debouncedText = useDebounce(goalText, 500);
  const debouncedSuccess = useDebounce(successLooksLike, 500);
  const debouncedWhy = useDebounce(whyImportant, 500);

  const datePickerRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!datePickerRef.current || locked) return;
    const fp = flatpickr(datePickerRef.current, {
      defaultDate: goal.deadline,
      dateFormat: "Y-m-d",
      onChange: (selectedDates) => {
        if (selectedDates[0]) {
          updateGoal(goal.id, { deadline: selectedDates[0] });
        }
      }
    });
    return () => fp.destroy();
  }, [goal.deadline, goal.id, locked]);

  useEffect(() => {
    if (debouncedText !== goal.goalText || 
        debouncedSuccess !== goal.successLooksLike || 
        debouncedWhy !== goal.whyImportant || 
        isLearningGoal !== goal.isLearningGoal) {
      updateGoal(goal.id, {
        goalText: debouncedText,
        successLooksLike: debouncedSuccess,
        whyImportant: debouncedWhy,
        isLearningGoal
      });
    }
  }, [debouncedText, debouncedSuccess, debouncedWhy, isLearningGoal, goal]);

  return (
    <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative">
      {!locked && (
        <button 
          onClick={() => {
            deleteGoal(goal.id);
            onDelete(goal.id);
          }}
          className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition"
          title="Delete Goal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      )}
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-bold dark:bg-brand-900 dark:text-brand-300">
          {goal.orderIndex}
        </span>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Goal</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            disabled={locked}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed"
            placeholder="What is the goal?"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Success Looks Like</label>
          <textarea
            value={successLooksLike}
            onChange={(e) => setSuccessLooksLike(e.target.value)}
            disabled={locked}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition min-h-[80px] disabled:opacity-75 disabled:cursor-not-allowed"
            placeholder="How will you know you've achieved it?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Why Important</label>
            <input
              type="text"
              value={whyImportant}
              onChange={(e) => setWhyImportant(e.target.value)}
              disabled={locked}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed"
              placeholder="Why does this matter?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
            <input
              ref={datePickerRef}
              type="text"
              disabled={locked}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id={`learning-${goal.id}`}
            checked={isLearningGoal}
            onChange={(e) => setIsLearningGoal(e.target.checked)}
            disabled={locked}
            className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
          />
          <label htmlFor={`learning-${goal.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            This is a Learning Goal
          </label>
        </div>
      </div>
    </div>
  );
}
