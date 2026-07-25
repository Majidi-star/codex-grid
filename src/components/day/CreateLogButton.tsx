"use client";
import React, { useState } from "react";
import { createDailyLog } from "@/lib/actions/dailyLog";

export default function CreateLogButton({
  sprintId,
  dayNumber,
  date
}: {
  sprintId: string;
  dayNumber: number;
  date: Date;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await createDailyLog({
        sprintId,
        dayNumber,
        date
      });
    } catch (error) {
      console.error("Failed to create log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isLoading}
      className="px-8 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-70 text-white font-semibold rounded-xl shadow-sm transition"
    >
      {isLoading ? "Creating..." : "Create Log"}
    </button>
  );
}
