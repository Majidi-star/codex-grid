"use client";
import React, { useState } from "react";
import { CodexLaw } from "@prisma/client";
import { createCodexLaw, updateCodexLaw, deleteCodexLaw } from "@/lib/actions/codexLaw";

export default function CodexClient({ initialLaws }: { initialLaws: CodexLaw[] }) {
  const [laws, setLaws] = useState<CodexLaw[]>(initialLaws);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    const law = await createCodexLaw({ title: newTitle, description: newDescription });
    setLaws([...laws, law]);
    setIsAdding(false);
    setNewTitle("");
    setNewDescription("");
  };

  const handleUpdate = async (id: string, updates: Partial<CodexLaw>) => {
    const updated = await updateCodexLaw(id, updates);
    setLaws(laws.map(l => l.id === id ? updated : l));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this law? This may affect historical data.")) {
      await deleteCodexLaw(id);
      setLaws(laws.filter(l => l.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Laws</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition text-sm"
        >
          + Add New Law
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Deep Work Only"
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                placeholder="Provide more details about what this law means..."
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition text-sm"
              >
                Save Law
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {laws.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No Codex Laws defined yet. Add some to govern your sprints.
          </div>
        ) : (
          laws.map((law) => (
            <div key={law.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {editingId === law.id ? (
                <div className="flex-1 w-full space-y-3">
                  <input
                    type="text"
                    defaultValue={law.title}
                    id={`title-${law.id}`}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white"
                  />
                  <textarea
                    defaultValue={law.description || ""}
                    id={`desc-${law.id}`}
                    rows={2}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const title = (document.getElementById(`title-${law.id}`) as HTMLInputElement).value;
                        const desc = (document.getElementById(`desc-${law.id}`) as HTMLTextAreaElement).value;
                        handleUpdate(law.id, { title, description: desc });
                      }}
                      className="px-3 py-1.5 bg-brand-500 text-white text-xs font-medium rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{law.title}</h3>
                      {!law.isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 rounded-full dark:bg-gray-700 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    {law.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{law.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdate(law.id, { isActive: !law.isActive })}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                        law.isActive 
                          ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" 
                          : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      }`}
                    >
                      {law.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => setEditingId(law.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(law.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 dark:border-red-900/30 dark:text-red-400 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
