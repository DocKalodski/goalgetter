/**
 * Local algorithmic analysis engine for AI Insights.
 * Runs 7 analysis passes to identify issues needing HC attention.
 * No external AI dependency — uses theme matching and heuristic analysis.
 */

// ─── Alignment Hierarchy ────────────────────────────────────────

export const ALIGNMENT_HIERARCHY = [
  { label: "Excellent",   min: 90, max: 100, color: "emerald" },
  { label: "Acceptable",  min: 80, max: 89,  color: "green" },
  { label: "Developing",  min: 70, max: 79,  color: "yellow" },
  { label: "Moderate",    min: 50, max: 69,  color: "orange" },
  { label: "Misaligned",  min: 0,  max: 49,  color: "red" },
] as const;

/** Minimum target alignment score — Acceptable tier */
const ALIGNMENT_TARGET = 80;

export function getAlignmentTier(score: number) {
  return (
    ALIGNMENT_HIERARCHY.find((t) => score >= t.min && score <= t.max) ??
    ALIGNMENT_HIERARCHY[ALIGNMENT_HIERARCHY.length - 1]
  );
}

// ─── Types ──────────────────────────────────────────────────────

export interface AnalysisInput {
  councils: {
    id: string;
    name: string;
    coachId: string;
  }[];
  users: {
    id: string;
    name: string | null;
    role: string;
    councilId: string | null;
  }[];
  goals: {
    id: string;
    userId: string;
    goalType: string;
    goalStatement: string;
    valuesDeclaration: string | null;
  }[];
  milestones: {
    id: string;
    goalId: string;
    weekNumber: number;
    cumulativePercentage: number;
    actions: string | null;
  }[];
  declarations: {
    userId: string;
    text: string;
  }[];
  actionPlans: {
    goalId: string;
    weekNumber: number;
  }[];
  currentWeek?: number;
}

export interface AnalysisFinding {
  category:
    | "low_progress"
    | "alignment_gap"
    | "attendance_concern"
    | "missing_data"
    | "coach_attention"
    | "stalled_momentum"
    | "target_performance";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  resolutions: string[];
  entityType: "student" | "coach" | "council";
  entityId: string;
  entityName: string;
  councilId: string | null;
}

// ─── Theme Map (from AlignmentAssessmentPanel) ──────────────────

const themeMap: Record<string, string[]> = {
  love: ["love", "loving", "loved", "lovingly", "adore", "heart", "self-love"],
  courage: ["courage", "courageous", "bold", "brave", "daring"],
  power: ["power", "powerful", "empower", "empowers", "empowering", "strength", "strong"],
  trust: ["trust", "trusting", "faith", "faithful", "confidence"],
  commitment: ["commit", "committed", "commitment", "dedicate", "dedicated", "devotion"],
  joy: ["joy", "joyful", "celebrate", "delight", "happy", "happiness"],
  greatness: ["great", "greatness", "excellence", "excellent", "outstanding"],
  wholeness: ["whole", "wholeness", "complete", "balanced"],
  vulnerability: ["vulnerable", "vulnerability", "open", "authentic", "genuine"],
  care: ["care", "caring", "nurture", "compassion", "kind", "kindness"],
  gift: ["gift", "give", "giving", "generous", "bless", "grace"],
  inspire: ["inspire", "inspiring", "inspiration", "inspires", "uplift", "motivate"],
  unstoppable: ["unstoppable", "relentless", "persistent", "resilient"],
  worthy: ["worthy", "worthiness", "worth", "deserving", "value"],
  responsibility: ["responsible", "responsibility", "accountable", "steward"],
  creativity: ["creative", "creativity", "create", "build", "design"],
};

// ─── Helpers ────────────────────────────────────────────────────

const TOTAL_WEEKS = 12;

/**
 * Calculate goal progress using the Excel FINAL RATING formula:
 * (completed weeks / 12) × 100
 */
function getGoalProgress(
  goalIds: string[],
  milestones: AnalysisInput["milestones"],
  currentWeek: number
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const goalId of goalIds) {
    const goalMilestones = milestones.filter(
      (m) => m.goalId === goalId && m.weekNumber <= currentWeek
    );
    let completedWeeks = 0;
    for (const m of goalMilestones) {
      try {
        const acts: { text: string; done: boolean }[] = JSON.parse(m.actions || "[]");
        const nonEmpty = acts.filter((a) => a.text && a.text.trim() !== "");
        if (nonEmpty.length > 0 && nonEmpty.every((a) => a.done)) {
          completedWeeks++;
        }
      } catch {
        // skip malformed JSON
      }
    }
    result[goalId] = Math.round((completedWeeks / TOTAL_WEEKS) * 10000) / 100;
  }
  return result;
}

function getActiveThemes(text: string): string[] {
  const lower = text.toLowerCase();
  const themes: string[] = [];
  for (const [theme, keywords] of Object.entries(themeMap)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      themes.push(theme);
    }
  }
  return themes;
}

function computeAlignmentScore(
  declaration: string,
  goalStatement: string
): { score: number; declThemes: string[]; matchedThemes: string[]; missingThemes: string[] } {
  const declThemes = getActiveThemes(declaration);
  if (declThemes.length === 0) {
    return { score: 50, declThemes: [], matchedThemes: [], missingThemes: [] };
  }
  const goalThemes = getActiveThemes(goalStatement);
  const matchedThemes = declThemes.filter((t) => goalThemes.includes(t));
  const missingThemes = declThemes.filter((t) => !goalThemes.includes(t));
  const score = Math.round((matchedThemes.length / declThemes.length) * 100);
  return { score, declThemes, matchedThemes, missingThemes };
}

/**
 * Map comma-separated values string (e.g. "Committed, Vulnerable, Loving")
 * to theme keys from themeMap.
 */
function parseValueThemes(valuesDeclaration: string): string[] {
  const valuesList = valuesDeclaration
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const matched: string[] = [];
  for (const val of valuesList) {
    for (const [theme, keywords] of Object.entries(themeMap)) {
      if (keywords.some((kw) => val.includes(kw)) || val.includes(theme)) {
        if (!matched.includes(theme)) matched.push(theme);
        break;
      }
    }
  }
  return matched;
}

/**
 * Check how well the goal statement reflects the student's stated values.
 */
function computeValuesAlignment(
  valuesDeclaration: string,
  goalStatement: string
): { score: number; valueThemes: string[]; matchedThemes: string[]; missingThemes: string[] } {
  const valueThemes = parseValueThemes(valuesDeclaration);
  if (valueThemes.length === 0) {
    return { score: 50, valueThemes: [], matchedThemes: [], missingThemes: [] };
  }
  const goalThemes = getActiveThemes(goalStatement);
  const matchedThemes = valueThemes.filter((t) => goalThemes.includes(t));
  const missingThemes = valueThemes.filter((t) => !goalThemes.includes(t));
  const score = Math.round((matchedThemes.length / valueThemes.length) * 100);
  return { score, valueThemes, matchedThemes, missingThemes };
}

function cap(text: string, len = 50): string {
  return text.length > len ? text.slice(0, len) + "…" : text;
}

// ─── Main Engine ────────────────────────────────────────────────

export function runInsightsAnalysis(input: AnalysisInput): {
  findings: AnalysisFinding[];
  summary: string;
} {
  const findings: AnalysisFinding[] = [];

  const students = input.users.filter((u) => u.role === "student");
  const coaches = input.users.filter((u) => u.role === "coach");

  // Build lookup maps
  const councilMap = new Map(input.councils.map((c) => [c.id, c]));
  const userGoals = new Map<string, typeof input.goals>();
  for (const goal of input.goals) {
    const existing = userGoals.get(goal.userId) || [];
    existing.push(goal);
    userGoals.set(goal.userId, existing);
  }
  const declMap = new Map(input.declarations.map((d) => [d.userId, d.text]));

  const currentWeek = input.currentWeek ?? 12;
  const allGoalIds = input.goals.map((g) => g.id);
  const goalProgress = getGoalProgress(allGoalIds, input.milestones, currentWeek);

  function getUserAvgProgress(userId: string): {
    enrollment: number;
    personal: number;
    professional: number;
    avg: number;
  } {
    const uGoals = userGoals.get(userId) || [];
    const progress: Record<string, number> = {
      enrollment: 0,
      personal: 0,
      professional: 0,
    };
    for (const g of uGoals) {
      progress[g.goalType] = goalProgress[g.id] || 0;
    }
    const avg = Math.round(
      (progress.enrollment + progress.personal + progress.professional) / 3
    );
    return { enrollment: progress.enrollment, personal: progress.personal, professional: progress.professional, avg };
  }

  // ─── Pass 1: Progress Analysis ──────────────────────────────
  for (const student of students) {
    const prog = getUserAvgProgress(student.id);

    if (prog.avg < 30) {
      findings.push({
        category: "low_progress",
        severity: "critical",
        title: `${student.name || "Student"} — Low Progress (${prog.avg}%)`,
        description: `Overall goal achievement is critically low at ${prog.avg}%. Enrollment: ${prog.enrollment}%, Personal: ${prog.personal}%, Professional: ${prog.professional}%.`,
        resolutions: [
          `Schedule an emergency 1-on-1 to identify the root cause — is it clarity, capacity, or motivation?`,
          `Break down the weakest goal into micro-actions: one small win per day this week`,
          `Review and simplify the action plan — remove blockers and set a single non-negotiable weekly commitment`,
        ],
        entityType: "student",
        entityId: student.id,
        entityName: student.name || "Unknown",
        councilId: student.councilId,
      });
    } else if (prog.avg < 50) {
      findings.push({
        category: "low_progress",
        severity: "warning",
        title: `${student.name || "Student"} — Below Target (${prog.avg}%)`,
        description: `Goal achievement at ${prog.avg}% is below the 50% midpoint. Enrollment: ${prog.enrollment}%, Personal: ${prog.personal}%, Professional: ${prog.professional}%.`,
        resolutions: [
          `Identify which goal type is the biggest gap and focus coaching there first`,
          `Ask the student what obstacle has slowed them — time, clarity, or accountability?`,
          `Set a stretch weekly target for the next 2 sessions to close the gap`,
        ],
        entityType: "student",
        entityId: student.id,
        entityName: student.name || "Unknown",
        councilId: student.councilId,
      });
    }
  }

  // ─── Pass 2: Alignment Analysis ─────────────────────────────
  for (const student of students) {
    const declaration = declMap.get(student.id);
    const uGoals = userGoals.get(student.id) || [];

    if (!declaration || uGoals.length === 0) continue;

    for (const goal of uGoals) {
      const { score, declThemes, matchedThemes, missingThemes } =
        computeAlignmentScore(declaration, goal.goalStatement);

      if (score >= ALIGNMENT_TARGET) continue; // Acceptable or better — skip

      const tier = getAlignmentTier(score);
      const severity: "warning" | "info" = score < 50 ? "warning" : "info";
      const declSnip = cap(declaration, 60);
      const matchedStr = matchedThemes.length > 0 ? matchedThemes.join(", ") : "none";
      const missingStr = missingThemes.length > 0 ? missingThemes.join(", ") : "none";

      const description =
        `${tier.label} alignment (${score}% — target ≥${ALIGNMENT_TARGET}%). ` +
        `Declaration themes: [${declThemes.join(", ")}]. ` +
        `Matched in ${goal.goalType} goal: [${matchedStr}]. ` +
        `Missing: [${missingStr}]. ` +
        `The ${goal.goalType} goal should reflect the student's declared identity more fully.`;

      const resolutions: string[] =
        score < 50
          ? [
              `Rewrite the ${goal.goalType} goal to explicitly include the missing themes: ${missingStr}`,
              `Ask: "How does your ${goal.goalType} goal express your declaration — '${declSnip}'?"`,
              `Schedule a values-to-goals workshop session to reconnect the student's identity with their ${goal.goalType} goal`,
            ]
          : [
              `Enrich the ${goal.goalType} goal statement by weaving in the missing themes: ${missingStr}`,
              `Add a weekly intention tied to one missing theme (${missingThemes[0] ?? "missing theme"}) to bridge the gap`,
              `In the next session, re-read the declaration together and update the ${goal.goalType} goal language to better echo it`,
            ];

      findings.push({
        category: "alignment_gap",
        severity,
        title: `${student.name || "Student"} — ${tier.label} ${goal.goalType} decl. alignment (${score}%)`,
        description,
        resolutions,
        entityType: "student",
        entityId: student.id,
        entityName: student.name || "Unknown",
        councilId: student.councilId,
      });
    }
  }

  // ─── Pass 2b: Values → Goal Alignment ───────────────────────
  for (const student of students) {
    const uGoals = userGoals.get(student.id) || [];

    for (const goal of uGoals) {
      if (!goal.valuesDeclaration) continue;

      const { score, valueThemes, matchedThemes, missingThemes } =
        computeValuesAlignment(goal.valuesDeclaration, goal.goalStatement);

      if (score >= ALIGNMENT_TARGET) continue; // Acceptable or better — skip
      if (valueThemes.length === 0) continue; // No recognizable value themes

      const tier = getAlignmentTier(score);
      const severity: "warning" | "info" = score < 50 ? "warning" : "info";
      const matchedStr = matchedThemes.length > 0 ? matchedThemes.join(", ") : "none";
      const missingStr = missingThemes.length > 0 ? missingThemes.join(", ") : "none";

      const description =
        `${tier.label} values alignment (${score}% — target ≥${ALIGNMENT_TARGET}%). ` +
        `Stated values map to themes: [${valueThemes.join(", ")}]. ` +
        `Reflected in ${goal.goalType} goal: [${matchedStr}]. ` +
        `Values not expressed in goal: [${missingStr}]. ` +
        `The goal should embody the student's chosen values, not just pursue an outcome.`;

      const resolutions: string[] =
        score < 50
          ? [
              `Rewrite the ${goal.goalType} goal to actively express the missing values: ${missingStr}`,
              `Ask: "How does pursuing this goal allow you to live your value of ${missingThemes[0] ?? "your value"}?"`,
              `Use the GROW model to reconnect the goal to values — ask what achieving the goal will give them (the emotional peg)`,
            ]
          : [
              `Add value-language to the ${goal.goalType} goal statement — weave in: ${missingStr}`,
              `For each missing value (${missingStr}), ask: "How can your goal statement show you living this value?"`,
              `In the next session, review the 3 A's: Aligned (to values), Abides by SMART, Agreed — refine the goal together`,
            ];

      findings.push({
        category: "alignment_gap",
        severity,
        title: `${student.name || "Student"} — ${tier.label} ${goal.goalType} values alignment (${score}%)`,
        description,
        resolutions,
        entityType: "student",
        entityId: student.id,
        entityName: student.name || "Unknown",
        councilId: student.councilId,
      });
    }
  }

  // ─── Pass 3: Momentum / Stalled Progress ────────────────────
  for (const student of students) {
    const uGoals = userGoals.get(student.id) || [];
    for (const goal of uGoals) {
      const goalMilestones = input.milestones
        .filter((m) => m.goalId === goal.id && m.weekNumber <= currentWeek)
        .sort((a, b) => a.weekNumber - b.weekNumber);

      if (goalMilestones.length < 3) continue;

      const last3 = goalMilestones.slice(-3);
      const last3Completed = last3.filter((m) => {
        try {
          const acts: { text: string; done: boolean }[] = JSON.parse(m.actions || "[]");
          const nonEmpty = acts.filter((a) => a.text && a.text.trim() !== "");
          return nonEmpty.length > 0 && nonEmpty.every((a) => a.done);
        } catch { return false; }
      }).length;

      const goalProg = goalProgress[goal.id] || 0;
      if (last3Completed === 0 && goalProg < 70) {
        findings.push({
          category: "stalled_momentum",
          severity: "warning",
          title: `${student.name || "Student"} — Stalled ${goal.goalType} progress`,
          description: `${goal.goalType.charAt(0).toUpperCase() + goal.goalType.slice(1)} goal at ${goalProg}% with no weeks completed in the last 3 weeks. Momentum has stopped.`,
          resolutions: [
            `Run a "breakthrough conversation" — ask what's true right now that's getting in the way`,
            `Reset the action plan to just 1–2 items this week to rebuild momentum with a quick win`,
            `Pair with another council member for accountability on this goal for the next 2 weeks`,
          ],
          entityType: "student",
          entityId: student.id,
          entityName: student.name || "Unknown",
          councilId: student.councilId,
        });
      }
    }
  }

  // ─── Pass 4: Missing Data Detection ─────────────────────────
  for (const student of students) {
    const uGoals = userGoals.get(student.id) || [];
    const declaration = declMap.get(student.id);

    if (!declaration) {
      findings.push({
        category: "missing_data",
        severity: "info",
        title: `${student.name || "Student"} — No declaration set`,
        description: `This student has not set their declaration yet. A declaration is foundational to goal alignment and coaching.`,
        resolutions: [
          `Guide the student through the declaration exercise in the next session`,
          `Share example declarations from other students (anonymized) as inspiration`,
          `Ask: "Who are you being at your best?" and capture their answer as a starting declaration`,
        ],
        entityType: "student",
        entityId: student.id,
        entityName: student.name || "Unknown",
        councilId: student.councilId,
      });
    }

    if (uGoals.length === 0) {
      findings.push({
        category: "missing_data",
        severity: "warning",
        title: `${student.name || "Student"} — No goals created`,
        description: `This student has no goals set up. They need enrollment, personal, and professional goals to participate fully.`,
        resolutions: [
          `In the next session, complete the goal-setting exercise together for all 3 goal types`,
          `Send a reminder with the goal template to complete before the next council meeting`,
          `Assign a peer buddy to walk them through goal creation`,
        ],
        entityType: "student",
        entityId: student.id,
        entityName: student.name || "Unknown",
        councilId: student.councilId,
      });
      continue;
    }

    const goalTypes = uGoals.map((g) => g.goalType);
    const missing = ["enrollment", "personal", "professional"].filter(
      (t) => !goalTypes.includes(t)
    );
    if (missing.length > 0) {
      findings.push({
        category: "missing_data",
        severity: "info",
        title: `${student.name || "Student"} — Missing ${missing.join(", ")} goal(s)`,
        description: `This student is missing ${missing.length} of 3 required goal types: ${missing.join(", ")}.`,
        resolutions: [
          `Set a specific deadline for the student to create the missing ${missing.join(", ")} goal(s)`,
          `Create the goal together during the next check-in by asking targeted questions for each missing type`,
          `Connect the missing goal type to their declaration themes to make it feel personal and meaningful`,
        ],
        entityType: "student",
        entityId: student.id,
        entityName: student.name || "Unknown",
        councilId: student.councilId,
      });
    }

    for (const goal of uGoals) {
      const hasPlans = input.actionPlans.some((ap) => ap.goalId === goal.id);
      const hasMilestones = input.milestones.some((m) => m.goalId === goal.id);
      if (!hasPlans && !hasMilestones) {
        findings.push({
          category: "missing_data",
          severity: "info",
          title: `${student.name || "Student"} — Empty ${goal.goalType} goal`,
          description: `The ${goal.goalType} goal exists but has no milestones or action plans.`,
          resolutions: [
            `Help the student add 3–5 weekly milestones to their ${goal.goalType} goal in the next session`,
            `Ask the student: "What's the first small action you can take this week toward this goal?"`,
            `Review the goal statement together — if it's too vague, refine it before adding actions`,
          ],
          entityType: "student",
          entityId: student.id,
          entityName: student.name || "Unknown",
          councilId: student.councilId,
        });
      }
    }
  }

  // ─── Pass 5: Coach-Level Rollup ─────────────────────────────
  for (const coach of coaches) {
    const coachCouncils = input.councils.filter((c) => c.coachId === coach.id);
    const councilIds = new Set(coachCouncils.map((c) => c.id));
    const coachStudents = students.filter(
      (s) => s.councilId && councilIds.has(s.councilId)
    );

    const criticalStudents = coachStudents.filter((s) => {
      const prog = getUserAvgProgress(s.id);
      return prog.avg < 30;
    });

    if (criticalStudents.length >= 3) {
      findings.push({
        category: "coach_attention",
        severity: "critical",
        title: `Coach ${coach.name || "Unknown"} — ${criticalStudents.length} students in critical zone`,
        description: `${criticalStudents.length} of ${coachStudents.length} students have critically low progress (<30%). Students: ${criticalStudents.map((s) => s.name).join(", ")}.`,
        resolutions: [
          `Hold an emergency group check-in to identify shared blockers across the struggling students`,
          `Pair each critical student with a high-performing peer for weekly accountability`,
          `Review coaching approach — consider a different engagement style or format for this cohort`,
        ],
        entityType: "coach",
        entityId: coach.id,
        entityName: coach.name || "Unknown",
        councilId: null,
      });
    } else if (criticalStudents.length >= 2) {
      findings.push({
        category: "coach_attention",
        severity: "warning",
        title: `Coach ${coach.name || "Unknown"} — ${criticalStudents.length} students struggling`,
        description: `${criticalStudents.length} students have progress below 30%. Consider a coaching strategy review.`,
        resolutions: [
          `Schedule individual check-ins with each struggling student to understand root causes`,
          `Increase check-in frequency from weekly to twice-weekly for the next 2 weeks`,
          `Discuss with the head coach whether additional support resources are available`,
        ],
        entityType: "coach",
        entityId: coach.id,
        entityName: coach.name || "Unknown",
        councilId: null,
      });
    }
  }

  // ─── Pass 6: Council Cross-analysis ─────────────────────────
  for (const council of input.councils) {
    const councilStudents = students.filter((s) => s.councilId === council.id);
    if (councilStudents.length === 0) continue;

    const progresses = councilStudents.map((s) => getUserAvgProgress(s.id));
    const councilAvg = Math.round(
      progresses.reduce((sum, p) => sum + p.avg, 0) / progresses.length
    );

    if (councilAvg < 30) {
      findings.push({
        category: "low_progress",
        severity: "critical",
        title: `Council ${council.name} — Critical overall progress (${councilAvg}%)`,
        description: `The entire council is averaging only ${councilAvg}% goal achievement across ${councilStudents.length} students.`,
        resolutions: [
          `Run a council-wide retrospective to surface systemic blockers`,
          `Reset milestone targets for the remainder of the program to achievable levels`,
          `Escalate to head coach for additional coaching support or restructuring`,
        ],
        entityType: "council",
        entityId: council.id,
        entityName: council.name,
        councilId: council.id,
      });
    }

    const stalledCount = councilStudents.filter((s) => {
      const uGoals = userGoals.get(s.id) || [];
      return uGoals.some((goal) => {
        const ms = input.milestones
          .filter((m) => m.goalId === goal.id && m.weekNumber <= currentWeek)
          .sort((a, b) => a.weekNumber - b.weekNumber);
        if (ms.length < 3) return false;
        const last3 = ms.slice(-3);
        const last3Completed = last3.filter((m) => {
          try {
            const acts: { text: string; done: boolean }[] = JSON.parse(m.actions || "[]");
            const nonEmpty = acts.filter((a) => a.text && a.text.trim() !== "");
            return nonEmpty.length > 0 && nonEmpty.every((a) => a.done);
          } catch { return false; }
        }).length;
        return last3Completed === 0 && (goalProgress[goal.id] || 0) < 70;
      });
    }).length;

    if (stalledCount >= 3) {
      findings.push({
        category: "stalled_momentum",
        severity: "warning",
        title: `Council ${council.name} — ${stalledCount} students with stalled progress`,
        description: `${stalledCount} of ${councilStudents.length} students have stalled progress on at least one goal.`,
        resolutions: [
          `Run a council energizer session focused on reigniting commitment and sharing breakthroughs`,
          `Introduce a "win of the week" sharing ritual to re-engage the group`,
          `Identify if there's a shared external factor (exams, work demands) causing the stall and adjust pacing`,
        ],
        entityType: "council",
        entityId: council.id,
        entityName: council.name,
        councilId: council.id,
      });
    }
  }

  // ─── Pass 7: Target Performance ─────────────────────────────
  function getWeekTargetMin(week: number): number | null {
    if (week <= 1 || week >= 12) return null;
    if (week === 11) return 100;
    return (week - 1) * 10;
  }

  const reportingWeek = Math.max(1, currentWeek - 1);
  const targetMin = getWeekTargetMin(reportingWeek);

  if (targetMin !== null) {
    for (const student of students) {
      const prog = getUserAvgProgress(student.id);
      if (prog.avg < targetMin) {
        const severity = prog.avg < Math.round(targetMin * 0.7) ? "warning" : "info";
        findings.push({
          category: "target_performance",
          severity,
          title: `${student.name || "Student"} — Behind target: Week ${reportingWeek} (${prog.avg}% vs ${targetMin}%+)`,
          description: `Week ${reportingWeek} target is ${targetMin}%+. Currently at ${prog.avg}% (Enrollment: ${prog.enrollment}%, Personal: ${prog.personal}%, Professional: ${prog.professional}%).`,
          resolutions: [
            `Identify which goal has the biggest gap and focus this week's actions there`,
            `Review incomplete action items from the past 2 weeks and reschedule them this week`,
            `Set a daily micro-commitment for the remainder of the week to close the ${targetMin - prog.avg}% gap`,
          ],
          entityType: "student",
          entityId: student.id,
          entityName: student.name || "Unknown",
          councilId: student.councilId,
        });
      }
    }

    for (const council of input.councils) {
      const councilStudents = students.filter((s) => s.councilId === council.id);
      if (councilStudents.length === 0) continue;
      const progresses = councilStudents.map((s) => getUserAvgProgress(s.id));
      const councilAvg = Math.round(
        progresses.reduce((sum, p) => sum + p.avg, 0) / progresses.length
      );
      if (councilAvg < targetMin) {
        findings.push({
          category: "target_performance",
          severity: "warning",
          title: `Council ${council.name} — Below Week ${reportingWeek} target (${councilAvg}% vs ${targetMin}%+)`,
          description: `Council average is ${councilAvg}% against the Week ${reportingWeek} target of ${targetMin}%+. ${councilStudents.length} students in this council may need a group motivational push.`,
          resolutions: [
            `Open the next council session with a group commitment — each student names one action they will complete this week`,
            `Share a council leaderboard to activate healthy peer motivation`,
            `Identify the top 2 students closest to target and have them share their approach with the group`,
          ],
          entityType: "council",
          entityId: council.id,
          entityName: council.name,
          councilId: council.id,
        });
      }
    }
  }

  // ─── Build Summary ──────────────────────────────────────────
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const infoCount = findings.filter((f) => f.severity === "info").length;

  const affectedStudents = new Set(
    findings.filter((f) => f.entityType === "student").map((f) => f.entityId)
  ).size;
  const affectedCouncils = new Set(
    findings.filter((f) => f.councilId).map((f) => f.councilId!)
  ).size;

  const summary = `Found ${findings.length} issue${findings.length !== 1 ? "s" : ""}: ${criticalCount} critical, ${warningCount} warnings, ${infoCount} informational. Affecting ${affectedStudents} student${affectedStudents !== 1 ? "s" : ""} across ${affectedCouncils} council${affectedCouncils !== 1 ? "s" : ""}.`;

  return { findings, summary };
}
