import React from "react";
import { getLLMSettings } from "@/lib/actions/llmSettings";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getLLMSettings();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your Sprint OS environment and AI Agent.</p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  );
}
