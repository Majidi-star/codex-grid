# Sprint OS — Antigravity Pre-Flight Package

---

## 1. PROJECT BRIEF

Sprint OS is a single-user, local-first web app that replaces a paper notebook for running 84-day ("12-Week Sprint") execution cycles, with nested Day → Week → Six-Week-Block → Sprint tracking and trend charts (energy, Codex-law violations, deep-work hours, goal progress). It is a **new, greenfield project** — nothing is being added to an existing codebase.

**Stack and rationale:**
- **Next.js 14 (App Router) + TypeScript** — file-based routing maps cleanly onto the `/day/[dayNumber]`, `/week/[weekNumber]/summary`, `/block/[blockNumber]` structure; Server Actions remove the need for a separate API layer for a single-user app.
- **TailAdmin (Next.js/Tailwind template)** — already the user's preferred UI kit; ships tables, forms, cards, and chart wrappers so we aren't building design systems from scratch. Note: TailAdmin is a *template repo*, not an npm package — see Task 1.
- **Prisma ORM + SQLite** — zero-config, single file, no server process; correct for a single local user, and trivial to back up (copy one `.db` file).
- **ApexCharts (via `react-apexcharts`)** — TailAdmin's default charting library, and it natively supports the combo bar+dashed-line chart needed in §8.5 of the source blueprint.
- **No auth** — explicitly single-user, local machine.
- **Server Actions over REST API routes** — for a local single-user app, Next.js Server Actions give direct typed function calls from Server/Client Components without hand-rolled `fetch` + route handlers, less boilerplate, same result.

**Assumptions made (proceeding without stopping):**
1. This is a new project, built from an empty directory — no existing repo, conventions, or files to reconcile with.
2. Node.js 20.x LTS and npm (not pnpm/yarn) — consistent with the blueprint's plain `npm run dev` deployment note.
3. SQLite does not support Prisma's native `enum` type reliably across all tooling — enums (`SprintStatus`, `EnergyLevel`, `CodexLaw`, `SkillStage`) are modeled as `String` fields in the schema, with allowed values enforced in a shared TypeScript/Zod layer (`lib/enums.ts`). This avoids a class of migration errors regardless of current Prisma/SQLite enum support status.
4. "Enforce one active Sprint at a time" is done in application logic (a check inside the `createSprint` action), not a DB-level partial unique index, to avoid raw-SQL migrations.
5. Sprint auto-completion (day 84 → `status: completed`) is implemented as a check-on-read in the data-fetching layer, not a background cron job — appropriate for an app opened interactively in a browser, not a long-running server.
6. Electron wrapping, PDF export, and cross-sprint analytics are explicitly **Phase 2** per the source blueprint (§10) and are **out of scope** for this task list — do not build them.

---

## 2. TASK LIST

- [ ] 1. Scaffold Next.js + TypeScript project; pull in TailAdmin components; install all dependencies
- [ ] 2. Write Prisma schema (all 12 models) and run initial migration
- [ ] 3. Write seed script with one active Sprint + partial realistic sample data
- [ ] 4. Build shared date/week/block math utilities (`lib/date.ts`)
- [ ] 5. Build shared enum definitions and Zod schemas (`lib/enums.ts`)
- [ ] 6. Build the "active sprint" data-fetching helper, incl. auto-completion check
- [ ] 7. Build root layout + sidebar navigation shell (TailAdmin chrome)
- [ ] 8. Build `/setup` page: North Star hero card + Goal cards
- [ ] 9. Build Server Actions for NorthStar + Goal, incl. sprint-start lock
- [ ] 10. Build `/roadmap` page: 12-row editable table with progress bar
- [ ] 11. Build Server Actions for WeeklyPlanRow (inline-edit CRUD)
- [ ] 12. Build `/day/[dayNumber]` page skeleton (header, north-star strip, two-column layout)
- [ ] 13. Build Moves component + Server Actions (max 5, ordered, toggle-done)
- [ ] 14. Build Leftover auto-carry logic + Leftovers component
- [ ] 15. Build Ops Log component (repeatable time blocks + freeform toggle) + Server Actions
- [ ] 16. Build Day-End Review form section + Server Action
- [ ] 17. Implement Save & Lock Day + unlock-confirm flow
- [ ] 18. Build `/week/[weekNumber]/summary` page skeleton + unlock-after-day-7 logic
- [ ] 19. Build weekly auto-sum computation (hours + Codex violation counts) with manual override
- [ ] 20. Build Goal Progress table + WeeklyGoalProgress Server Actions
- [ ] 21. Build reflection block, Next Week Battles, and state-strip sliders
- [ ] 22. Build conditional Learning Section
- [ ] 23. Implement weekly Save & Lock (reuses pattern from Task 17)
- [ ] 24. Build `/block/[blockNumber]` page + aggregate stat computation
- [ ] 25. Build Goal Progress Trend chart (ApexCharts line, custom legend, fixed colors)
- [ ] 26. Build Codex Violation Trend chart (stacked bar) for the block page
- [ ] 27. Build North Star versioning (re-write flow + Archive history)
- [ ] 28. Build Dashboard stat-card row (day-counter ring, focus badge, deep-work bar, energy pill)
- [ ] 29. Build Dashboard Moves quick-complete + Leftovers preview
- [ ] 30. Build Codex Violation Heatmap component (84-cell grid)
- [ ] 31. Build Deep-Work-Hours-vs-Target combo chart (shared by Week Summary + Dashboard)
- [ ] 32. Build 7-day Energy Sparkline
- [ ] 33. Assemble `/` Dashboard page from Tasks 28–32
- [ ] 34. Build Sprint completion, `/sprint/new`, and `/sprint/archive` (read-only reuse)
- [ ] 35. Final integration pass: nav wiring, empty states, error boundaries, full click-through

---

## 3. IMPLEMENTATION PLAN

### 3.0 Shared conventions (apply to every task below — do not re-derive per task)

**Project root:** `sprint-os/`

**Directory layout:**
```
sprint-os/
  prisma/
    schema.prisma
    seed.ts
  src/
    app/
      layout.tsx
      page.tsx                          (Dashboard)
      setup/page.tsx
      roadmap/page.tsx
      day/[dayNumber]/page.tsx
      week/[weekNumber]/summary/page.tsx
      block/[blockNumber]/page.tsx
      sprint/new/page.tsx
      sprint/archive/page.tsx
      sprint/archive/[sprintId]/... (read-only mirror routes, see Task 34)
    components/
      layout/Sidebar.tsx
      layout/Topbar.tsx
      setup/NorthStarCard.tsx
      setup/GoalCard.tsx
      roadmap/RoadmapTable.tsx
      day/DayHeader.tsx
      day/MovesList.tsx
      day/LeftoversList.tsx
      day/OpsLog.tsx
      day/DayEndReview.tsx
      week/GoalProgressTable.tsx
      week/NextWeekBattles.tsx
      week/LearningSection.tsx
      block/GoalTrendChart.tsx
      block/CodexTrendChart.tsx
      dashboard/StatCards.tsx
      dashboard/CodexHeatmap.tsx
      dashboard/DeepWorkChart.tsx
      dashboard/EnergySparkline.tsx
      shared/LockButton.tsx
      shared/ConfirmModal.tsx
    lib/
      prisma.ts
      date.ts
      enums.ts
      sprint.ts               (getActiveSprint + completion check)
      actions/
        sprint.ts
        northStar.ts
        goal.ts
        weeklyPlanRow.ts
        dailyLog.ts
        move.ts
        leftover.ts
        opsLog.ts
        weeklySummary.ts
        weeklyGoalProgress.ts
        nextWeekBattle.ts
        sixWeekSummary.ts
    types/index.ts
```

**Shared Server Action pattern** (every simple-CRUD task below follows this exactly — don't reinvent it per entity):
```ts
// lib/actions/<entity>.ts
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const <Entity>InputSchema = z.object({ /* fields per model, see §3.x */ });

export async function create<Entity>(input: z.infer<typeof <Entity>InputSchema>) {
  const data = <Entity>InputSchema.parse(input);
  const record = await prisma.<entity>.create({ data });
  revalidatePath("<owning-page-path>");
  return record;
}

export async function update<Entity>(id: string, input: Partial<z.infer<typeof <Entity>InputSchema>>) {
  const data = <Entity>InputSchema.partial().parse(input);
  const record = await prisma.<entity>.update({ where: { id }, data });
  revalidatePath("<owning-page-path>");
  return record;
}

export async function delete<Entity>(id: string) {
  await prisma.<entity>.delete({ where: { id } });
  revalidatePath("<owning-page-path>");
}
```
All mutation inputs are validated with Zod before hitting Prisma — do not skip validation "since it's local-only."

**Do NOT** build a separate REST API (`app/api/**/route.ts`) for any of these entities — Server Actions are sufficient and simpler. The only acceptable exception is if a future export/integration needs a stable HTTP contract, which is explicitly Phase 2.

---

### Task 1 — Scaffold project + TailAdmin + dependencies
```bash
npx create-next-app@14.2.5 sprint-os --typescript --tailwind --app --src-dir --import-alias "@/*"
cd sprint-os
npm install prisma@5.15.0 @prisma/client@5.15.0
npm install apexcharts@3.49.1 react-apexcharts@1.4.1
npm install date-fns@3.6.0 zod@3.23.8 clsx@2.1.1
npx prisma init --datasource-provider sqlite
```
**TailAdmin note:** TailAdmin is distributed as a full template repository, not an npm package — do not run `npm install tailadmin`, it does not exist. Instead, clone `https://github.com/TailAdmin/free-nextjs-admin-dashboard-tailwind` into a scratch directory and copy over only: `tailwind.config.ts` (merge, don't overwrite, the config `create-next-app` generated), and the layout/UI components under its `src/components` and `src/layout` folders (Sidebar, Header, Card, DataTable, Badge, form inputs, Range slider). **Do not** copy TailAdmin's own demo routes/pages — only its component library and layout chrome. Place copied components under `src/components/tailadmin/` to keep them distinguishable from app-specific components.

**Do NOT** add authentication scaffolding, NextAuth, or any login-adjacent package — this is explicitly a no-auth app.

---

### Task 2 — Prisma schema + migration
`prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Sprint {
  id               String   @id @default(cuid())
  startDate        DateTime
  endDate          DateTime
  status           String   @default("active") // see lib/enums.ts: active|completed|abandoned
  createdAt        DateTime @default(now())

  northStars       NorthStar[]
  goals            Goal[]
  weeklyPlanRows   WeeklyPlanRow[]
  dailyLogs        DailyLog[]
  weeklySummaries  WeeklySummary[]
  sixWeekSummaries SixWeekSummary[]
}

model NorthStar {
  id        String   @id @default(cuid())
  sprintId  String
  sprint    Sprint   @relation(fields: [sprintId], references: [id])
  statement String
  version   Int      @default(1)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Goal {
  id               String   @id @default(cuid())
  sprintId         String
  sprint           Sprint   @relation(fields: [sprintId], references: [id])
  orderIndex       Int
  goalText         String
  successLooksLike String
  deadline         DateTime
  whyImportant     String

  weeklyProgress   WeeklyGoalProgress[]
}

model WeeklyPlanRow {
  id         String @id @default(cuid())
  sprintId   String
  sprint     Sprint @relation(fields: [sprintId], references: [id])
  weekNumber Int
  focusArea  String
  delivery   String
  difficulty Int

  @@unique([sprintId, weekNumber])
}

model DailyLog {
  id                    String   @id @default(cuid())
  sprintId              String
  sprint                Sprint   @relation(fields: [sprintId], references: [id])
  dayNumber             Int
  date                  DateTime
  weekNumber            Int
  locked                Boolean  @default(false)
  northStarReaffirmed   Boolean  @default(false)
  criticalTarget        String?
  criticalReality       String?
  energyLevel           String?  // High|Medium|Low
  energyWhy             String?
  focusKiller           String?
  solutionForTomorrow   String?
  sleepTime             String?
  codexLawAtRisk        String   @default("None") // Law1|Law2|Law3|None
  preventionMethod      String?
  codexLawViolated      String   @default("None")
  whyViolated           String?
  correctionForTomorrow String?
  useFreeformOpsLog     Boolean  @default(false)
  freeformOpsLog        String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  moves         Move[]
  leftovers     Leftover[]
  opsLogEntries OpsLogEntry[]

  @@unique([sprintId, dayNumber])
}

model Move {
  id         String   @id @default(cuid())
  dailyLogId String
  dailyLog   DailyLog @relation(fields: [dailyLogId], references: [id])
  orderIndex Int
  taskText   String
  done       Boolean  @default(false)

  leftoversSourced Leftover[]
}

model Leftover {
  id           String   @id @default(cuid())
  dailyLogId   String
  dailyLog     DailyLog @relation(fields: [dailyLogId], references: [id])
  sourceMoveId String?
  sourceMove   Move?    @relation(fields: [sourceMoveId], references: [id])
  description  String
}

model OpsLogEntry {
  id           String   @id @default(cuid())
  dailyLogId   String
  dailyLog     DailyLog @relation(fields: [dailyLogId], references: [id])
  startTime    String
  endTime      String
  activity     String
  activityType String?  // "deep_work" | "work" | "rest" | "other"
}

model WeeklySummary {
  id                      String   @id @default(cuid())
  sprintId                String
  sprint                  Sprint   @relation(fields: [sprintId], references: [id])
  weekNumber              Int
  locked                  Boolean  @default(false)
  totalDeepWorkHours      Float?
  totalWorkHours          Float?
  whatWorked              String?
  whatFailed              String?
  mostRepetitiveIssue     String?
  redFlags                String?
  victoryMoment           String?
  correctionNextWeek      String?
  codexViolationCountJson String?  // JSON string {law1,law2,law3}, auto-computed, overridable
  energyLevel             String?
  motivation              Int?
  trustInGoal             Int?
  manifestSentence        String?
  reviewedCodexBook       Boolean  @default(false)
  skillStage              String?  // Cognitive|Associative|Autonomous
  vsGreatsComparison      String?
  needMoreChallenge       Boolean  @default(false)
  needScheduleUpdate      Boolean  @default(false)
  analyzedMistakeLedger   Boolean  @default(false)

  goalProgress WeeklyGoalProgress[]
  battles      NextWeekBattle[]

  @@unique([sprintId, weekNumber])
}

model WeeklyGoalProgress {
  id              String        @id @default(cuid())
  weeklySummaryId String
  weeklySummary   WeeklySummary @relation(fields: [weeklySummaryId], references: [id])
  goalId          String
  goal            Goal          @relation(fields: [goalId], references: [id])
  progressPercent Int
  expectedText    String?
  evidenceText    String?

  @@unique([weeklySummaryId, goalId])
}

model NextWeekBattle {
  id              String        @id @default(cuid())
  weeklySummaryId String
  weeklySummary   WeeklySummary @relation(fields: [weeklySummaryId], references: [id])
  orderIndex      Int
  battleText      String
}

model SixWeekSummary {
  id                      String   @id @default(cuid())
  sprintId                String
  sprint                  Sprint   @relation(fields: [sprintId], references: [id])
  blockNumber             Int
  aggregateDeepWorkHours  Float?
  aggregateWorkHours      Float?
  overallGoalTrendJson    String?
  biggestWin              String?
  biggestFailure          String?
  codexViolationTrendJson String?
  adjustmentsForNextBlock String?
  northStarStillAccurate  Boolean?
  updatedNorthStarText    String?

  @@unique([sprintId, blockNumber])
}
```
Run: `npx prisma migrate dev --name init`.

**Key decision, do not deviate:** enums are `String`, not Prisma `enum` (see Assumption 3 in the brief). Valid values are enforced only in `lib/enums.ts` + Zod schemas, never at the DB level.

---

### Task 3 — Seed script
`prisma/seed.ts`: create one `Sprint` with `startDate = new Date()` minus 10 days (so we're mid-Week-2 on first run), `status: "active"`. Create one `NorthStar` (version 1, isActive true) with placeholder manifest text. Create 3 `Goal` rows. Create 12 `WeeklyPlanRow` rows (week 12 `focusArea: "Buffer"`). Create `DailyLog` rows for `dayNumber` 1 through 10 (today), each with 2–4 `Move` rows (mix of done/not-done), 2–3 `OpsLogEntry` rows with `activityType` set, and randomized `energyLevel` / `codexLawViolated` (mostly `"None"`, a few `"Law2"`) so the heatmap and sparkline aren't empty. Create `Leftover` rows for day 2 onward sourced from the previous day's incomplete moves (mirrors Task 14's runtime logic, done manually here since seed data doesn't go through the app). Create one `WeeklySummary` for week 1 (locked) with `WeeklyGoalProgress` rows for all 3 goals and 3 `NextWeekBattle` rows.
Add to `package.json`: `"prisma": { "seed": "ts-node prisma/seed.ts" }` and install `ts-node@10.9.2` + `@types/node` as dev dependencies. Run `npx prisma db seed`.

---

### Task 4 — `lib/date.ts`
```ts
import { differenceInCalendarDays, addDays } from "date-fns";

export function getDayNumber(sprintStartDate: Date, targetDate: Date = new Date()): number {
  const diff = differenceInCalendarDays(targetDate, sprintStartDate);
  return Math.min(Math.max(diff + 1, 1), 84);
}

export function getWeekNumber(dayNumber: number): number {
  return Math.min(Math.ceil(dayNumber / 7), 12);
}

export function getDateForDayNumber(sprintStartDate: Date, dayNumber: number): Date {
  return addDays(sprintStartDate, dayNumber - 1);
}

export function getBlockNumber(weekNumber: number): 1 | 2 {
  return weekNumber <= 6 ? 1 : 2;
}
```
`dayNumber` and `weekNumber` are **always** derived via these functions, never manually typed into a form — the only manual-entry exception is explicitly back-filling a missed day, where the UI lets the user pick a past, not-yet-logged `dayNumber` from a dropdown of missing days (Task 12 handles this).

---

### Task 5 — `lib/enums.ts`
```ts
export const SPRINT_STATUS = ["active", "completed", "abandoned"] as const;
export type SprintStatus = (typeof SPRINT_STATUS)[number];

export const ENERGY_LEVEL = ["High", "Medium", "Low"] as const;
export type EnergyLevel = (typeof ENERGY_LEVEL)[number];

export const CODEX_LAW = ["Law1", "Law2", "Law3", "None"] as const;
export type CodexLaw = (typeof CODEX_LAW)[number];

export const SKILL_STAGE = ["Cognitive", "Associative", "Autonomous"] as const;
export type SkillStage = (typeof SKILL_STAGE)[number];
```
Import these constants into every Zod schema (`z.enum(ENERGY_LEVEL)`, etc.) instead of re-typing string literals in each action file.

---

### Task 6 — Active-sprint helper + auto-completion
`lib/sprint.ts`:
```ts
import { prisma } from "@/lib/prisma";

export async function getActiveSprint() {
  const sprint = await prisma.sprint.findFirst({ where: { status: "active" } });
  if (!sprint) return null;
  if (new Date() > sprint.endDate) {
    return prisma.sprint.update({ where: { id: sprint.id }, data: { status: "completed" } });
  }
  return sprint;
}
```
Call `getActiveSprint()` at the top of every page that needs "the current sprint" (Dashboard, Roadmap, Setup, Day, Week Summary, Block). If it returns `null`, the page should render an empty-state pointing to `/sprint/new`. **Do not** build a cron job, node-cron dependency, or scheduled task for this — check-on-read is correct for an interactively-opened local app.

---

### Task 7 — Root layout + sidebar
`src/app/layout.tsx`: wraps children in the TailAdmin shell (`Sidebar` + `Topbar` from `components/tailadmin/`), imports global Tailwind CSS. Sidebar links, in order: Dashboard (`/`), Today (`/day/[currentDayNumber]`, computed server-side via `getDayNumber`), Roadmap (`/roadmap`), Weekly Summaries (link to current week's `/week/[n]/summary`), Six-Week Reviews (link to current block's `/block/[n]`), Archive (`/sprint/archive`), Settings (stub page, not otherwise specified — build as a placeholder with just the app version/DB path, nothing else).

---

### Task 8 — `/setup` page
`src/app/setup/page.tsx` (Server Component, fetches active sprint, its `NorthStar` where `isActive: true`, and its `Goal[]` ordered by `orderIndex`).
`components/setup/NorthStarCard.tsx`: large styled textarea bound to `NorthStar.statement`, rendered as a quote block (big serif or italic type, generous padding, subtle accent border-left) — this must look visually distinct from a plain form field, it's the emotional anchor of the app per the source spec.
`components/setup/GoalCard.tsx`: props `{ goal: Goal, sprintEndDate: Date, locked: boolean }`; renders Goal / Success Looks Like / Why Important as text inputs, Deadline as a date picker pre-filled to `sprintEndDate`. "+ Add Goal" button appends a new card with a temporary client-side id until saved.

---

### Task 9 — NorthStar + Goal Server Actions + lock
`lib/actions/northStar.ts`, `lib/actions/goal.ts`: follow the Shared CRUD Pattern (§3.0).
**Lock rule specific to this page:** once `sprint.status === "active"` **and** at least one `DailyLog` exists for that sprint (i.e., the sprint has actually started being logged), all `/setup` fields render read-only, and edits are only reachable through an "Edit Goals" button that opens `components/shared/ConfirmModal.tsx` ("Editing goals mid-sprint is discouraged — are you sure?"). Confirming unlocks the form for that session only; it re-locks on next page load. This is a UI-level gate, not a DB `locked` column — Goal/NorthStar don't need their own `locked` field.

---

### Task 10 — `/roadmap` page
`src/app/roadmap/page.tsx`: fetches active sprint + its 12 `WeeklyPlanRow` rows ordered by `weekNumber`.
`components/roadmap/RoadmapTable.tsx`: TailAdmin data-table styling, 12 rows, click-to-edit cells (click renders an inline `<input>`/`<select>`, blur or Enter saves via Server Action, Escape cancels). Columns: Week No (read-only) | Focus Area (text) | Delivery (text) | Difficulty (1–10, rendered as a colored `Badge`: green if 1–3, amber if 4–6, red if 7–10 — implement this exact banding as a small pure function `difficultyBandColor(n: number)` reused wherever difficulty appears). Week 12's Focus Area defaults to `"Buffer"` from the seed data but remains editable, not hardcoded in the UI layer.
Above the table: a thin horizontal progress bar; width % = `(getDayNumber(sprint.startDate) / 84) * 100`; a marker/label indicates the current week's row.

---

### Task 11 — WeeklyPlanRow Server Actions
`lib/actions/weeklyPlanRow.ts`: only needs `updateWeeklyPlanRow(id, input)` (rows are created once at sprint-start time by the seed/new-sprint flow, never individually created/deleted from this page). Follows §3.0 pattern minus `create`/`delete`.

---

### Task 12 — `/day/[dayNumber]` page skeleton
`src/app/day/[dayNumber]/page.tsx`: parses `dayNumber` from the route param, fetches (or offers to create) the matching `DailyLog`, its `Move[]`, `Leftover[]`, `OpsLogEntry[]`, plus the sprint's active `Goal[]` and `NorthStar`.
`components/day/DayHeader.tsx`: props `{ dayNumber, date, weekNumber }`; renders `Day {dayNumber}/84`, formatted date, week number, and a radial progress ring (`dayNumber/84`) using ApexCharts `radialBar` (same visual language as the Dashboard ring in Task 28 — extract a shared `RadialProgress` component both consume, don't duplicate the SVG/chart config).
North Star strip: read-only text of the active `NorthStar.statement` + a checkbox bound to `DailyLog.northStarReaffirmed`.
Layout: CSS grid, two columns, left ~30% width / right ~70% width on desktop, stacking to one column under 768px.
**Back-fill case:** if the requested `dayNumber` has no existing `DailyLog` and is in the past relative to today's computed day number, show a banner: "Back-filling Day {n} ({date})" and allow manual creation for that specific day only (this is the one legitimate manual-entry path noted in Task 4).

---

### Task 13 — Moves
`components/day/MovesList.tsx`: renders up to 5 `Move` rows, each a checkbox (bound to `done`) + text input (`taskText`), "+ Add move" disabled once 5 exist. Checkbox toggle calls `updateMove(id, { done })` immediately (no separate save step) — text edits save on blur.
`lib/actions/move.ts`: `createMove(dailyLogId, taskText)` auto-assigns `orderIndex = existingCount + 1`; `updateMove`, `deleteMove` per §3.0 pattern. **Do not** allow creating a 6th Move — validate `count < 5` server-side inside `createMove`, not just by disabling the button client-side.

---

### Task 14 — Leftover auto-carry (the one piece of real automation logic — implement carefully)
This is the single most important non-CRUD behavior in the app. When a `DailyLog` for `dayNumber = n` is first created (n > 1), the system must:
1. Find `DailyLog` where `sprintId` matches and `dayNumber = n - 1`.
2. If it exists, query its `Move[]` where `done = false`.
3. For each incomplete Move found, create a `Leftover` row on the new `DailyLog[n]` with `sourceMoveId` = that Move's id and `description` = that Move's `taskText` (copied at creation time, not a live reference — the user may edit the Leftover description independently afterward without mutating the original Move).
4. If `dayNumber = 1` or no prior `DailyLog` exists, skip — no leftovers on day 1.

Implement as part of `createDailyLog` in `lib/actions/dailyLog.ts`, not as a separate cron/trigger:
```ts
export async function createDailyLog(sprintId: string, dayNumber: number, date: Date, weekNumber: number) {
  const log = await prisma.dailyLog.create({ data: { sprintId, dayNumber, date, weekNumber } });
  if (dayNumber > 1) {
    const prevLog = await prisma.dailyLog.findUnique({
      where: { sprintId_dayNumber: { sprintId, dayNumber: dayNumber - 1 } },
      include: { moves: { where: { done: false } } },
    });
    if (prevLog) {
      await prisma.leftover.createMany({
        data: prevLog.moves.map((m) => ({
          dailyLogId: log.id,
          sourceMoveId: m.id,
          description: m.taskText,
        })),
      });
    }
  }
  return log;
}
```
`components/day/LeftoversList.tsx`: renders each `Leftover` with a small "carried over" icon prefix, editable `description` text field, and a remove (delete) button — removing a Leftover does not affect the source `Move`.

---

### Task 15 — Ops Log
`components/day/OpsLog.tsx`: repeatable rows of Start time / End time / Activity text, "+ Add block". A toggle switches the whole section to a single freeform `<textarea>` bound to `DailyLog.useFreeformOpsLog` / `DailyLog.freeformOpsLog` — when the toggle is on, existing `OpsLogEntry` rows are preserved in the DB (not deleted) but hidden from view, so switching back doesn't lose data.
`lib/actions/opsLog.ts`: standard CRUD per §3.0, plus `activityType` as an optional field with values `"deep_work" | "work" | "rest" | "other"` (a plain select next to Activity text) — **this field is required for the weekly auto-sum in Task 19 to work**; flag in the UI (small helper text: "Tag as Deep Work or Work to include in weekly totals") that untagged entries won't be counted.

---

### Task 16 — Day-End Review
`components/day/DayEndReview.tsx`: Sleep Time (text/time input), Codex Law at Risk (select from `CODEX_LAW`), Prevention Method (text input, **rendered only when** `codexLawAtRisk !== "None"`), Codex Law Violated (select), Why Violated (text, rendered only when `codexLawViolated !== "None"`), Correction for Tomorrow (textarea). Also hosts Critical Number (Target/Reality) and Energy Level + Why + Focus Killer + Solution fields from the left column per the source spec — these can live in the same Server Action (`updateDailyLog`) since they all write to the same `DailyLog` row.

---

### Task 17 — Save & Lock Day
`components/shared/LockButton.tsx`: reusable, props `{ locked: boolean, onLock: () => Promise<void>, onUnlock: () => Promise<void> }`. "Save & Lock Day" button calls `updateDailyLog(id, { locked: true, ...allFormFields })`. Once `locked === true`, all inputs on the page render `disabled`, and the button changes to "Unlock to Edit," which opens `ConfirmModal` ("Unlocking will let you edit a historical entry — are you sure?") before calling `updateDailyLog(id, { locked: false })`. This exact component is reused verbatim by `WeeklySummary` in Task 23 — do not write a second lock implementation.

---

### Task 18 — `/week/[weekNumber]/summary` page skeleton
`src/app/week/[weekNumber]/summary/page.tsx`: fetches or creates the `WeeklySummary` row for that week. **Unlock condition:** the page is fully usable once `DailyLog` for `dayNumber = weekNumber * 7` (the week's 7th day) exists, regardless of whether it's locked. If that day's log doesn't exist yet, render the page anyway but show a non-blocking warning banner: "Day 7 of this week hasn't been logged yet — numbers below may be incomplete." (soft warning, not a hard block, per the source spec).

---

### Task 19 — Weekly auto-sum computation
`lib/actions/weeklySummary.ts`, function `computeWeeklyAutoSums(sprintId: string, weekNumber: number)`:
1. Fetch all 7 `DailyLog` rows for that week (`weekNumber` field), including their `opsLogEntries` and their `codexLawViolated` value.
2. `totalDeepWorkHours` = sum of `(endTime - startTime)` in hours for all `OpsLogEntry` rows across those 7 days where `activityType === "deep_work"`.
3. `totalWorkHours` = same, for `activityType === "work"`.
4. `codexViolationCountJson` = `JSON.stringify({ law1: count, law2: count, law3: count })` counting `DailyLog.codexLawViolated` values across the 7 days.
5. These are written into `WeeklySummary` as **defaults only on first computation** (i.e., only set them if the corresponding field is currently `null` — never silently overwrite a value the user has manually edited). Expose a separate "Recompute from logs" button that explicitly overwrites, with a confirm modal, for when the user wants to discard a manual override.
Time math: parse `startTime`/`endTime` strings (`"HH:mm"`) with `date-fns`'s `parse` + `differenceInMinutes`, handle entries crossing midnight by adding 24h if `endTime < startTime`.

---

### Task 20 — Goal Progress table
`components/week/GoalProgressTable.tsx`: one row per `Goal` on the sprint (fetched via the sprint, not the week), columns Progress % (number input 0–100) | Expected (text) | Evidence (text, accepts a pasted link or filename as plain text — no file upload, this is a text field only). Backed by `WeeklyGoalProgress`, upserted per goal (`@@unique([weeklySummaryId, goalId])` from the schema makes this a safe upsert target).
`lib/actions/weeklyGoalProgress.ts`: `upsertWeeklyGoalProgress(weeklySummaryId, goalId, input)` using `prisma.weeklyGoalProgress.upsert`.

---

### Task 21 — Reflection, Battles, state strip
`components/week/NextWeekBattles.tsx`: exactly 3 fixed slots (`orderIndex` 1–3), not a repeatable list — render 3 always-present text inputs, no add/remove UI.
Reflection textareas (What Worked / What Failed / Most Repetitive Issue / Red Flags / Victory Moment / Correction Next Week) and state-strip controls (Energy Level select, Motivation 1–10 range slider, Trust in Goal 0–100% range slider, Manifest one-line text, Reviewed Codex Book checkbox) all write directly to `WeeklySummary` via the same `updateWeeklySummary` action — no separate sub-components needed beyond simple form fields grouped visually.

---

### Task 22 — Conditional Learning Section
`components/week/LearningSection.tsx`: rendered **only if** the sprint has at least one `Goal` whose `goalText` or `successLooksLike` contains a learning-related keyword — since there's no explicit "goal type" field in the schema, add a lightweight heuristic function `isLearningGoal(goal: Goal): boolean` matching case-insensitively against a small fixed keyword list (`["learn", "course", "study", "skill", "certification"]`), OR — the cleaner option — add a `isLearningGoal: Boolean @default(false)` field to the `Goal` model (amend Task 2's schema) set via a checkbox on the `/setup` Goal card, and gate this section on `goals.some(g => g.isLearningGoal)`. **Use the schema-field approach**, not the keyword heuristic — it's unambiguous and the source spec's own goal examples (e.g., "$2000/month") show keyword-matching would false-negative easily. Fields: Skill Stage (select from `SKILL_STAGE`, with a tooltip "stay Associative to keep growing"), How vs. the Greats (text), and three checkboxes (Need More Challenge / Need Schedule Update / Analyzed Mistake Ledger).

---

### Task 23 — Weekly Save & Lock
Reuses `components/shared/LockButton.tsx` from Task 17 exactly, bound to `WeeklySummary.locked`. No new component.

---

### Task 24 — `/block/[blockNumber]` page + aggregates
`src/app/block/[blockNumber]/page.tsx`: `blockNumber` 1 → weeks 1–6, `blockNumber` 2 → weeks 7–12 (use `getBlockNumber` inverse: weeks for block = `blockNumber === 1 ? [1..6] : [7..12]`). Unlocks once the 6th week in its range has a `WeeklySummary` (any lock state, soft warning otherwise, same pattern as Task 18).
Aggregate cards: `aggregateDeepWorkHours` / `aggregateWorkHours` = sum of the 6 `WeeklySummary.totalDeepWorkHours` / `totalWorkHours` for that block's weeks, computed the same "default-only-if-null, explicit recompute button" way as Task 19.

---

### Task 25 — Goal Progress Trend chart
`components/block/GoalTrendChart.tsx`, ApexCharts `line` type, one series per `Goal` (typically 3), x-axis = week 1–12 (all 12, not just this block — makes the chart useful sprint-wide even though it's hosted on the block page per the source spec), y-axis 0–100%, single axis only.
**Fixed series colors, in `Goal.orderIndex` order, never auto-cycled:** `["#2a78d6", "#eb6834", "#1baf7a"]` — pass explicitly via ApexCharts `colors` option keyed to series order, do not let the library assign colors.
**Legend:** set `legend: { show: false }` in chart options; render a custom `<div>` legend above the chart manually mapping each Goal to its fixed color square + name — do not use ApexCharts' built-in legend.
Data source: `WeeklyGoalProgress.progressPercent`, one row per goal per week, fetched across all `WeeklySummary` rows for the sprint.

---

### Task 26 — Codex Violation Trend chart
`components/block/CodexTrendChart.tsx`: ApexCharts stacked `bar`, one bar per week (this block's 6 weeks), 3 segments per bar (Law1/Law2/Law3), parsed from each week's `codexViolationCountJson`. Use a distinct 3-color set (not the goal-trend colors, to avoid visual confusion) — e.g. `["#E24B4A", "#F09595", "#A32D2D"]` is fine but any legible sequential trio works; document the choice inline in the component rather than pulling from a shared palette meant for goals.

---

### Task 27 — North Star versioning
`components/block/NorthStarReview.tsx`: boolean question "Is the North Star still accurate?" bound to `SixWeekSummary.northStarStillAccurate`. If set to `false`, reveal a textarea for `updatedNorthStarText`. On save, if a new text was entered:
```ts
await prisma.$transaction([
  prisma.northStar.updateMany({ where: { sprintId, isActive: true }, data: { isActive: false } }),
  prisma.northStar.create({ data: { sprintId, statement: updatedNorthStarText, version: nextVersion, isActive: true } }),
]);
```
`nextVersion` = `(max existing version for this sprintId) + 1`, computed via `prisma.northStar.aggregate({ where: { sprintId }, _max: { version: true } })`. **Never** update the existing `NorthStar.statement` in place — always insert a new row and flip `isActive`. Old versions remain queryable for `/sprint/archive` (Task 34) by `sprintId`, ordered by `version`.

---

### Task 28 — Dashboard stat cards
`components/dashboard/StatCards.tsx`, 4 cards in `grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px`:
1. **Day counter** — shared `RadialProgress` component (see Task 12) showing `dayNumber/84`, track neutral gray, progress arc `#378ADD`, center label `Day {n}/84`.
2. **This week's focus** — the current week's `WeeklyPlanRow.focusArea` text + a difficulty `Badge` using the same `difficultyBandColor` function from Task 10 (green/amber/red).
3. **Deep work today** — `{actualHoursToday}h / {targetHoursToday}h` + a 6px horizontal bar filled proportionally in `#2a78d6`. `actualHoursToday` sums today's `OpsLogEntry` rows tagged `deep_work`; `targetHoursToday` is a constant derived from `criticalTarget` if numeric, otherwise a flat fallback of `3` hours (document this fallback inline — the schema has no dedicated daily-target field).
4. **Energy today** — colored pill (green/amber/red matching High/Medium/Low) **paired with an icon** (battery or bolt glyph from the TailAdmin icon set) — never rely on color alone, per accessibility.

---

### Task 29 — Dashboard Moves + Leftovers preview
Reuses `components/day/MovesList.tsx` and `LeftoversList.tsx` from Tasks 13–14 in a "compact" mode (prop `compact: boolean` toggles reduced padding, hides the "+ Add move" control since day 84-cap logic already lives on the full Day page) so there is exactly one implementation of each list, not a duplicate Dashboard-only version. Completed Moves get strikethrough + muted text color (not just checkbox state) — apply this styling inside `MovesList` itself so both the Dashboard and full Day page get it for free.

---

### Task 30 — Codex Violation Heatmap
`components/dashboard/CodexHeatmap.tsx`, props `{ days: { dayNumber: number; violationCount: number }[] }` for all 84 days (missing days = `violationCount: 0`).
Container CSS: `display: grid; grid-template-rows: repeat(7, 14px); grid-auto-flow: column; grid-auto-columns: 14px; gap: 3px;`. Render 84 `<div>` cells in `dayNumber` order 1→84 — with `grid-auto-flow: column` and 7 explicit rows, the browser fills column-by-column automatically, giving day 1 top-left and day 84 bottom-right with **no manual row/column math needed**.
Color function (exact — do not approximate or substitute a library's default color scale):
```ts
function colorForViolations(count: number): string {
  if (count <= 0) return "var(--surface-color, #F3F4F6)"; // "clean day" reads as blank
  if (count === 1) return "#FCEBEB";
  if (count === 2) return "#F09595";
  if (count === 3) return "#E24B4A";
  return "#A32D2D"; // 4+
}
```
Each cell has a `title` attribute (native tooltip) reading `"Day {n}: {count} violations"`. Below the grid, render a legend row: 5 small swatches labeled "Clean day" → "3+ violations", left to right, using the same `colorForViolations` outputs.
Data source: count `DailyLog` rows for the active sprint where `codexLawViolated !== "None"`, grouped by `dayNumber`.

---

### Task 31 — Deep-Work-Hours-vs-Target combo chart
`components/dashboard/DeepWorkChart.tsx` (used on both Dashboard and Weekly Summary — build once, parameterize by week range via a `weeks: number[]` prop).
ApexCharts mixed chart: series 1 `type: "column"`, actual hours per week, color `#2a78d6`; series 2 `type: "line"`, constant target value, `stroke: { dashArray: 6 }`, color `#898781`. **Single y-axis only** — do not configure `yaxis` as an array or set `opposite: true` on either series; both share the same scale in hours.
Weekly target = `(daily target from Task 28's fallback logic) * 7` unless a more specific per-week target exists — there isn't one in the schema, so use the same flat fallback, applied consistently.

---

### Task 32 — 7-day Energy Sparkline
`components/dashboard/EnergySparkline.tsx`: ApexCharts `line`, `sparkline: { enabled: true }` (removes axes/gridlines automatically — don't hand-suppress them). Map `energyLevel` → number: `Low: 1, Medium: 2, High: 3`, `null`/unset days plot as a gap (use `null` in the data array, ApexCharts renders a break, not a zero). Data: the last 7 `DailyLog` rows by `dayNumber` for the active sprint.

---

### Task 33 — Assemble `/` Dashboard page
`src/app/page.tsx`: Server Component, calls `getActiveSprint()` (Task 6) — if `null`, render an empty state with a single CTA button to `/sprint/new`. Otherwise fetches everything Tasks 28–32 need in parallel (`Promise.all`) and composes: `StatCards` → two-column (Moves | Leftovers preview) → `CodexHeatmap` → `DeepWorkChart` (last 7 days) → `EnergySparkline`, plus a "Log Today" button linking to `/day/[currentDayNumber]`. This page does not introduce any new data-fetching logic beyond what Tasks 28–32 already defined — it's composition only.

---

### Task 34 — Sprint completion, `/sprint/new`, `/sprint/archive`
`lib/actions/sprint.ts`, `createSprint(startDate: Date)`:
```ts
export async function createSprint(startDate: Date) {
  const existingActive = await prisma.sprint.findFirst({ where: { status: "active" } });
  if (existingActive) throw new Error("An active sprint already exists — archive or complete it first.");
  const endDate = addDays(startDate, 83);
  const sprint = await prisma.sprint.create({ data: { startDate, endDate, status: "active" } });
  redirect("/setup");
  return sprint;
}
```
`/sprint/new/page.tsx`: a single date picker (default: today), disabled/hidden entirely if `getActiveSprint()` returns non-null (redirect to `/` instead in that case).
`/sprint/archive/page.tsx`: lists `Sprint` where `status !== "active"`, ordered by `startDate` desc, each row linking to a read-only view.
**Read-only reuse, not new pages:** rather than building separate archive-specific Day/Week/Block components, add a `readOnly` boolean derived at the page level as `sprint.status !== "active"` and thread it as a prop into the existing Day/Week/Block components, disabling all inputs and hiding Save/Lock/Unlock buttons when true. Route archived views through the *same* `app/day/[dayNumber]/page.tsx` etc. by resolving `sprintId` from a query param (`?sprintId=...`) when present, defaulting to the active sprint otherwise — do not fork the route tree.

---

### Task 35 — Final integration pass
Wire all Sidebar links (Task 7) to real routes now that they exist. Add a top-level `error.tsx` and `loading.tsx` in `src/app/` (Next.js App Router conventions) with minimal TailAdmin-styled spinner/error states. Confirm every page handles the "no active sprint" case gracefully (redirect or empty state, not a crash). Run through the full Verification Plan below end-to-end once, in order.


---

## 4. VERIFICATION PLAN

Run `npm run dev`, open `http://localhost:3000`, and step through in this order. Each step maps to the Task number it verifies.

**Tasks 1–2 (scaffold + schema):**
1. `npx prisma studio` opens without error and shows all 12 models (Sprint, NorthStar, Goal, WeeklyPlanRow, DailyLog, Move, Leftover, OpsLogEntry, WeeklySummary, WeeklyGoalProgress, NextWeekBattle, SixWeekSummary).
2. `npm run build` completes with zero TypeScript errors.

**Task 3 (seed):**
3. In Prisma Studio, confirm exactly 1 `Sprint` row with `status = "active"`, 1 `NorthStar`, 3 `Goal` rows, 12 `WeeklyPlanRow` rows, and 10 `DailyLog` rows.

**Tasks 7–9 (`/setup`):**
4. Navigate to `/setup`. Confirm the North Star textarea shows the seeded manifest text in a visually distinct quote-style card, and 3 Goal cards render with seeded data.
5. Edit a Goal's "Why Important" field, click away (blur). Reload the page — the edit persisted.
6. Confirm the fields render as read-only (no direct typing) since `DailyLog` rows already exist for this sprint from seeding; clicking "Edit Goals" opens a confirm modal, and confirming makes fields editable for that session.

**Tasks 10–11 (`/roadmap`):**
7. Navigate to `/roadmap`. Confirm 12 rows, week 12 shows "Buffer" in Focus Area.
8. Click the Difficulty cell for week 3, change it to `8`, confirm the badge turns red immediately after save.
9. Confirm the progress bar above the table visually indicates the current week (week 2, given the seed's 10-day-old start date).

**Tasks 12–17 (`/day/[dayNumber]`):**
10. Navigate to `/day/10` (today, per seed). Confirm header shows `Day 10/84`, correct date, `Week 2`, and a progress ring at ~12%.
11. Confirm 2–4 seeded Moves appear with correct done/not-done states.
12. Confirm Leftovers section shows items carried from Day 9's incomplete Moves, with descriptions matching those Moves' text.
13. Add a 6th Move attempt — confirm the "+ Add move" button is disabled/blocked, and a direct server-action call would be rejected (spot-check by reading `createMove`'s guard).
14. Fill Sleep Time, set Codex Law at Risk to `Law1` — confirm the Prevention Method field appears only now, not before.
15. Click "Save & Lock Day." Confirm all fields become disabled and the button now reads "Unlock to Edit."
16. Click "Unlock to Edit" — confirm a confirm modal appears; cancel it and confirm the day remains locked; retry and confirm, and confirm fields become editable again.
17. Navigate to `/day/11` (a day with no existing log, day-number 11 > today's computed day 10 — actually today = day 10, so use `/day/9` as an already-existing day and `/day/11` as a future day to test the back-fill banner logic doesn't fire for future days). Confirm no crash; confirm appropriate handling (future day: either blocked or shown as "not yet reached," per your implementation).

**Tasks 18–23 (`/week/[weekNumber]/summary`):**
18. Navigate to `/week/1/summary`. Confirm it's fully usable (day 7 of week 1 exists in seed data).
19. Confirm `Total Deep Work Hours` / `Total Work Hours` show non-zero auto-computed values matching the sum of week 1's tagged `OpsLogEntry` rows (spot check math against Prisma Studio data).
20. Manually overwrite `Total Deep Work Hours` to `99`, save, reload — confirm it stays `99` (override persisted, not silently recomputed).
21. Click "Recompute from logs" (with confirm modal) — confirm it overwrites back to the computed value.
22. Confirm the Goal Progress table shows all 3 goals with seeded progress %, and Codex Violations mini-chart renders 3 bars (Law1/Law2/Law3 counts).
23. Confirm exactly 3 Next Week Battle fields render (no add/remove controls).
24. Navigate to `/week/2/summary` before day 14 exists — confirm the soft warning banner appears but the page is still fully usable, not blocked.
25. If a Goal has `isLearningGoal = true`, confirm the Learning Section renders; if none do, confirm it's absent.
26. Confirm Save & Lock behaves identically to the Daily Log's lock pattern (Task 17, step 15–16).

**Tasks 24–27 (`/block/[blockNumber]`):**
27. Navigate to `/block/1`. Confirm aggregate stat cards show summed hours across weeks 1–6 (partial, since only week 1 has data).
28. Confirm the Goal Progress Trend chart renders 3 lines in the fixed colors `#2a78d6`/`#eb6834`/`#1baf7a`, with a custom HTML legend above it (not ApexCharts' built-in legend — inspect the DOM to confirm `legend.show: false` took effect).
29. Confirm the Codex Violation Trend chart renders a stacked bar per week.
30. Toggle "Is the North Star still accurate?" to false, enter new text, save. Confirm `/setup`'s North Star now shows the new text, and Prisma Studio shows two `NorthStar` rows for this sprint (`version 1, isActive false` and `version 2, isActive true`).

**Tasks 28–33 (Dashboard `/`):**
31. Navigate to `/`. Confirm all 4 stat cards render with real data (day counter ring at correct %, current week's focus/difficulty badge, deep-work bar, energy pill with icon).
32. Confirm Moves/Leftovers preview matches the full Day page's data for today.
33. Confirm the Codex Heatmap renders a 12×7 grid, day 1 top-left, most recent seeded day bottom-most-populated-column; hover a cell with violations and confirm the tooltip reads `"Day N: X violations"`; confirm a 0-violation day renders blank/neutral, not a colored swatch.
34. Confirm the Deep-Work-vs-Target chart renders bars + a dashed target line on one shared y-axis.
35. Confirm the Energy Sparkline renders a small trend line with no visible axes/gridlines.

**Task 34 (Sprint lifecycle):**
36. In Prisma Studio, manually set the seeded Sprint's `endDate` to yesterday. Reload `/`. Confirm the sprint flips to `status: "completed"` automatically (check Prisma Studio) and the Dashboard now shows the "no active sprint" empty state with a CTA to `/sprint/new`.
37. Click through to `/sprint/new`, pick a start date, submit. Confirm redirect to `/setup` for the new sprint, and confirm the old sprint now appears in `/sprint/archive`.
38. Open the archived sprint from `/sprint/archive`. Confirm its Day/Week/Block pages render with all inputs disabled and no Save/Lock buttons visible.

**Task 35 (integration):**
39. Click every Sidebar link in order — confirm each resolves to a real, non-erroring page.
40. Throw a deliberate error (e.g., temporarily rename a Prisma model reference) to confirm `error.tsx` renders a graceful message rather than a raw stack trace, then revert the change.

