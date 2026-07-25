"use client";
import React, { useState, useEffect } from "react";
import { updateNorthStar } from "@/lib/actions/northStar";
import { NorthStar } from "@prisma/client";
import { useDebounce } from "@/hooks/useDebounce";

export default function NorthStarCard({ 
  northStar,
  locked
}: { 
  northStar: NorthStar;
  locked: boolean;
}) {
  const [statement, setStatement] = useState(northStar.statement);
  
  const debouncedStatement = useDebounce(statement, 500);

  useEffect(() => {
    if (debouncedStatement !== northStar.statement) {
      updateNorthStar(northStar.id, { statement: debouncedStatement });
    }
  }, [debouncedStatement, northStar.id, northStar.statement]);

  return (
    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">The North Star</h2>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-500 rounded-l-md"></div>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          disabled={locked}
          className="w-full pl-6 pr-4 py-4 text-2xl md:text-3xl italic font-serif text-gray-800 dark:text-gray-100 bg-transparent border-none focus:ring-0 resize-none min-h-[120px] outline-none disabled:opacity-75 disabled:cursor-not-allowed"
          placeholder="What is the overarching mission for this 12-week sprint?"
        />
      </div>
    </div>
  );
}
