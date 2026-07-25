"use client";
import React, { useState } from "react";
import { CodexLaw, CodexBlade, CodexBladePrinciple, CodexProfile } from "@prisma/client";
import { createCodexLaw, updateCodexLaw, deleteCodexLaw } from "@/lib/actions/codexLaw";
import { 
  createCodexBlade, updateCodexBlade, deleteCodexBlade, 
  createCodexBladePrinciple, updateCodexBladePrinciple, deleteCodexBladePrinciple,
  updateCodexProfile 
} from "@/lib/actions/codex";

type BladeWithPrinciples = CodexBlade & { principles: CodexBladePrinciple[] };

export default function CodexClient({ 
  initialDoctrineLaws, 
  initialGateKeeperLaws,
  initialBlades,
  initialProfile
}: { 
  initialDoctrineLaws: CodexLaw[],
  initialGateKeeperLaws: CodexLaw[],
  initialBlades: BladeWithPrinciples[],
  initialProfile: CodexProfile
}) {
  const [doctrineLaws, setDoctrineLaws] = useState<CodexLaw[]>(initialDoctrineLaws);
  const [gateKeeperLaws, setGateKeeperLaws] = useState<CodexLaw[]>(initialGateKeeperLaws);
  const [blades, setBlades] = useState<BladeWithPrinciples[]>(initialBlades);
  const [profile, setProfile] = useState<CodexProfile>(initialProfile);

  // States for adding
  const [isAddingDoctrine, setIsAddingDoctrine] = useState(false);
  const [isAddingGateKeeper, setIsAddingGateKeeper] = useState(false);
  const [isAddingBlade, setIsAddingBlade] = useState(false);
  const [addingPrincipleToBladeId, setAddingPrincipleToBladeId] = useState<string | null>(null);

  // General add states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Profile edit states
  const [isEditingLongTerm, setIsEditingLongTerm] = useState(false);
  const [tempLongTerm, setTempLongTerm] = useState(profile.longTermGoal || "");

  const [isEditingFinalMission, setIsEditingFinalMission] = useState(false);
  const [tempFinalMission, setTempFinalMission] = useState(profile.finalMission || "");

  const [isSigning, setIsSigning] = useState(false);
  const [tempSignatureName, setTempSignatureName] = useState(profile.signatureName || "");

  // =====================
  // LAW HANDLERS
  // =====================
  const handleAddLaw = async (type: "doctrine" | "gatekeeper") => {
    if (!newTitle.trim()) return;
    const law = await createCodexLaw({ title: newTitle, description: newDescription, type });
    if (type === "doctrine") setDoctrineLaws([...doctrineLaws, law]);
    else setGateKeeperLaws([...gateKeeperLaws, law]);
    
    setIsAddingDoctrine(false);
    setIsAddingGateKeeper(false);
    setNewTitle("");
    setNewDescription("");
  };

  const handleUpdateLaw = async (id: string, updates: Partial<CodexLaw>, type: "doctrine" | "gatekeeper") => {
    const updated = await updateCodexLaw(id, updates);
    if (type === "doctrine") setDoctrineLaws(doctrineLaws.map(l => l.id === id ? updated : l));
    else setGateKeeperLaws(gateKeeperLaws.map(l => l.id === id ? updated : l));
    setEditingId(null);
  };

  const handleDeleteLaw = async (id: string, type: "doctrine" | "gatekeeper") => {
    if (confirm("Are you sure you want to delete this law?")) {
      await deleteCodexLaw(id);
      if (type === "doctrine") setDoctrineLaws(doctrineLaws.filter(l => l.id !== id));
      else setGateKeeperLaws(gateKeeperLaws.filter(l => l.id !== id));
    }
  };

  // =====================
  // BLADE HANDLERS
  // =====================
  const handleAddBlade = async () => {
    if (!newTitle.trim()) return;
    const blade = await createCodexBlade({ title: newTitle, orderIndex: blades.length });
    setBlades([...blades, { ...blade, principles: [] }]);
    setIsAddingBlade(false);
    setNewTitle("");
  };

  const handleDeleteBlade = async (id: string) => {
    if (confirm("Delete this blade and all its principles?")) {
      await deleteCodexBlade(id);
      setBlades(blades.filter(b => b.id !== id));
    }
  };

  const handleAddPrinciple = async (bladeId: string) => {
    if (!newTitle.trim()) return;
    const blade = blades.find(b => b.id === bladeId);
    const principle = await createCodexBladePrinciple({ 
      bladeId, 
      title: newTitle, 
      description: newDescription,
      orderIndex: blade?.principles.length || 0 
    });
    setBlades(blades.map(b => b.id === bladeId ? { ...b, principles: [...b.principles, principle] } : b));
    setAddingPrincipleToBladeId(null);
    setNewTitle("");
    setNewDescription("");
  };

  const handleDeletePrinciple = async (bladeId: string, principleId: string) => {
    if (confirm("Delete this principle?")) {
      await deleteCodexBladePrinciple(principleId);
      setBlades(blades.map(b => b.id === bladeId ? { ...b, principles: b.principles.filter(p => p.id !== principleId) } : b));
    }
  };

  // =====================
  // PROFILE HANDLERS
  // =====================
  const handleSaveProfile = async (updates: Partial<CodexProfile>) => {
    const updated = await updateCodexProfile(updates);
    setProfile(updated);
  };


  // =====================
  // RENDERERS
  // =====================
  const renderLawSection = (title: string, laws: CodexLaw[], type: "doctrine" | "gatekeeper", isAdding: boolean, setIsAdding: (v: boolean) => void) => (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white border-b-2 border-brand-500 pb-2 inline-block uppercase tracking-wider">{title}</h2>
        <button onClick={() => setIsAdding(true)} className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 font-medium rounded transition text-sm">
          + Add
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 border-l-4 border-brand-500 bg-gray-50 dark:bg-gray-800 shadow-sm rounded-r-lg">
          <div className="space-y-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title (e.g. My word is a contract)"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              placeholder="Description (optional)"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
            />
            <div className="flex gap-2">
              <button onClick={() => handleAddLaw(type)} className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm">Save</button>
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-500 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {laws.map((law) => (
          <div key={law.id} className="group p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:shadow-md transition">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{law.title}</h3>
                {law.description && <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{law.description}</p>}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => handleDeleteLaw(law.id, type)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-16 pb-24">
      
      {/* SECTION 1: PERSONAL DOCTRINE */}
      {renderLawSection("1. The Personal Doctrine", doctrineLaws, "doctrine", isAddingDoctrine, setIsAddingDoctrine)}

      {/* SECTION 2: THE BLADES */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white border-b-2 border-brand-500 pb-2 inline-block uppercase tracking-wider">2. The Blades</h2>
          <button onClick={() => setIsAddingBlade(true)} className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 font-medium rounded transition text-sm">
            + Add Blade
          </button>
        </div>

        {isAddingBlade && (
          <div className="mb-6 p-4 border-l-4 border-brand-500 bg-gray-50 dark:bg-gray-800 shadow-sm rounded-r-lg">
            <div className="flex gap-3">
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Blade Title (e.g. The Philosopher-King Core)" className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2" />
              <button onClick={handleAddBlade} className="px-4 py-2 bg-brand-500 text-white rounded-lg">Save</button>
              <button onClick={() => setIsAddingBlade(false)} className="px-4 py-2 text-gray-500">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {blades.map((blade, idx) => (
            <div key={blade.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-brand-500">Blade {idx + 1}:</span> {blade.title}
                </h3>
                <div className="flex gap-3">
                  <button onClick={() => setAddingPrincipleToBladeId(blade.id)} className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">+ Principle</button>
                  <button onClick={() => handleDeleteBlade(blade.id)} className="text-sm font-medium text-red-500 hover:underline">Delete Blade</button>
                </div>
              </div>

              <div className="p-6">
                {addingPrincipleToBladeId === blade.id && (
                  <div className="mb-6 p-4 border border-brand-200 dark:border-brand-900/50 bg-brand-50 dark:bg-brand-900/10 rounded-lg">
                    <div className="space-y-3">
                      <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Principle Title (e.g. Death Acceptance)" className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" />
                      <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={2} placeholder="Description" className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" />
                      <div className="flex gap-2">
                        <button onClick={() => handleAddPrinciple(blade.id)} className="px-3 py-1.5 bg-brand-500 text-white rounded text-sm">Save</button>
                        <button onClick={() => setAddingPrincipleToBladeId(null)} className="px-3 py-1.5 text-gray-500 text-sm">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}

                <ul className="space-y-4">
                  {blade.principles.map(p => (
                    <li key={p.id} className="flex gap-4 group">
                      <div className="w-2 h-2 mt-2 rounded-full bg-brand-500 flex-shrink-0"></div>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white">{p.title}</span>
                        {p.description && <span className="text-gray-600 dark:text-gray-400 ml-2">— {p.description}</span>}
                      </div>
                      <button onClick={() => handleDeletePrinciple(blade.id, p.id)} className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 text-xs transition">Remove</button>
                    </li>
                  ))}
                  {blade.principles.length === 0 && <p className="text-gray-500 italic">No principles added yet.</p>}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: THE GATE KEEPER */}
      {renderLawSection("3. The Gate Keeper", gateKeeperLaws, "gatekeeper", isAddingGateKeeper, setIsAddingGateKeeper)}

      {/* SECTION 4: LONG-TERM GOAL */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white border-b-2 border-brand-500 pb-2 inline-block uppercase tracking-wider">4. Long-Term Goal</h2>
          {!isEditingLongTerm && (
            <button onClick={() => setIsEditingLongTerm(true)} className="px-3 py-1.5 text-brand-600 dark:text-brand-400 font-medium hover:underline text-sm">Edit</button>
          )}
        </div>
        {isEditingLongTerm ? (
          <div className="space-y-3">
            <textarea value={tempLongTerm} onChange={(e) => setTempLongTerm(e.target.value)} rows={4} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500" placeholder="I have built an empire..." />
            <div className="flex gap-2">
              <button onClick={() => { handleSaveProfile({ longTermGoal: tempLongTerm }); setIsEditingLongTerm(false); }} className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium">Save Goal</button>
              <button onClick={() => { setIsEditingLongTerm(false); setTempLongTerm(profile.longTermGoal || ""); }} className="px-4 py-2 text-gray-500">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-brand-900 to-brand-800 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl">🎯</div>
            <p className="text-xl md:text-2xl font-medium leading-relaxed italic relative z-10">
              {profile.longTermGoal ? `"${profile.longTermGoal}"` : "Define your long-term goal..."}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 5: FINAL MISSION */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white border-b-2 border-brand-500 pb-2 inline-block uppercase tracking-wider">5. Final Mission</h2>
          {!isEditingFinalMission && (
            <button onClick={() => setIsEditingFinalMission(true)} className="px-3 py-1.5 text-brand-600 dark:text-brand-400 font-medium hover:underline text-sm">Edit</button>
          )}
        </div>
        {isEditingFinalMission ? (
          <div className="space-y-3">
            <textarea value={tempFinalMission} onChange={(e) => setTempFinalMission(e.target.value)} rows={4} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500" placeholder="My ultimate life mission is..." />
            <div className="flex gap-2">
              <button onClick={() => { handleSaveProfile({ finalMission: tempFinalMission }); setIsEditingFinalMission(false); }} className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium">Save Mission</button>
              <button onClick={() => { setIsEditingFinalMission(false); setTempFinalMission(profile.finalMission || ""); }} className="px-4 py-2 text-gray-500">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-900 to-black text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl">⚔️</div>
            <p className="text-xl md:text-2xl font-medium leading-relaxed italic relative z-10">
              {profile.finalMission ? `"${profile.finalMission}"` : "Define your final life mission..."}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 6: SIGNATURE */}
      <div className="mt-24 border-t-2 border-dashed border-gray-300 dark:border-gray-700 pt-16 max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-[0.2em]">The Covenant</h2>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-loose mb-12">
          I, <span className="font-bold border-b border-gray-400 px-2">{profile.signatureName || "[Your Name]"}</span>, sign this codex on <span className="font-bold border-b border-gray-400 px-2">{profile.signatureDate ? new Date(profile.signatureDate).toLocaleDateString() : "[Date]"}</span>. 
          I commit to reading it weekly. I commit living or dying trying to become worthy of it. 
          This is my constitution, my anchor, my true north.
        </p>

        {isSigning ? (
          <div className="flex flex-col items-center gap-4">
            <input type="text" value={tempSignatureName} onChange={(e) => setTempSignatureName(e.target.value)} placeholder="Enter your full name" className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-center text-lg font-serif" />
            <div className="flex gap-2">
              <button onClick={() => { handleSaveProfile({ signatureName: tempSignatureName, signatureDate: new Date() }); setIsSigning(false); }} className="px-6 py-2 bg-brand-500 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition">Sign Contract</button>
              <button onClick={() => setIsSigning(false)} className="px-6 py-2 text-gray-500">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {profile.signatureName ? (
              <div className="inline-block relative">
                <span className="font-serif italic text-5xl text-brand-700 dark:text-brand-400 -rotate-2 inline-block px-8 py-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl">
                  {profile.signatureName}
                </span>
                <p className="text-sm text-gray-400 mt-2">Signed & Sealed</p>
                <button onClick={() => setIsSigning(true)} className="text-xs text-gray-400 hover:text-brand-500 underline mt-4">Resign</button>
              </div>
            ) : (
              <button onClick={() => setIsSigning(true)} className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Sign The Codex
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
