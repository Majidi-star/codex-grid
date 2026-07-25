import React from "react";
import { getAllCodexLaws } from "@/lib/actions/codexLaw";
import CodexClient from "./CodexClient";

export default async function CodexPage() {
  const laws = await getAllCodexLaws();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Codex Laws</h1>
        <p className="text-gray-500 mt-1">Manage the principles and laws that govern your sprints.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <CodexClient initialLaws={laws} />
      </div>
    </div>
  );
}
