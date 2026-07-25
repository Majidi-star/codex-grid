"use client";
import React, { useState } from "react";
import NorthStarCard from "@/components/setup/NorthStarCard";
import GoalCard from "@/components/setup/GoalCard";
import { NorthStar, Goal, Sprint } from "@prisma/client";
import { createGoal } from "@/lib/actions/goal";

export default function SetupPageClient({
  initialNorthStar,
  initialGoals,
  sprint,
  initiallyLocked
}: {
  initialNorthStar: NorthStar;
  initialGoals: Goal[];
  sprint: Sprint;
  initiallyLocked: boolean;
}) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [locked, setLocked] = useState(initiallyLocked);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAddGoal = async () => {
    const newGoal = await createGoal({
      sprintId: sprint.id,
      orderIndex: goals.length + 1,
      goalText: "New Goal",
      successLooksLike: "How to measure success",
      deadline: sprint.endDate,
      whyImportant: "Why this matters",
      isLearningGoal: false
    });
    setGoals([...goals, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleUnlock = () => {
    setShowConfirmModal(true);
  };

  const confirmUnlock = () => {
    setLocked(false);
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Configuration</h2>
        {locked && (
          <button 
            onClick={handleUnlock}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Edit Goals
          </button>
        )}
      </div>

      {initialNorthStar && <NorthStarCard northStar={initialNorthStar} locked={locked} />}

      <div className="space-y-6">
        {goals.map((goal) => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            sprintEndDate={sprint.endDate} 
            locked={locked}
            onDelete={handleDeleteGoal}
          />
        ))}
      </div>

      {!locked && (
        <button
          onClick={handleAddGoal}
          className="mt-6 w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 transition"
        >
          + Add Goal
        </button>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Unlock Goals?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Editing goals mid-sprint is discouraged. Changing the target now could mask a failure to execute. Are you sure you want to unlock?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmUnlock}
                className="px-4 py-2 font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                Unlock to Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
