export const SPRINT_STATUS = ["active", "completed", "abandoned"] as const;
export type SprintStatus = (typeof SPRINT_STATUS)[number];

export const ENERGY_LEVEL = ["High", "Medium", "Low"] as const;
export type EnergyLevel = (typeof ENERGY_LEVEL)[number];


export const SKILL_STAGE = ["Cognitive", "Associative", "Autonomous"] as const;
export type SkillStage = (typeof SKILL_STAGE)[number];
