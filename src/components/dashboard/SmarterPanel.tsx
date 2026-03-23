"use client";

import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SmarterCriterion {
  letter: string;
  label: string;
  passed: boolean;
  partial: boolean;
  feedback: string;
}

function assessSmarter(goalStatement: string, endDate: string | null): SmarterCriterion[] {
  const text = goalStatement.toLowerCase();

  // S – Specific: mentions specific numbers, programs, people counts, activities
  const specificPatterns = /\d+\s*(people|person|clients|members|leads|signups|flex|alc|leap|event|session|meeting|\%)/i;
  const specificNames = /flex|alc|leap|team|council|group|program/i;
  const sSpecific = specificPatterns.test(goalStatement);
  const sPartial = !sSpecific && specificNames.test(goalStatement);

  // M – Measurable: has numbers or quantifiable targets
  const measureableNumbers = /\d+/.test(goalStatement);
  const measureWords = /track|measure|count|number|total|achieve|complete/i.test(text);
  const mMeasurable = measureableNumbers;
  const mPartial = !mMeasurable && measureWords;

  // A – Attainable: "I am" declarations (present-tense goal), realistic framing
  const attainableStrong = /\bi am\b/i.test(goalStatement);
  const attainableWeak = /\bi will\b|\bi can\b|\bi commit\b|\bi choose\b/i.test(goalStatement);
  const aAttainable = attainableStrong;
  const aPartial = !aAttainable && attainableWeak;

  // R – Risk: acknowledges challenge, difficulty, or contingency
  const riskWords = /challeng|risk|despite|even if|commit|overcomi|barrier|obstacle|difficult|stretch/i;
  const rPartial = !riskWords.test(goalStatement) && /consistent|disciplin|accountab/i.test(goalStatement);
  const rRisk = riskWords.test(goalStatement);

  // T – Time-bound: has a specific date or deadline
  const timePhrases = /by\s+\w+\s+\d{1,2}|\d{4}|on or before|before\s+\w+|by end|deadline|april|may|june|march|february|january|july/i;
  const tTimeBound = timePhrases.test(goalStatement) || !!endDate;
  const tPartial = false;

  // E – Exciting: emotional, motivational, identity language
  const excitingWords = /committed|passionate|inspir|transform|love|joy|proud|fulfil|unstoppable|amazing|powerful|dedicated|driven/i;
  const eExciting = excitingWords.test(goalStatement);
  const ePartial = !eExciting && /grow|improve|develop|better|success/i.test(goalStatement);

  // R – Rewarding: mentions outcome, benefit, impact
  const rewardWords = /so that|in order to|enabling|empowering|impact|benefit|help|support|contribute|create|build|legacy|freedom|financial/i;
  const rRewarding = rewardWords.test(goalStatement);
  const rRewardPartial = !rRewarding && /achieve|accomplish|reach|attain|earn/i.test(goalStatement);

  return [
    {
      letter: "S",
      label: "Specific",
      passed: sSpecific,
      partial: sPartial,
      feedback: sSpecific
        ? "Goal names specific programs, numbers, or targets."
        : sPartial
        ? "Mentions a program but lacks specific numeric targets."
        : "Add specific counts, programs, or activities (e.g. '4 people in LEAP').",
    },
    {
      letter: "M",
      label: "Measurable",
      passed: mMeasurable,
      partial: mPartial,
      feedback: mMeasurable
        ? "Contains measurable numbers to track progress."
        : mPartial
        ? "Uses tracking language but no numeric targets."
        : "Include a number or metric to track success.",
    },
    {
      letter: "A",
      label: "Attainable",
      passed: aAttainable,
      partial: aPartial,
      feedback: aAttainable
        ? "Uses present-tense 'I am' declaration — strong commitment framing."
        : aPartial
        ? "Future-tense framing — consider rewriting as 'I am...' for stronger commitment."
        : "Reframe as a present-tense commitment: 'I am...'",
    },
    {
      letter: "R",
      label: "Risk",
      passed: rRisk,
      partial: rPartial,
      feedback: rRisk
        ? "Acknowledges challenge or commitment through adversity."
        : rPartial
        ? "Implies commitment but doesn't address specific risks or challenges."
        : "Acknowledge what challenges you'll face and how you'll overcome them.",
    },
    {
      letter: "T",
      label: "Time-bound",
      passed: tTimeBound,
      partial: tPartial,
      feedback: tTimeBound
        ? endDate && !timePhrases.test(goalStatement)
          ? `Deadline set: ${endDate} (from goal end date).`
          : "Contains a clear deadline or date."
        : "Add a specific date or deadline (e.g. 'on or before April 24, 2026').",
    },
    {
      letter: "E",
      label: "Exciting",
      passed: eExciting,
      partial: ePartial,
      feedback: eExciting
        ? "Uses powerful identity or motivational language."
        : ePartial
        ? "Has growth language but could be more emotionally compelling."
        : "Add identity or emotional language ('committed', 'passionate', 'unstoppable').",
    },
    {
      letter: "R",
      label: "Rewarding",
      passed: rRewarding,
      partial: rRewardPartial,
      feedback: rRewarding
        ? "Connects to a meaningful outcome or impact."
        : rRewardPartial
        ? "Implies achievement but doesn't describe the deeper reward or impact."
        : "Describe why this goal matters — who benefits and what changes.",
    },
  ];
}

export function SmarterPanel({
  goalStatement,
  endDate,
}: {
  goalStatement: string;
  endDate: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const criteria = assessSmarter(goalStatement, endDate);
  const passed = criteria.filter((c) => c.passed).length;
  const partial = criteria.filter((c) => !c.passed && c.partial).length;
  const score = Math.round((passed + partial * 0.5) / criteria.length * 100);

  const scoreColor =
    score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-400";
  const scoreBg =
    score >= 80 ? "bg-green-500/10 border-green-500/30" : score >= 60 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-red-500/10 border-red-400/30";

  return (
    <div className={`rounded-xl border p-4 ${scoreBg}`}>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-widest text-muted-foreground">S.M.A.R.T.E.R</span>
          <div className="flex gap-1">
            {criteria.map((c) => (
              <span
                key={c.letter + c.label}
                className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded ${
                  c.passed
                    ? "bg-green-500 text-white"
                    : c.partial
                    ? "bg-yellow-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {c.letter}
              </span>
            ))}
          </div>
          <span className={`text-sm font-semibold ${scoreColor}`}>{score}%</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-2">
          {criteria.map((c) => (
            <div key={c.letter + c.label} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {c.passed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : c.partial ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold">
                  {c.letter} – {c.label}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">{c.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
