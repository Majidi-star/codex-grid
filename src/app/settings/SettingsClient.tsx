"use client";
import React, { useState } from "react";
import { updateLLMSettings } from "@/lib/actions/llmSettings";

type LLMSettings = {
  provider: string;
  endpointUrl: string;
  apiKey: string | null;
  modelName: string;
  systemPrompt: string | null;
  proxyEnabled: boolean;
  proxyUrl: string | null;
};

export default function SettingsClient({ initialSettings }: { initialSettings: LLMSettings }) {
  const [provider, setProvider] = useState(initialSettings.provider);
  const [endpointUrl, setEndpointUrl] = useState(initialSettings.endpointUrl);
  const [apiKey, setApiKey] = useState(initialSettings.apiKey || "");
  const [modelName, setModelName] = useState(initialSettings.modelName);
  const [systemPrompt, setSystemPrompt] = useState(initialSettings.systemPrompt || "");
  const [proxyEnabled, setProxyEnabled] = useState(initialSettings.proxyEnabled || false);
  const [proxyUrl, setProxyUrl] = useState(initialSettings.proxyUrl || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateLLMSettings({
        provider,
        endpointUrl,
        apiKey: apiKey.trim() === "" ? null : apiKey,
        modelName,
        systemPrompt: systemPrompt.trim() === "" ? null : systemPrompt,
        proxyEnabled,
        proxyUrl: proxyUrl.trim() === "" ? null : proxyUrl
      });
      setMessage("Settings saved successfully!");
    } catch (e: any) {
      setMessage("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">AI Agent Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider Format</label>
          <select 
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="ollama">Ollama (Local)</option>
            <option value="openai">OpenAI Compatible (OpenAI, Anthropic, Groq, Custom)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint URL</label>
          <input 
            type="text"
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            placeholder={provider === "ollama" ? "http://localhost:11434/api/chat" : "https://api.openai.com/v1/chat/completions"}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key (Optional for local)</label>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model Name</label>
          <input 
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder={provider === "ollama" ? "llama3" : "gpt-4o"}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input 
              type="checkbox"
              checked={proxyEnabled}
              onChange={(e) => setProxyEnabled(e.target.checked)}
              className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable SOCKS5 Proxy for LLM APIs</span>
          </label>
          {proxyEnabled && (
            <input 
              type="text"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="socks5://127.0.0.1:1080"
              className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom System Prompt Addition</label>
          <textarea 
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            placeholder="Any extra instructions for your AI..."
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 mt-2">
            The AI automatically receives your entire Codex and active Sprint data as context. This is just for extra instructions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {message && (
            <span className={message.includes("success") ? "text-green-500" : "text-red-500"}>
              {message}
            </span>
          )}
        </div>
      </div>

      <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Model Context Protocol (MCP)</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Sprint OS includes a built-in MCP Server. This allows external LLMs (like Claude Desktop) to connect directly to your local database to read your Codex, manage Sprints, and log your daily Moves.
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
          <p className="font-semibold mb-2">How to connect Claude Desktop:</p>
          <p className="mb-2 text-gray-500 text-xs">Add the following to your claude_desktop_config.json:</p>
          <pre>
{`{
  "mcpServers": {
    "sprint-os": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "C:\\\\Projects\\\\codex-grid"
    }
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
