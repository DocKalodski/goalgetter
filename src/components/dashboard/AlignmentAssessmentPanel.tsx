"use client";

import { useEffect, useState } from "react";
import { getStudentAlignment } from "@/lib/actions/alignment";
import { AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, Shield } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface MilestoneData {
  weekNumber: number;
  milestoneDescription: string | null;
  actions: string | null;
}

type AlignmentRating = "Excellent" | "Acceptable" | "Moderate" | "Needs Attention";

function getAlignmentRating(score: number): AlignmentRating {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Acceptable";
  if (score >= 50) return "Moderate";
  return "Needs Attention";
}

interface DeclarationAssessment {
  score: number;
  rating: AlignmentRating;
  themeMatches: string[];
  missingThemes: string[];
  valueAlignment: string[];
  suggestedValues: string[];
  insight: string;
  whyThisRating: string;
  rewrittenGoal?: string;
}

interface GoalMilestoneAssessment {
  goalToMilestonesScore: number;
  milestonesToActionsScore: number;
  overallScore: number;
  rating: AlignmentRating;
  findings: string[];
  recommendation: string;
  whyThisRating: string;
  disconnectedWeeks: number[];
}

// ─── Theme Map (shared with FeedbackTab) ────────────────────────

const themeMap: Record<string, string[]> = {
  love: ["love", "loving", "loved", "lovingly", "adore", "adoring", "heart", "self-love"],
  courage: ["courage", "courageous", "courageously", "bold", "boldly", "brave", "bravely", "daring"],
  power: ["power", "powerful", "powerfully", "empower", "empowers", "empowering", "strength", "strong"],
  trust: ["trust", "trusting", "trustingly", "faith", "faithful", "rely", "confidence"],
  commitment: ["commit", "committed", "commitment", "committedly", "dedicate", "dedicated", "dedication", "devoted", "devotion"],
  joy: ["joy", "joyful", "joyfully", "celebrate", "celebration", "delight", "happy", "happiness", "fun", "playful"],
  greatness: ["great", "greatness", "excellence", "excellent", "best", "exemplary", "outstanding"],
  wholeness: ["whole", "wholeness", "complete", "completeness", "full", "fully", "balanced"],
  vulnerability: ["vulnerable", "vulnerability", "open", "openness", "authentic", "genuine", "real"],
  care: ["care", "caring", "nurture", "nurturing", "compassion", "compassionate", "kind", "kindness"],
  gift: ["gift", "give", "giving", "generous", "generosity", "bless", "blessing", "grace", "divine", "god"],
  inspire: ["inspire", "inspiring", "inspiration", "inspires", "uplift", "uplifting", "motivate", "role model"],
  unstoppable: ["unstoppable", "relentless", "persistent", "persevere", "resilient", "resilience", "whatever it takes"],
  worthy: ["worthy", "worthiness", "worth", "deserving", "value", "self-worth"],
  passion: ["passion", "passionate", "passionately", "fire", "drive", "driven", "zest"],
  responsibility: ["responsible", "responsibly", "responsibility", "accountable", "accountability", "steward"],
  abundance: ["abundance", "abundant", "abundantly", "plenty", "prosper", "prosperity", "flourish"],
  freedom: ["freedom", "free", "liberation", "liberate", "independent", "independence"],
  gratitude: ["grateful", "gratitude", "thankful", "appreciation", "honor", "honoring"],
  miracle: ["miracle", "miracles", "miraculous", "wonder", "wondrous", "extraordinary"],
  creativity: ["creative", "creativity", "create", "creating", "build", "building", "design", "craft"],
};

const stopWords = new Set([
  "the", "and", "for", "that", "with", "from", "this", "will", "have",
  "been", "not", "but", "its", "are", "was", "were", "has", "had",
  "can", "may", "shall", "should", "would", "could", "being", "their",
  "they", "them", "than", "then", "also", "into", "over", "more",
  "most", "all", "any", "each", "every", "both", "few", "some",
  "such", "only", "own", "same", "other", "about", "through",
  "before", "after", "above", "below", "between", "under", "again",
  "further", "once", "here", "there", "when", "where", "why", "how",
  "what", "which", "who", "whom", "very", "just", "don", "now",
  "our", "your", "his", "her", "myself", "yourself", "per", "week",
]);

// ─── Extract Keywords ───────────────────────────────────────────

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

// ─── Assessment 1: Declaration → Goal Alignment ─────────────────

function assessDeclarationAlignment(
  declaration: string,
  goalStatement: string,
  values: string | null
): DeclarationAssessment {
  const declLower = declaration.toLowerCase();
  const stmtLower = goalStatement.toLowerCase();
  const valuesList = (values || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const valuesLower = valuesList.map((v) => v.toLowerCase());

  // Find active themes in declaration
  const activeThemes: string[] = [];
  for (const [theme, keywords] of Object.entries(themeMap)) {
    if (keywords.some((kw) => declLower.includes(kw))) {
      activeThemes.push(theme);
    }
  }

  // Theme matches in goal statement
  const themeMatches: string[] = [];
  for (const theme of activeThemes) {
    const keywords = themeMap[theme];
    if (keywords.some((kw) => stmtLower.includes(kw))) {
      themeMatches.push(theme);
    }
  }

  // Value alignment with declaration themes
  const valueAlignment: string[] = [];
  const declarationWords = extractKeywords(declLower);
  for (let i = 0; i < valuesList.length; i++) {
    const vl = valuesLower[i];
    let aligned = false;
    for (const theme of activeThemes) {
      const keywords = themeMap[theme];
      if (keywords.some((kw) => vl.includes(kw)) || vl.includes(theme)) {
        aligned = true;
        break;
      }
    }
    if (!aligned) {
      for (const dw of declarationWords) {
        if (vl.includes(dw)) { aligned = true; break; }
      }
    }
    if (aligned) valueAlignment.push(valuesList[i]);
  }

  // Combined themes
  const valueThemeMatches: string[] = [];
  for (const theme of activeThemes) {
    const keywords = themeMap[theme];
    for (const vl of valuesLower) {
      if (keywords.some((kw) => vl.includes(kw)) || vl.includes(theme)) {
        if (!valueThemeMatches.includes(theme)) valueThemeMatches.push(theme);
        break;
      }
    }
  }

  const combinedThemes = new Set([...themeMatches, ...valueThemeMatches]);
  const goalCoverage = activeThemes.length > 0 ? Math.min(themeMatches.length / activeThemes.length, 1) : 0;
  const valueCoverage = activeThemes.length > 0 ? Math.min(valueThemeMatches.length / activeThemes.length, 1) : 0;
  const valueRatio = valuesList.length > 0 ? valueAlignment.length / valuesList.length : 0;
  const combinedCoverage = activeThemes.length > 0 ? Math.min(combinedThemes.size / activeThemes.length, 1) : 0;

  const rawScore = combinedCoverage * 35 + goalCoverage * 25 + valueRatio * 25 + valueCoverage * 15;
  let score: number;
  if (combinedThemes.size > 0) {
    score = Math.max(Math.round(rawScore), 40 + combinedThemes.size * 8);
  } else {
    score = Math.max(Math.round(rawScore), 30);
  }
  score = Math.min(score, 100);

  const rating = getAlignmentRating(score);
  const matchedNames = [...combinedThemes].join(", ");

  // Themes in declaration but NOT in goal or values
  const missingThemes = activeThemes.filter((t) => !combinedThemes.has(t));
  const missingNames = missingThemes.join(", ");

  // Suggested values: declaration themes not yet in the student's values list
  const suggestedValues = missingThemes
    .filter((t) => !valuesLower.some((vl) => vl.includes(t) || themeMap[t]?.some((kw) => vl.includes(kw))))
    .slice(0, 3);

  // Build a rewritten goal suggestion by prepending 1-2 declaration keywords
  let rewrittenGoal: string | undefined;
  if (missingThemes.length > 0) {
    const adverbs: Record<string, string> = {
      courage: "courageously", power: "powerfully", love: "lovingly",
      commitment: "committedly", joy: "joyfully", greatness: "with greatness",
      unstoppable: "relentlessly", care: "caringly", inspire: "inspiringly",
      passion: "passionately", freedom: "freely", gratitude: "gratefully",
      responsibility: "responsibly", abundance: "abundantly", creativity: "creatively",
      trust: "with trust", wholeness: "wholeheartedly", vulnerability: "openly",
      worthy: "with confidence", gift: "generously", miracle: "miraculously",
    };
    const picks = missingThemes.slice(0, 2).map((t) => adverbs[t] || t).join(" and ");
    rewrittenGoal = `I ${picks} commit to ${goalStatement.replace(/^i\s+(will|want to|commit to|am going to)\s*/i, "").trim()}`;
  }

  let insight: string;
  let whyThisRating: string;
  if (rating === "Excellent") {
    insight = `Excellent alignment. The goal statement embodies the declaration "${declaration}" through themes of ${matchedNames}. As the student pursues this goal, they are living their declaration. Celebrate and reinforce this connection.`;
    whyThisRating = `Your goal statement, values, and declaration are deeply connected. Themes of ${matchedNames} run through all three layers.`;
  } else if (rating === "Acceptable") {
    insight = `Good alignment. The goal connects to the declaration through ${matchedNames || "shared intention"}. Coaching opportunity: Ask "As you work on this goal, how do you experience yourself as '${declaration}'?" to deepen the felt connection.`;
    whyThisRating = `Good alignment overall. Your goal reflects ${matchedNames || "some shared themes"}${missingNames ? `, though "${missingNames}" from your declaration could be stronger` : ""}.`;
  } else if (rating === "Moderate") {
    insight = `Partial alignment. The goal connects somewhat to the declaration, but key themes are missing. Invite the student to explore: "How can pursuing this goal become a way of living '${declaration}' every day?"`;
    whyThisRating = `Partial alignment. Your declaration's themes of ${matchedNames || "some ideas"} appear in the goal, but ${missingNames ? `"${missingNames}"` : "other themes"} are missing. The goal reads more transactional than personal.`;
  } else {
    insight = `The connection between this goal and the declaration "${declaration}" needs strengthening. Invite the student to explore: "How can pursuing this goal become a direct expression of who you are?"`;
    whyThisRating = `The goal and declaration feel disconnected. Your declaration speaks of ${activeThemes.join(", ") || "personal being"} but the goal statement doesn't echo any of these. Goals are easier to pursue when they express who you're being, not just what you're doing.`;
  }

  return { score, rating, themeMatches: [...combinedThemes], missingThemes, valueAlignment, suggestedValues, insight, whyThisRating, rewrittenGoal };
}

// ─── Assessment 2: Goal → Milestones → Actions Alignment ────────

function assessGoalMilestoneAlignment(
  goalStatement: string,
  values: string | null,
  milestones: MilestoneData[]
): GoalMilestoneAssessment {
  const goalKeywords = extractKeywords(goalStatement);
  const valuesList = (values || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  // Expand goal keywords with theme family words
  const expandedGoalTerms = new Set(goalKeywords);
  for (const kw of goalKeywords) {
    for (const [, family] of Object.entries(themeMap)) {
      if (family.includes(kw)) {
        family.forEach((f) => expandedGoalTerms.add(f));
      }
    }
  }

  const findings: string[] = [];
  let milestonesWithGoalAlignment = 0;
  let milestonesWithActions = 0;
  let actionsAlignedToMilestone = 0;
  let totalActionSets = 0;
  let valuesInActions = 0;
  let totalActionsChecked = 0;

  for (const m of milestones) {
    const desc = (m.milestoneDescription || "").toLowerCase();
    const descKeywords = extractKeywords(desc);

    // Goal → Milestone alignment
    const goalOverlap = descKeywords.filter((dk) => expandedGoalTerms.has(dk));
    if (goalOverlap.length > 0 || descKeywords.length === 0) {
      milestonesWithGoalAlignment++;
    }

    // Milestone → Actions alignment
    let actions: { text: string; done: boolean }[] = [];
    try {
      actions = JSON.parse(m.actions || "[]");
    } catch {}

    if (actions.length > 0) {
      milestonesWithActions++;
      totalActionSets++;

      const allActionText = actions.map((a) => a.text.toLowerCase()).join(" ");
      const actionKeywords = extractKeywords(allActionText);

      // Check if actions relate to the milestone description
      const milestoneOverlap = actionKeywords.filter((ak) => {
        if (descKeywords.includes(ak)) return true;
        // Also check expanded goal terms (actions should ultimately serve the goal)
        if (expandedGoalTerms.has(ak)) return true;
        return false;
      });

      if (milestoneOverlap.length > 0) {
        actionsAlignedToMilestone++;
      }

      // Check if values appear in actions
      for (const action of actions) {
        totalActionsChecked++;
        const actionLower = action.text.toLowerCase();
        for (const val of valuesList) {
          const valKeywords = themeMap[val] || [val];
          if (valKeywords.some((vk) => actionLower.includes(vk))) {
            valuesInActions++;
            break;
          }
        }
      }
    }
  }

  // Score calculation
  const totalMilestones = milestones.length || 1;
  const goalToMilestonesScore = Math.round((milestonesWithGoalAlignment / totalMilestones) * 100);

  let milestonesToActionsScore: number;
  if (totalActionSets > 0) {
    milestonesToActionsScore = Math.round((actionsAlignedToMilestone / totalActionSets) * 100);
  } else {
    milestonesToActionsScore = 0;
    findings.push("No action plans have been written yet for any week.");
  }

  const valuesScore = totalActionsChecked > 0
    ? Math.round((valuesInActions / totalActionsChecked) * 100)
    : 0;

  // Weighted overall
  let overallScore: number;
  if (totalActionSets > 0) {
    overallScore = Math.round(
      goalToMilestonesScore * 0.4 +
      milestonesToActionsScore * 0.4 +
      valuesScore * 0.2
    );
  } else {
    overallScore = Math.round(goalToMilestonesScore * 0.6 + valuesScore * 0.4);
  }

  // Floor: if there are actions, minimum score is 30
  if (totalActionSets > 0 && overallScore < 30) {
    overallScore = 30;
  }

  const rating = getAlignmentRating(overallScore);

  // Generate findings
  if (milestonesWithActions < totalMilestones && milestonesWithActions > 0) {
    const missing = totalMilestones - milestonesWithActions;
    findings.push(`${missing} of ${totalMilestones} weeks have no action plans yet.`);
  }

  if (totalActionSets > 0 && actionsAlignedToMilestone < totalActionSets) {
    const gap = totalActionSets - actionsAlignedToMilestone;
    findings.push(`${gap} week(s) have action plans that could be more directly connected to the goal statement.`);
  }

  if (valuesScore > 0 && valuesScore < 50) {
    findings.push("The student's declared values appear infrequently in their action plans. Encourage them to infuse their values into how they describe their actions.");
  } else if (valuesScore >= 50) {
    findings.push("The student's values are reflected in their action plans, showing intentional alignment.");
  }

  // Track disconnected weeks (action plans with 0 alignment to goal)
  const disconnectedWeeks: number[] = [];
  for (const m of milestones) {
    let actions: { text: string; done: boolean }[] = [];
    try { actions = JSON.parse(m.actions || "[]"); } catch {}
    if (actions.length > 0) {
      const allActionText = actions.map((a) => a.text.toLowerCase()).join(" ");
      const actionKeywords = extractKeywords(allActionText);
      const goalKeywordsArr = extractKeywords(goalStatement);
      const expandedGoalTerms2 = new Set(goalKeywordsArr);
      for (const kw of goalKeywordsArr) {
        for (const [, family] of Object.entries(themeMap)) {
          if (family.includes(kw)) family.forEach((f) => expandedGoalTerms2.add(f));
        }
      }
      const milestoneDesc = (m.milestoneDescription || "").toLowerCase();
      const descKeywords = extractKeywords(milestoneDesc);
      const hasOverlap = actionKeywords.some((ak) => descKeywords.includes(ak) || expandedGoalTerms2.has(ak));
      if (!hasOverlap) disconnectedWeeks.push(m.weekNumber);
    }
  }

  // Recommendation
  let recommendation: string;
  let whyThisRating: string;
  if (rating === "Excellent") {
    recommendation = "The action plans are well-aligned with the milestones and goal statement. The student demonstrates a clear thread from weekly actions to goal achievement. Affirm this coherent approach in coaching.";
    whyThisRating = `Strong end-to-end coherence: goal → milestones → actions all speak the same language. ${totalActionSets > 0 ? `${actionsAlignedToMilestone} of ${totalActionSets} weeks show clear alignment.` : ""}`;
  } else if (rating === "Acceptable") {
    recommendation = "Good foundation of alignment. Some weeks could benefit from more intentional connection to the goal statement. Ask: \"How does this week's action plan move you closer to your goal?\"";
    whyThisRating = `Most weeks connect well to the goal, but ${disconnectedWeeks.length > 0 ? `weeks ${disconnectedWeeks.join(", ")} could be more directly tied to the goal statement` : "a few weeks could be stronger"}.`;
  } else if (rating === "Moderate") {
    recommendation = "There is a foundation of alignment, but several weeks need stronger connection. Help the student see the thread: Declaration → Goal → Milestone → Weekly Actions.";
    whyThisRating = `Partial alignment. Goal-to-milestone connection scores ${goalToMilestonesScore}%, but milestone-to-action connection is ${milestonesToActionsScore}%. ${disconnectedWeeks.length > 0 ? `Weeks ${disconnectedWeeks.join(", ")} have disconnected action plans.` : ""}`;
  } else {
    if (totalActionSets === 0) {
      recommendation = "No action plans have been created yet. Encourage the student to write specific, measurable action steps for each week that directly support their goal statement.";
      whyThisRating = "No action plans have been written yet, so alignment cannot be established. The goal statement exists, but the weekly execution plan is missing.";
    } else {
      recommendation = "The action plans need stronger alignment to the goal statement. Ask: \"If someone read only your action plans, would they know what goal you're pursuing?\"";
      whyThisRating = `The weekly actions don't clearly connect to the goal or milestones. ${disconnectedWeeks.length > 0 ? `Weeks ${disconnectedWeeks.join(", ")} have action plans that feel unrelated to the goal.` : "Most weeks lack visible connection to the goal statement."}`;
    }
  }

  return {
    goalToMilestonesScore,
    milestonesToActionsScore,
    overallScore,
    rating,
    findings,
    recommendation,
    whyThisRating,
    disconnectedWeeks,
  };
}

// ─── Score Ring ──────────────────────────────────────────────────

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const center = size / 2;
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#3b82f6" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={4} />
      <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circumference} strokeDashoffset={circumference - filled}
        strokeLinecap="round" transform={`rotate(-90 ${center} ${center})`}
        className="transition-all duration-700" />
      <text x={center} y={center} textAnchor="middle" dominantBaseline="central"
        className="fill-foreground font-bold" fontSize={size > 50 ? 14 : 11}>
        {score}
      </text>
    </svg>
  );
}

// ─── Rating Badge ───────────────────────────────────────────────

function RatingBadge({ rating }: { rating: AlignmentRating }) {
  const config: Record<AlignmentRating, { icon: typeof CheckCircle; bg: string; text: string; border: string }> = {
    Excellent:          { icon: CheckCircle,   bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
    Acceptable:         { icon: CheckCircle,   bg: "bg-blue-500/10",    text: "text-blue-600",    border: "border-blue-500/20"    },
    Moderate:           { icon: Info,          bg: "bg-amber-500/10",   text: "text-amber-600",   border: "border-amber-500/20"   },
    "Needs Attention":  { icon: AlertTriangle, bg: "bg-red-500/10",     text: "text-red-600",     border: "border-red-500/20"     },
  };
  const c = config[rating];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      <Icon className="h-3.5 w-3.5" />
      {rating} Alignment
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────

interface Props {
  studentId: string;
  goalType: string;
  goalStatement: string;
  valuesDeclaration: string | null;
  milestones: MilestoneData[];
}

export function AlignmentAssessmentPanel({
  studentId,
  goalType,
  goalStatement,
  valuesDeclaration,
  milestones,
}: Props) {
  const [declaration, setDeclaration] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded1, setExpanded1] = useState(false);
  const [expanded2, setExpanded2] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStudentAlignment(studentId);
        setDeclaration(data.declaration);
      } catch {
        console.error("Failed to load alignment data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  if (loading) return null;

  const declAssessment = declaration
    ? assessDeclarationAlignment(declaration, goalStatement, valuesDeclaration)
    : null;

  const goalMilestoneAssessment = assessGoalMilestoneAlignment(
    goalStatement,
    valuesDeclaration,
    milestones
  );

  const goalLabel =
    goalType === "enrollment" ? "Enrollment" : goalType === "personal" ? "Personal" : "Professional";

  return (
    <div className="space-y-3">
      {/* Coach-only banner */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5" />
        <span>Coach Assessment — not visible to student</span>
      </div>

      {/* Assessment 1: Declaration → Goal */}
      {declAssessment && declaration && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setExpanded1(!expanded1)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ScoreRing score={declAssessment.score} size={44} />
              <div className="text-left">
                <p className="text-sm font-semibold">Declaration → {goalLabel} Goal</p>
                <p className="text-xs text-muted-foreground">
                  Does &ldquo;{declaration}&rdquo; align with this goal?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RatingBadge rating={declAssessment.rating} />
              {expanded1 ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </button>

          {expanded1 && (
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              {/* Why this rating */}
              <div className="rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why this rating</p>
                <p className="text-sm">{declAssessment.whyThisRating}</p>
              </div>

              <p className="text-sm text-muted-foreground">{declAssessment.insight}</p>

              {declAssessment.themeMatches.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Shared Themes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {declAssessment.themeMatches.map((t) => (
                      <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-600 capitalize">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {declAssessment.valueAlignment.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Aligned Values</p>
                  <div className="flex flex-wrap gap-1.5">
                    {declAssessment.valueAlignment.map((v) => (
                      <span key={v} className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-600">{v}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions box — all ratings, label varies */}
              {(() => {
                const hasSuggestions = declAssessment.rewrittenGoal || declAssessment.suggestedValues.length > 0 || declAssessment.missingThemes.length > 0;
                if (!hasSuggestions) return null;
                const suggestionLabel =
                  declAssessment.rating === "Excellent" ? "✨ Optional Enhancement" :
                  declAssessment.rating === "Acceptable" ? "💡 Optional Suggestions" :
                  declAssessment.rating === "Moderate" ? "📝 Recommended Improvements" :
                  "⚠️ Important: Action Needed";
                const borderColor =
                  declAssessment.rating === "Excellent" ? "border-emerald-200 dark:border-emerald-800" :
                  declAssessment.rating === "Acceptable" ? "border-blue-200 dark:border-blue-800" :
                  declAssessment.rating === "Moderate" ? "border-amber-200 dark:border-amber-800" :
                  "border-red-200 dark:border-red-800";
                const bgColor =
                  declAssessment.rating === "Excellent" ? "bg-emerald-50 dark:bg-emerald-950/20" :
                  declAssessment.rating === "Acceptable" ? "bg-blue-50 dark:bg-blue-950/20" :
                  declAssessment.rating === "Moderate" ? "bg-amber-50 dark:bg-amber-950/20" :
                  "bg-red-50 dark:bg-red-950/20";
                const labelColor =
                  declAssessment.rating === "Excellent" ? "text-emerald-700 dark:text-emerald-400" :
                  declAssessment.rating === "Acceptable" ? "text-blue-700 dark:text-blue-400" :
                  declAssessment.rating === "Moderate" ? "text-amber-700 dark:text-amber-400" :
                  "text-red-700 dark:text-red-400";
                return (
                  <div className={`rounded-lg border ${borderColor} ${bgColor} p-3 space-y-2`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>{suggestionLabel}</p>
                    {declAssessment.rewrittenGoal && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Try rephrasing the goal statement:</p>
                        <p className="text-sm italic">&ldquo;{declAssessment.rewrittenGoal}&rdquo;</p>
                      </div>
                    )}
                    {declAssessment.suggestedValues.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Consider adding these values to better reflect your declaration:</p>
                        <div className="flex flex-wrap gap-1">
                          {declAssessment.suggestedValues.map((v) => (
                            <span key={v} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary capitalize">{v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {declAssessment.missingThemes.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Declaration themes not yet in goal: <span className="font-medium capitalize">{declAssessment.missingThemes.join(", ")}</span>
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Assessment 2: Goal → Milestones → Actions */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setExpanded2(!expanded2)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ScoreRing score={goalMilestoneAssessment.overallScore} size={44} />
            <div className="text-left">
              <p className="text-sm font-semibold">Goal → Milestones → Actions</p>
              <p className="text-xs text-muted-foreground">
                Do the action plans support the milestones and goal?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RatingBadge rating={goalMilestoneAssessment.rating} />
            {expanded2 ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </button>

        {expanded2 && (
          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
            {/* Why this rating */}
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why this rating</p>
              <p className="text-sm">{goalMilestoneAssessment.whyThisRating}</p>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Goal → Milestones</p>
                <p className="text-lg font-bold">{goalMilestoneAssessment.goalToMilestonesScore}%</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Milestones → Actions</p>
                <p className="text-lg font-bold">{goalMilestoneAssessment.milestonesToActionsScore}%</p>
              </div>
            </div>

            {/* Findings */}
            {goalMilestoneAssessment.findings.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Findings</p>
                <ul className="space-y-1">
                  {goalMilestoneAssessment.findings.map((f, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-xs font-medium text-primary mb-1">Coaching Recommendation</p>
              <p className="text-sm">{goalMilestoneAssessment.recommendation}</p>
            </div>

            {/* Suggestions box — all ratings, label varies */}
            {(() => {
              const hasDisconnected = goalMilestoneAssessment.disconnectedWeeks.length > 0;
              const hasFindings = goalMilestoneAssessment.findings.length > 0;
              if (!hasDisconnected && goalMilestoneAssessment.rating === "Excellent") return null;
              const suggestionLabel =
                goalMilestoneAssessment.rating === "Excellent" ? "✨ Optional Enhancement" :
                goalMilestoneAssessment.rating === "Acceptable" ? "💡 Optional Suggestions" :
                goalMilestoneAssessment.rating === "Moderate" ? "📝 Recommended Improvements" :
                "⚠️ Important: Action Needed";
              const borderColor =
                goalMilestoneAssessment.rating === "Excellent" ? "border-emerald-200 dark:border-emerald-800" :
                goalMilestoneAssessment.rating === "Acceptable" ? "border-blue-200 dark:border-blue-800" :
                goalMilestoneAssessment.rating === "Moderate" ? "border-amber-200 dark:border-amber-800" :
                "border-red-200 dark:border-red-800";
              const bgColor =
                goalMilestoneAssessment.rating === "Excellent" ? "bg-emerald-50 dark:bg-emerald-950/20" :
                goalMilestoneAssessment.rating === "Acceptable" ? "bg-blue-50 dark:bg-blue-950/20" :
                goalMilestoneAssessment.rating === "Moderate" ? "bg-amber-50 dark:bg-amber-950/20" :
                "bg-red-50 dark:bg-red-950/20";
              const labelColor =
                goalMilestoneAssessment.rating === "Excellent" ? "text-emerald-700 dark:text-emerald-400" :
                goalMilestoneAssessment.rating === "Acceptable" ? "text-blue-700 dark:text-blue-400" :
                goalMilestoneAssessment.rating === "Moderate" ? "text-amber-700 dark:text-amber-400" :
                "text-red-700 dark:text-red-400";
              return (
                <div className={`rounded-lg border ${borderColor} ${bgColor} p-3 space-y-2`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>{suggestionLabel}</p>
                  {hasDisconnected && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Weeks where action plans don&apos;t connect to the milestone:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {goalMilestoneAssessment.disconnectedWeeks.map((w) => (
                          <span key={w} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">Week {w}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!hasDisconnected && hasFindings && (
                    <p className="text-xs text-muted-foreground">
                      Review the findings above and align your weekly action plans more closely to your milestone language.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
