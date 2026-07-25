"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createSprint } from "@/lib/actions/sprint";

export default function NewSprintPage() {
  const router = useRouter();
  const [sprintName, setSprintName] = useState("");
  const [northStar, setNorthStar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintName || !northStar) return;
    
    setIsSubmitting(true);
    try {
      await createSprint({ sprintName, northStar });
      router.push("/setup");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Sprint</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sprint Name
          </label>
          <input
            type="text"
            value={sprintName}
            onChange={(e) => setSprintName(e.target.value)}
            placeholder="e.g. Q3 Mastery Sprint"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            North Star
          </label>
          <textarea
            value={northStar}
            onChange={(e) => setNorthStar(e.target.value)}
            placeholder="What is your overriding mission for the next 12 weeks?"
            required
            className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition resize-y"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !sprintName || !northStar}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Initialize Sprint"}
          </button>
        </div>
      </form>
    </div>
  );
}
