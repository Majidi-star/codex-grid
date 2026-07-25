import React from "react";
import { getAllCodexLaws } from "@/lib/actions/codexLaw";
import { getCodexBlades, getCodexProfile } from "@/lib/actions/codex";
import CodexClient from "./CodexClient";

export const dynamic = "force-dynamic";

export default async function CodexPage() {
  const doctrineLaws = await getAllCodexLaws("doctrine");
  const gateKeeperLaws = await getAllCodexLaws("gatekeeper");
  const blades = await getCodexBlades();
  const profile = await getCodexProfile();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">The Codex</h1>
        <p className="text-gray-500 mt-2 max-w-2xl mx-auto">This is your constitution, your anchor, your true north. It remains constant across all sprints.</p>
      </div>

      <CodexClient 
        initialDoctrineLaws={doctrineLaws} 
        initialGateKeeperLaws={gateKeeperLaws}
        initialBlades={blades}
        initialProfile={profile}
      />
    </div>
  );
}
