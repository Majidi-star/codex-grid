"use client";
import React, { useState, useEffect } from "react";
import { Move } from "@prisma/client";
import { createMove, updateMove, deleteMove } from "@/lib/actions/move";

function MoveRow({ move }: { move: Move }) {
  const [taskText, setTaskText] = useState(move.taskText);
  const [done, setDone] = useState(move.done);
  
  useEffect(() => {
    setTaskText(move.taskText);
    setDone(move.done);
  }, [move]);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setDone(checked);
    await updateMove(move.id, { done: checked });
  };

  const handleBlur = async () => {
    if (taskText !== move.taskText) {
      if (taskText.trim() === "") {
        // Option to delete or just revert? I'll revert for now.
        setTaskText(move.taskText);
      } else {
        await updateMove(move.id, { taskText });
      }
    }
  };

  const handleDelete = async () => {
    await deleteMove(move.id);
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition ${done ? 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-800' : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 shadow-sm'}`}>
      <input
        type="checkbox"
        checked={done}
        onChange={handleToggle}
        className="w-5 h-5 text-brand-600 bg-white border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
      />
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        onBlur={handleBlur}
        className={`flex-1 bg-transparent border-none outline-none focus:ring-0 ${done ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}
        placeholder="What's the move?"
      />
      <button 
        onClick={handleDelete}
        className="text-gray-400 hover:text-red-500 transition px-2"
        title="Delete Move"
      >
        &times;
      </button>
    </div>
  );
}

export default function MovesList({ 
  moves, 
  dailyLogId 
}: { 
  moves: Move[];
  dailyLogId: string;
}) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (moves.length >= 5) return;
    setIsAdding(true);
    try {
      await createMove({ dailyLogId, taskText: "New Move" });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daily Moves</h2>
        <span className="text-sm text-gray-500">{moves.length}/5</span>
      </div>
      
      <div className="space-y-3 mb-4">
        {moves.map(move => (
          <MoveRow key={move.id} move={move} />
        ))}
      </div>

      <button
        onClick={handleAdd}
        disabled={moves.length >= 5 || isAdding}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Add Move
      </button>
    </div>
  );
}
