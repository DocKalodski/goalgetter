"use client";

import { useState, useMemo } from "react";
import {
  X, ChevronLeft, ChevronRight, Check, Sparkles, BookOpen,
  Users, Heart, Briefcase, AlertTriangle,
} from "lucide-react";
import {
  GOAL_TEMPLATES,
  WHEEL_AREA_SUGGESTIONS,
  type GoalTemplate,
} from "@/lib/data/goal-templates";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "enrollment" | "personal" | "professional";

interface SubCategory {
  id: string;
  label: string;
  description: string;
  templateId: string;
  safetyNote?: string;
}

interface Props {
  goalType?: Category;
  wheelScores?: Record<string, number>;
  onApply: (template: GoalTemplate, answers: Record<string, string>) => void;
  onClose: () => void;
}

// ─── Sub-category definitions ─────────────────────────────────────────────────

const SUBCATEGORIES: Record<Category, SubCategory[]> = {
  enrollment: [
    {
      id: "enrollment",
      label: "Enroll 1 FLEX + 1 ALC Client",
      description: "Standard: 1 FLEX (May sessions) + 1 ALC (June sessions) through daily outreach.",
      templateId: "enrollment-flex-alc",
    },
    {
      id: "enrollment-high",
      label: "High-Volume Enrollment (2+)",
      description: "For coaches targeting 2+ FLEX and/or 2+ ALC clients through pipeline management.",
      templateId: "enrollment-high-volume",
    },
  ],
  personal: [
    {
      id: "health",
      label: "Health & Body",
      description: "Weight, fitness, medical — doctor-cleared, safe, sustainable 8-week plan.",
      templateId: "personal-health",
      safetyNote: "⚕️ Doctor consultation required",
    },
    {
      id: "beingness",
      label: "Mindset & Being-ness",
      description: "Embody a specific essence quality (discipline, calm, joy) through a daily practice.",
      templateId: "personal-beingness",
    },
    {
      id: "relationship-deepen",
      label: "Deepening a Relationship",
      description: "Show up consistently for a partner, parent, sibling, or friend — your actions only.",
      templateId: "personal-relationship-deepen",
    },
    {
      id: "relationship-prepare",
      label: "Becoming Partner-Ready",
      description: "Build the inner qualities you want to bring to a future relationship.",
      templateId: "personal-relationship-prepare",
    },
  ],
  professional: [
    {
      id: "income-employed",
      label: "Extra Income (Employed)",
      description: "Generate additional monthly income through freelance, side coaching, or selling.",
      templateId: "professional-income-employed",
    },
    {
      id: "income-exploring",
      label: "Finding Income (Exploring)",
      description: "Secure consistent income from scratch — freelance, gig, coaching, or employment.",
      templateId: "professional-income-exploring",
    },
    {
      id: "career-beingness",
      label: "Career Identity",
      description: "Embody the professional qualities of the role you want — your presence, not a promotion.",
      templateId: "professional-career-beingness",
    },
    {
      id: "skills",
      label: "Skill Building + Showcase",
      description: "Build a creative or professional skill over 8 weeks, capped by a real culminating event.",
      templateId: "professional-skills",
    },
  ],
};

// ─── Wheel suggestion helper ──────────────────────────────────────────────────

function getWheelSuggestion(
  wheelScores: Record<string, number> | undefined,
  category: Category
): string | null {
  if (!wheelScores) return null;
  const relevant = Object.entries(wheelScores)
    .sort((a, b) => a[1] - b[1]) // lowest first
    .slice(0, 3)
    .map(([area]) => area);

  const suggestions = relevant.flatMap((area) => WHEEL_AREA_SUGGESTIONS[area] ?? []);
  const match = GOAL_TEMPLATES.find(
    (t) => t.goalType === category && suggestions.includes(t.id)
  );
  return match ? `Suggested based on your Wheel of Life` : null;
}

// ─── Category icon ────────────────────────────────────────────────────────────

function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  if (category === "enrollment") return <Users className={className} />;
  if (category === "personal") return <Heart className={className} />;
  return <Briefcase className={className} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GoalTemplateModal({ goalType, wheelScores, onApply, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(goalType ? 2 : 1);
  const [category, setCategory] = useState<Category>(goalType ?? "enrollment");
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [setupGoalCheck, setSetupGoalCheck] = useState<"yes" | "no" | null>(null);

  // Selected template
  const template = useMemo(() => {
    if (!subCategoryId) return null;
    const sub = SUBCATEGORIES[category].find((s) => s.id === subCategoryId);
    if (!sub) return null;
    return GOAL_TEMPLATES.find((t) => t.id === sub.templateId) ?? null;
  }, [category, subCategoryId]);

  // SMARTER preview (generated from answers)
  const smarterPreview = useMemo(() => {
    if (!template) return null;
    try { return template.smarter(answers); } catch { return null; }
  }, [template, answers]);

  // Assembled goal statement for preview
  const goalStatementPreview = useMemo(() => {
    if (!smarterPreview) return "";
    const s = smarterPreview.specificDetails?.trim();
    const m = smarterPreview.measurableCriteria?.trim();
    const t = smarterPreview.endDate?.trim();
    const e = smarterPreview.excitingMotivation?.trim();
    const rw = smarterPreview.rewardingBenefits?.trim();
    const parts: string[] = [];
    let core = "I will " + (s ? s.replace(/^I will\s+/i, "").replace(/\.$/, "") : "[specific goal]");
    if (m) core += `, achieving ${m.replace(/\.$/, "")}`;
    if (t) core += ` by ${t.replace(/\.$/, "")}`;
    parts.push(core + ".");
    if (e && rw) parts.push(`I am driven by ${e.replace(/\.$/, "")}, and my reward is ${rw.replace(/\.$/, "")}.`);
    else if (e) parts.push(`I am driven by ${e.replace(/\.$/, "")}.`);
    return parts.join(" ");
  }, [smarterPreview]);

  const wheelSuggestion = getWheelSuggestion(wheelScores, category);

  function handleCategorySelect(cat: Category) {
    setCategory(cat);
    setSubCategoryId(null);
    setAnswers({});
    setSetupGoalCheck(null);
    setStep(2);
  }

  function handleSubCategorySelect(subId: string) {
    setSubCategoryId(subId);
    // Pre-fill default values
    const sub = SUBCATEGORIES[category].find((s) => s.id === subId);
    const tmpl = sub ? GOAL_TEMPLATES.find((t) => t.id === sub.templateId) : null;
    if (tmpl) {
      const defaults: Record<string, string> = {};
      for (const q of tmpl.questions) {
        if (q.defaultValue) defaults[q.id] = q.defaultValue;
      }
      setAnswers(defaults);
    }
    setStep(3);
  }

  function handleAnswerChange(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handlePreview() {
    setStep(4);
  }

  function handleApply() {
    if (!template) return;
    // Strip "other" sentinel from all multiselect answers before applying
    const cleanedAnswers: Record<string, string> = { ...answers };
    for (const q of template.questions) {
      if (q.type === "multiselect" && cleanedAnswers[q.id]) {
        cleanedAnswers[q.id] = cleanedAnswers[q.id]
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s && s !== "other")
          .join(", ");
      }
    }
    onApply(template, cleanedAnswers);
  }

  // ── Step 1: Category ──────────────────────────────────────────────────────

  function renderStep1() {
    const categories: { id: Category; label: string; desc: string; color: string; borderColor: string }[] = [
      {
        id: "enrollment",
        label: "Enrollment",
        desc: "Enroll FLEX and ALC clients through daily outreach",
        color: "text-blue-500",
        borderColor: "border-blue-500/40 hover:border-blue-500",
      },
      {
        id: "personal",
        label: "Personal",
        desc: "Health, mindset, relationships — who you become",
        color: "text-yellow-500",
        borderColor: "border-yellow-500/40 hover:border-yellow-500",
      },
      {
        id: "professional",
        label: "Professional",
        desc: "Income, career identity, skill building",
        color: "text-purple-500",
        borderColor: "border-purple-500/40 hover:border-purple-500",
      },
    ];

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold">What area is most alive for you in LEAP 99?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a category to find your goal template.
          </p>
        </div>
        {wheelSuggestion && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary font-medium">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            {wheelSuggestion}
          </div>
        )}
        <div className="grid gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.id)}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 bg-card text-left transition-all hover:shadow-md ${cat.borderColor}`}
            >
              <div className={`p-2.5 rounded-xl bg-muted shrink-0`}>
                <CategoryIcon category={cat.id} className={`h-5 w-5 ${cat.color}`} />
              </div>
              <div>
                <p className={`font-bold text-base ${cat.color}`}>{cat.label}</p>
                <p className="text-sm text-muted-foreground">{cat.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Is this goal 100% within your power to achieve, even if others don&apos;t cooperate?{" "}
          <span className="text-primary font-medium">All templates are designed this way.</span>
        </p>
      </div>
    );
  }

  // ── Step 2: Sub-category ──────────────────────────────────────────────────

  function renderStep2() {
    const subs = SUBCATEGORIES[category];
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold">Choose your {category} focus</h3>
          <p className="text-sm text-muted-foreground mt-1">Each option comes with a full 8-week plan.</p>
        </div>
        <div className="grid gap-3">
          {subs.map((sub) => {
            const tmpl = GOAL_TEMPLATES.find((t) => t.id === sub.templateId);
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSubCategorySelect(sub.id)}
                className="flex items-start gap-4 px-4 py-4 rounded-xl border-2 border-border bg-card text-left hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{sub.label}</p>
                    {sub.safetyNote && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium dark:bg-amber-900/50 dark:text-amber-400">
                        {sub.safetyNote}
                      </span>
                    )}
                    {tmpl?.wheelAreaHint && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {tmpl.wheelAreaHint}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{sub.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Step 3: Questionnaire ─────────────────────────────────────────────────

  function renderStep3() {
    if (!template) return null;
    return (
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-bold">{template.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
          {template.safetyNote && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {template.safetyNote}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {template.questions
            .filter((q) => {
              if (!q.dependsOn) return true;
              const depVal = answers[q.dependsOn.id] ?? "";
              if (q.dependsOn.notEmpty) return depVal.trim().length > 0;
              return depVal.includes(q.dependsOn.value ?? "");
            })
            .map((q) => (
            <div key={q.id} className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground block">
                {q.label}
                {q.unit && <span className="text-xs text-muted-foreground ml-1">({q.unit})</span>}
              </label>
              {q.hint && <p className="text-xs text-muted-foreground">{q.hint}</p>}

              {q.type === "select" && q.options ? (
                // Single-select — radio pill buttons (click one deselects others)
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const selected = (answers[q.id] ?? q.defaultValue ?? "") === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                        }`}
                      >
                        {selected && <Check className="inline h-3 w-3 mr-1" />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : q.type === "multiselect" && q.options ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {/* Preset option pills */}
                    {q.options.map((opt) => {
                      const current = (answers[q.id] || "").split(",").map((s) => s.trim()).filter(Boolean);
                      const selected = current.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            const next = selected
                              ? current.filter((v) => v !== opt)
                              : [...current, opt];
                            handleAnswerChange(q.id, next.join(", "));
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                          }`}
                        >
                          {selected && <Check className="inline h-3 w-3 mr-1" />}
                          {opt}
                        </button>
                      );
                    })}
                    {/* Custom value pills (added via "other") */}
                    {(answers[q.id] || "")
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s && s !== "other" && !q.options!.includes(s))
                      .map((customVal) => (
                        <button
                          key={customVal}
                          type="button"
                          onClick={() => {
                            const current = (answers[q.id] || "").split(",").map((s) => s.trim()).filter((s) => s && s !== customVal);
                            handleAnswerChange(q.id, current.join(", "));
                          }}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-primary text-primary-foreground border-primary"
                        >
                          <Check className="inline h-3 w-3 mr-1" />
                          {customVal}
                          <X className="inline h-3 w-3 ml-1 opacity-70" />
                        </button>
                      ))}
                  </div>
                  {(answers[q.id] || "").split(",").map((s) => s.trim()).filter(Boolean).includes("other") && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your answer and press Add..."
                        value={answers[q.id + "_other"] ?? ""}
                        onChange={(e) => handleAnswerChange(q.id + "_other", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (answers[q.id + "_other"] ?? "").trim();
                            if (!val) return;
                            const current = (answers[q.id] || "").split(",").map((s) => s.trim()).filter((s) => s && s !== "other");
                            // Keep "other" so user can keep adding more custom values
                            handleAnswerChange(q.id, [...current, val, "other"].join(", "));
                            handleAnswerChange(q.id + "_other", "");
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-primary/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (answers[q.id + "_other"] ?? "").trim();
                          if (!val) return;
                          const current = (answers[q.id] || "").split(",").map((s) => s.trim()).filter((s) => s && s !== "other");
                          // Keep "other" so user can keep adding more custom values
                          handleAnswerChange(q.id, [...current, val, "other"].join(", "));
                          handleAnswerChange(q.id + "_other", "");
                        }}
                        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type={q.type === "number" ? "number" : "text"}
                  value={answers[q.id] ?? q.defaultValue ?? ""}
                  placeholder={q.placeholder ?? ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
            </div>
          ))}
        </div>

        {/* Setup goal check */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-semibold">
            Is this goal 100% within your power to achieve, even if others don&apos;t cooperate?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSetupGoalCheck("yes")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                setupGoalCheck === "yes"
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "border-border hover:border-emerald-500/50 text-muted-foreground"
              }`}
            >
              ✓ Yes — it&apos;s all on me
            </button>
            <button
              type="button"
              onClick={() => setSetupGoalCheck("no")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                setupGoalCheck === "no"
                  ? "bg-orange-500 text-white border-orange-500"
                  : "border-border hover:border-orange-500/50 text-muted-foreground"
              }`}
            >
              ✗ It depends on others
            </button>
          </div>
          {setupGoalCheck === "no" && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              ⚠️ Every goal in LEAP must be 100% within your control. Adjust your goal so that success depends only on your actions — not on another person&apos;s decision or response.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Step 4: SMARTER Preview ───────────────────────────────────────────────

  function renderStep4() {
    if (!template || !smarterPreview) return null;

    const fields = [
      { letter: "S", label: "Specific", value: smarterPreview.specificDetails },
      { letter: "M", label: "Measurable", value: smarterPreview.measurableCriteria },
      { letter: "A", label: "Attainable", value: smarterPreview.achievableResources },
      { letter: "R", label: "Risk", value: smarterPreview.relevantAlignment },
      { letter: "T", label: "Time-bound", value: smarterPreview.endDate },
      { letter: "E", label: "Exciting", value: smarterPreview.excitingMotivation },
      { letter: "R", label: "Rewarding", value: smarterPreview.rewardingBenefits },
    ];

    return (
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-bold">Your Proposed Goal</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Review and confirm — all fields are fully editable after you apply.
          </p>
        </div>

        {/* Goal Statement */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Goal Statement</p>
          <p className="text-sm font-semibold leading-relaxed text-foreground">
            {goalStatementPreview || "Fill in the questionnaire to see your goal statement."}
          </p>
        </div>

        {/* SMARTER fields (collapsed but readable) */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">SMARTER Breakdown</p>
          {fields.map((f, i) => (
            <div key={i} className="flex gap-3 px-3 py-2.5 rounded-lg bg-card border border-border">
              <span className="text-xs font-bold w-5 text-primary shrink-0 pt-0.5">{f.letter}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">{f.label}</p>
                <p className="text-xs text-foreground leading-relaxed">{f.value || <span className="text-muted-foreground italic">Not filled</span>}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 8-week summary note */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-muted/50 border border-border">
          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Applying this template will pre-fill all 8 weekly milestones + action steps.{" "}
            <span className="text-foreground font-medium">Everything is editable</span> after you apply.
          </p>
        </div>
      </div>
    );
  }

  // ── Progress indicator ────────────────────────────────────────────────────

  const stepLabels = goalType
    ? ["Focus", "Questionnaire", "Review"]
    : ["Category", "Focus", "Questionnaire", "Review"];
  const currentStepIdx = goalType ? step - 2 : step - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold">Goal Template Wizard</h2>
          </div>
          <button type="button" onClick={onClose} title="Close" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Step progress */}
        <div className="px-6 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    i < currentStepIdx
                      ? "bg-primary text-primary-foreground"
                      : i === currentStepIdx
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {i < currentStepIdx ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${i === currentStepIdx ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`flex-1 h-px ${i < currentStepIdx ? "bg-primary/40" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between gap-3">
          {/* Back */}
          {step > (goalType ? 2 : 1) ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {/* Next / Apply */}
          {step === 1 && (
            <p className="text-xs text-muted-foreground">Select a category above</p>
          )}
          {step === 2 && (
            <p className="text-xs text-muted-foreground">Select a focus area above</p>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={handlePreview}
              disabled={!template}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Preview Goal
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {step === 4 && (
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check className="h-4 w-4" />
              Apply This Goal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
