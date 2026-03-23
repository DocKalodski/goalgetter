"use client";

import { Brain, Target, AlignLeft, ListChecks, Sparkles } from "lucide-react";

interface AIAssessmentTabProps {
  studentId: string;
}

function PlaceholderSection({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof Brain;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-2">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}/10`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <h3 className="font-semibold text-base">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground pl-11">{description}</p>
      <div className="pl-11 pt-1">
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          Coming soon
        </span>
      </div>
    </div>
  );
}

export function AIAssessmentTab({ studentId }: AIAssessmentTabProps) {
  return (
    <div className="space-y-4">
      <PlaceholderSection
        icon={Target}
        title="SMARTER Goals Assessment"
        description="Evaluate goals against SMARTER criteria: Specific, Measurable, Achievable, Relevant, Time-bound, Evaluated, Reviewed."
        color="text-blue-500"
      />
      <PlaceholderSection
        icon={AlignLeft}
        title="Declaration Alignment"
        description="Assess alignment between the student's declaration and their stated goals and values."
        color="text-purple-500"
      />
      <PlaceholderSection
        icon={ListChecks}
        title="Goals & Milestones Alignment"
        description="Rate how well goals align with milestones and action plan — Excellence, Acceptable, or Developing."
        color="text-yellow-400"
      />
      <PlaceholderSection
        icon={Sparkles}
        title="Action Planner Support"
        description="AI-assisted tool to help coach and student co-create an action plan with milestones and weekly actions."
        color="text-green-500"
      />
    </div>
  );
}
