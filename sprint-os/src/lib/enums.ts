export const SPRINT_STATUS = ["active", "completed", "abandoned"] as const;
export type SprintStatus = (typeof SPRINT_STATUS)[number];

export const ENERGY_LEVEL = ["High", "Medium", "Low"] as const;
export type EnergyLevel = (typeof ENERGY_LEVEL)[number];

export const CODEX_LAW = ["Law1", "Law2", "Law3", "None"] as const;
export type CodexLaw = (typeof CODEX_LAW)[number];

export const SKILL_STAGE = ["Cognitive", "Associative", "Autonomous"] as const;
export type SkillStage = (typeof SKILL_STAGE)[number];
