"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DayNavigator({ currentDay }: { currentDay: number }) {
  const [value, setValue] = useState(currentDay.toString());
  const router = useRouter();

  useEffect(() => {
    setValue(currentDay.toString());
  }, [currentDay]);

  const handleNavigate = (val: string) => {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 84) {
      if (parsed !== currentDay) {
        router.push(`/day/${parsed}`);
      }
    } else {
      setValue(currentDay.toString());
    }
  };

  return (
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
      Day
      <input
        type="number"
        min={1}
        max={84}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleNavigate(e.currentTarget.value);
          }
        }}
        onBlur={(e) => {
          handleNavigate(e.currentTarget.value);
        }}
        className="w-16 bg-transparent border-b-2 border-dashed border-gray-300 dark:border-gray-600 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-center appearance-none p-0 m-0"
        style={{
          MozAppearance: 'textfield'
        }}
      />
      <span className="text-gray-400">/84</span>
    </h1>
  );
}
