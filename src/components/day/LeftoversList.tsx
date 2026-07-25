"use client";
import React, { useState, useEffect } from "react";
import { Leftover } from "@prisma/client";
import { updateLeftover, deleteLeftover } from "@/lib/actions/leftover";

function LeftoverRow({ leftover }: { leftover: Leftover }) {
  const [description, setDescription] = useState(leftover.description);

  useEffect(() => {
    setDescription(leftover.description);
  }, [leftover]);

  const handleBlur = async () => {
    if (description !== leftover.description) {
      if (description.trim() === "") {
        setDescription(leftover.description);
      } else {
        await updateLeftover(leftover.id, { description });
      }
    }
  };

  const handleDelete = async () => {
    await deleteLeftover(leftover.id);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30 transition">
      <div className="text-amber-500" title="Carried over from yesterday">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
      </div>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={handleBlur}
        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-amber-900 dark:text-amber-200 text-sm"
      />
      <button 
        onClick={handleDelete}
        className="text-amber-400 hover:text-amber-600 transition px-2"
        title="Delete Leftover"
      >
        &times;
      </button>
    </div>
  );
}

export default function LeftoversList({ leftovers }: { leftovers: Leftover[] }) {
  if (!leftovers || leftovers.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Leftovers from yesterday</h2>
      <div className="space-y-2">
        {leftovers.map((leftover) => (
          <LeftoverRow key={leftover.id} leftover={leftover} />
        ))}
      </div>
    </div>
  );
}
