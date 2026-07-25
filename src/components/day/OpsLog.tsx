"use client";
import React, { useState, useEffect } from "react";
import { DailyLog, OpsLogEntry } from "@prisma/client";
import { updateDailyLog } from "@/lib/actions/dailyLog";
import { createOpsLogEntry, updateOpsLogEntry, deleteOpsLogEntry } from "@/lib/actions/opsLog";
import { useDebounce } from "@/hooks/useDebounce";

function OpsLogRow({ entry, locked }: { entry: OpsLogEntry; locked: boolean }) {
  const [startTime, setStartTime] = useState(entry.startTime);
  const [endTime, setEndTime] = useState(entry.endTime);
  const [activity, setActivity] = useState(entry.activity);
  const [activityType, setActivityType] = useState<string>(entry.activityType || "other");

  const debouncedText = useDebounce(activity, 500);

  useEffect(() => {
    if (debouncedText !== entry.activity || 
        startTime !== entry.startTime || 
        endTime !== entry.endTime || 
        activityType !== (entry.activityType || "other")) {
      updateOpsLogEntry(entry.id, {
        startTime,
        endTime,
        activity: debouncedText,
        activityType: activityType as any
      });
    }
  }, [debouncedText, startTime, endTime, activityType, entry]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
      <div className="flex gap-2 sm:w-1/3">
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          disabled={locked}
          className="w-1/2 px-2 py-1.5 text-sm border border-gray-200 rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
        />
        <span className="text-gray-400 self-center">-</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          disabled={locked}
          className="w-1/2 px-2 py-1.5 text-sm border border-gray-200 rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:w-2/3">
        <input
          type="text"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          disabled={locked}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
          placeholder="Activity description"
        />
        <div className="flex gap-2">
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            disabled={locked}
            className="px-2 py-1.5 text-sm border border-gray-200 rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <option value="deep_work">Deep Work</option>
            <option value="work">Work</option>
            <option value="rest">Rest</option>
            <option value="other">Other</option>
          </select>
          {!locked && (
            <button 
              onClick={() => deleteOpsLogEntry(entry.id)}
              className="text-gray-400 hover:text-red-500 px-1 transition"
              title="Delete block"
            >
              &times;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OpsLog({ 
  dailyLog, 
  entries,
  locked 
}: { 
  dailyLog: DailyLog; 
  entries: OpsLogEntry[];
  locked: boolean;
}) {
  const [useFreeform, setUseFreeform] = useState(dailyLog.useFreeformOpsLog || false);
  const [freeformText, setFreeformText] = useState(dailyLog.freeformOpsLog || "");
  const [isAdding, setIsAdding] = useState(false);

  const debouncedFreeform = useDebounce(freeformText, 500);

  useEffect(() => {
    if (debouncedFreeform !== (dailyLog.freeformOpsLog || "")) {
      updateDailyLog(dailyLog.id, { freeformOpsLog: debouncedFreeform });
    }
  }, [debouncedFreeform, dailyLog]);

  const handleToggleMode = async (checked: boolean) => {
    setUseFreeform(checked);
    await updateDailyLog(dailyLog.id, { useFreeformOpsLog: checked });
  };

  const handleAddBlock = async () => {
    setIsAdding(true);
    try {
      await createOpsLogEntry({
        dailyLogId: dailyLog.id,
        startTime: "09:00",
        endTime: "10:00",
        activity: "New Activity",
        activityType: "work"
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ops Log</h2>
          <p className="text-xs text-gray-500 mt-0.5">Tag as Deep Work or Work to include in weekly totals</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="freeform-toggle" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            Freeform
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              id="freeform-toggle"
              checked={useFreeform}
              onChange={(e) => handleToggleMode(e.target.checked)}
              disabled={locked}
              className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 dark:border-gray-600 checked:right-0 checked:border-brand-500 disabled:opacity-75"
            />
            <label
              htmlFor="freeform-toggle"
              className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
            ></label>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            .toggle-checkbox:checked { right: 0; border-color: #3b82f6; }
            .toggle-checkbox:checked + .toggle-label { background-color: #93c5fd; }
            .toggle-checkbox { right: 20px; z-index: 1; transition: all 0.3s; }
            .toggle-label { transition: all 0.3s; }
          `}} />
        </div>
      </div>

      {useFreeform ? (
        <textarea
          value={freeformText}
          onChange={(e) => setFreeformText(e.target.value)}
          disabled={locked}
          placeholder="Log your activities here..."
          className="w-full h-64 p-4 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:border-brand-500 transition disabled:opacity-75 disabled:cursor-not-allowed resize-y"
        />
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <OpsLogRow key={entry.id} entry={entry} locked={locked} />
          ))}
          {!locked && (
            <button
              onClick={handleAddBlock}
              disabled={isAdding}
              className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              + Add block
            </button>
          )}
        </div>
      )}
    </div>
  );
}
