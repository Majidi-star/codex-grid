"use client";
import React, { useState, useEffect, useRef } from "react";
import { WeeklyPlanRow } from "@prisma/client";
import { updateWeeklyPlanRow } from "@/lib/actions/weeklyPlanRow";

export function difficultyBandColor(n: number | null): string {
  if (n === null) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  if (n <= 3) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (n <= 6) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

function EditableCell({ 
  value, 
  onSave, 
  type = "text",
  options = []
}: { 
  value: string | number | null; 
  onSave: (val: string | number | null) => void;
  type?: "text" | "number" | "select";
  options?: number[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState(value || "");
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (currentVal !== (value || "")) {
      if (type === "number" || type === "select") {
        onSave(currentVal ? Number(currentVal) : null);
      } else {
        onSave(currentVal.toString());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setCurrentVal(value || "");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (type === "select") {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={currentVal}
          onChange={(e) => setCurrentVal(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-sm border-brand-500 rounded outline-none dark:bg-gray-800 dark:text-white"
        >
          <option value="">-</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type === "number" ? "number" : "text"}
        value={currentVal}
        onChange={(e) => setCurrentVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 text-sm border-brand-500 rounded outline-none dark:bg-gray-800 dark:text-white"
      />
    );
  }

  return (
    <div 
      className="cursor-pointer px-2 py-1 min-h-[1.5rem] hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition"
      onClick={() => setIsEditing(true)}
    >
      {type === "select" && value !== null ? (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyBandColor(value as number)}`}>
          {value}
        </span>
      ) : (
        value || <span className="text-gray-400 italic">Empty</span>
      )}
    </div>
  );
}

export default function RoadmapTable({ 
  rows,
  currentWeekNumber
}: { 
  rows: WeeklyPlanRow[];
  currentWeekNumber: number;
}) {
  const [localRows, setLocalRows] = useState(rows);

  const handleUpdate = async (id: string, field: keyof WeeklyPlanRow, value: any) => {
    setLocalRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    await updateWeeklyPlanRow(id, { [field]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
            <tr>
              <th className="px-6 py-4">Week No</th>
              <th className="px-6 py-4 w-1/3">Focus Area</th>
              <th className="px-6 py-4 w-1/3">Delivery</th>
              <th className="px-6 py-4 text-center">Difficulty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {localRows.map((row) => (
              <tr 
                key={row.id} 
                className={`${row.weekNumber === currentWeekNumber ? 'bg-brand-50 dark:bg-brand-900/10' : ''}`}
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  Week {row.weekNumber}
                  {row.weekNumber === currentWeekNumber && (
                    <span className="flex w-2 h-2 rounded-full bg-brand-500"></span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <EditableCell 
                    value={row.focusArea} 
                    onSave={(val) => handleUpdate(row.id, "focusArea", val)} 
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableCell 
                    value={row.delivery} 
                    onSave={(val) => handleUpdate(row.id, "delivery", val)} 
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <EditableCell 
                    type="select"
                    options={[1,2,3,4,5,6,7,8,9,10]}
                    value={row.difficulty} 
                    onSave={(val) => handleUpdate(row.id, "difficulty", val)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
