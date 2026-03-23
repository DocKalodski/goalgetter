"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Sparkles,
  History,
  ListTodo,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  CircleDot,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useNavigation } from "@/components/layout/DashboardShell";
import {
  runAnalysis,
  runCoachAnalysis,
  getAnalysisHistory,
  getAnalysisDetail,
  updateIssueStatus,
  getOpenIssues,
} from "@/lib/actions/insights";
import { getSeverityColors } from "@/lib/utils/achievement-status";
import { getAlignmentTier } from "@/lib/analysis/insights-engine";
import type { AiAnalysis, AiAnalysisIssue } from "@/lib/db/schema";

type TabId = "latest" | "history" | "issues";

interface InsightsPanelProps {
  mode?: "head_coach" | "coach";
}

export function InsightsPanel({ mode = "head_coach" }: InsightsPanelProps) {
  const { setSelectedStudentId, setCurrentPage, setActiveL3Tab } = useNavigation();
  const [activeTab, setActiveTab] = useState<TabId>("latest");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<AiAnalysis[]>([]);
  const [latestIssues, setLatestIssues] = useState<AiAnalysisIssue[]>([]);
  const [openIssues, setOpenIssues] = useState<AiAnalysisIssue[]>([]);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<AiAnalysisIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveNote, setResolveNote] = useState<Record<string, string>>({});
  const [showResolveInput, setShowResolveInput] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [historyData, openData] = await Promise.all([
        getAnalysisHistory(),
        getOpenIssues(),
      ]);
      setAnalyses(historyData);
      setOpenIssues(openData);

      // Load latest analysis issues
      if (historyData.length > 0) {
        const detail = await getAnalysisDetail(historyData[0].id);
        setLatestIssues(detail.issues);
      }
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = mode === "coach" ? await runCoachAnalysis() : await runAnalysis();
      setLatestIssues(result.issues);
      setActiveTab("latest");
      await loadData();
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStatusChange = async (
    issueId: string,
    newStatus: "in_progress" | "resolved" | "dismissed",
    note?: string
  ) => {
    try {
      await updateIssueStatus(issueId, newStatus, note);
      setShowResolveInput(null);
      setResolveNote({});
      await loadData();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleExpandAnalysis = async (analysisId: string) => {
    if (expandedAnalysis === analysisId) {
      setExpandedAnalysis(null);
      return;
    }
    try {
      const detail = await getAnalysisDetail(analysisId);
      setExpandedIssues(detail.issues);
      setExpandedAnalysis(analysisId);
    } catch (error) {
      console.error("Failed to load analysis detail:", error);
    }
  };

  const openCount = openIssues.length;
  const latest = analyses[0];

  const tabs: { id: TabId; label: string; icon: typeof Brain }[] = [
    { id: "latest", label: "Latest", icon: Zap },
    { id: "history", label: "History", icon: History },
    { id: "issues", label: `Open Issues`, icon: ListTodo },
  ];

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      {/* Header — clickable to expand/collapse */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="p-2 rounded-lg bg-accent/10">
            <Brain className="h-5 w-5 text-accent" />
          </div>
          <h3 className="text-lg font-semibold">AI Insights</h3>
          {openCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-medium">
              {openCount} open
            </span>
          )}
          {!expanded && latest && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Last run: {new Date(latest.createdAt).toLocaleDateString()}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
            handleAnalyze();
          }}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {analyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {analyzing ? "Analyzing..." : "Analyze Data"}
        </button>
      </div>

      {/* Tab bar + content — visible when expanded */}
      {expanded && (<>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.id === "issues" && openCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600">
                  {openCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "latest" && (
        <LatestTab
          analysis={latest}
          issues={latestIssues}
          onStatusChange={handleStatusChange}
          showResolveInput={showResolveInput}
          setShowResolveInput={setShowResolveInput}
          resolveNote={resolveNote}
          setResolveNote={setResolveNote}
          onNavigateToAlignment={(studentId) => {
            setSelectedStudentId(studentId);
            setCurrentPage("L3");
            setActiveL3Tab("feedback");
          }}
        />
      )}
      {activeTab === "history" && (
        <HistoryTab
          analyses={analyses}
          expandedAnalysis={expandedAnalysis}
          expandedIssues={expandedIssues}
          onExpand={handleExpandAnalysis}
        />
      )}
      {activeTab === "issues" && (
        <OpenIssuesTab
          issues={openIssues}
          onStatusChange={handleStatusChange}
          showResolveInput={showResolveInput}
          setShowResolveInput={setShowResolveInput}
          resolveNote={resolveNote}
          setResolveNote={setResolveNote}
          onNavigateToAlignment={(studentId) => {
            setSelectedStudentId(studentId);
            setCurrentPage("L3");
            setActiveL3Tab("feedback");
          }}
        />
      )}
      </>)}
    </div>
  );
}

// ─── Issue Card ─────────────────────────────────────────────────

function IssueCard({
  issue,
  onStatusChange,
  showResolveInput,
  setShowResolveInput,
  resolveNote,
  setResolveNote,
  onNavigateToAlignment,
}: {
  issue: AiAnalysisIssue;
  onStatusChange: (id: string, status: "in_progress" | "resolved" | "dismissed", note?: string) => void;
  showResolveInput: string | null;
  setShowResolveInput: (id: string | null) => void;
  resolveNote: Record<string, string>;
  setResolveNote: (notes: Record<string, string>) => void;
  onNavigateToAlignment?: (studentId: string) => void;
}) {
  const colors = getSeverityColors(issue.severity as "critical" | "warning" | "info");
  const SeverityIcon =
    issue.severity === "critical"
      ? AlertTriangle
      : issue.severity === "warning"
      ? AlertCircle
      : Info;

  const StatusIcon =
    issue.status === "resolved"
      ? CheckCircle
      : issue.status === "in_progress"
      ? Clock
      : issue.status === "dismissed"
      ? X
      : CircleDot;

  const statusLabel: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    dismissed: "Dismissed",
  };

  const resolutions: string[] = (() => {
    try {
      return issue.resolutions ? JSON.parse(issue.resolutions) : [];
    } catch {
      return [];
    }
  })();

  // For alignment_gap issues: extract score and show tier badge
  const alignmentScore = (() => {
    if (issue.category !== "alignment_gap") return null;
    const m = issue.title.match(/\((\d+)%\)/);
    return m ? parseInt(m[1]) : null;
  })();
  const alignmentTier = alignmentScore !== null ? getAlignmentTier(alignmentScore) : null;
  const tierColorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/30" },
    green:   { bg: "bg-green-500/10",   text: "text-green-600",   border: "border-green-500/30" },
    yellow:  { bg: "bg-yellow-500/10",  text: "text-yellow-700",  border: "border-yellow-500/30" },
    orange:  { bg: "bg-orange-500/10",  text: "text-orange-600",  border: "border-orange-500/30" },
    red:     { bg: "bg-red-500/10",     text: "text-red-600",     border: "border-red-500/30" },
  };
  const tierColors = alignmentTier ? tierColorMap[alignmentTier.color] : null;

  return (
    <div className={`rounded-lg border-l-4 ${colors.border} bg-card border border-border p-4 space-y-2`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-1 rounded ${colors.bg} mt-0.5`}>
            <SeverityIcon className={`h-3.5 w-3.5 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium">{issue.title}</p>
              {alignmentTier && tierColors && (
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}>
                  {alignmentTier.label} · {alignmentScore}% (target ≥80%)
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
            {resolutions.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-foreground/70">
                  {alignmentTier ? `Suggestions to reach Acceptable (≥80%):` : `Resolution options:`}
                </p>
                <ol className="space-y-1">
                  {resolutions.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                      <span className={`shrink-0 font-semibold ${colors.text}`}>{i + 1}.</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {issue.entityName && (
                <span>{issue.entityType}: {issue.entityName}</span>
              )}
              <span className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusLabel[issue.status]}
              </span>
              {issue.resolvedNote && (
                <span className="italic">Note: {issue.resolvedNote}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {(issue.status === "open" || issue.status === "in_progress") && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            {/* Alignment-specific: navigate to alignment editing module */}
            {issue.category === "alignment_gap" && issue.entityType === "student" && onNavigateToAlignment && (
              <button
                onClick={() => onNavigateToAlignment(issue.entityId)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
              >
                Fix Alignment <ArrowRight className="h-3 w-3" />
              </button>
            )}
            <div className="flex items-center gap-1">
              {issue.status === "open" && (
                <button
                  onClick={() => onStatusChange(issue.id, "in_progress")}
                  className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                >
                  Start Working
                </button>
              )}
              {issue.status === "in_progress" && (
                <button
                  onClick={() => setShowResolveInput(issue.id)}
                  className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                >
                  Resolve
                </button>
              )}
              <button
                onClick={() => onStatusChange(issue.id, "dismissed")}
                className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resolve note input */}
      {showResolveInput === issue.id && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            placeholder="What was done to resolve this?"
            value={resolveNote[issue.id] || ""}
            onChange={(e) =>
              setResolveNote({ ...resolveNote, [issue.id]: e.target.value })
            }
            className="flex-1 text-xs px-3 py-1.5 rounded border border-border bg-background"
          />
          <button
            onClick={() =>
              onStatusChange(issue.id, "resolved", resolveNote[issue.id])
            }
            className="text-xs px-3 py-1.5 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={() => setShowResolveInput(null)}
            className="text-xs px-2 py-1.5 rounded bg-muted hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Latest Tab ─────────────────────────────────────────────────

function LatestTab({
  analysis,
  issues,
  onStatusChange,
  showResolveInput,
  setShowResolveInput,
  resolveNote,
  setResolveNote,
  onNavigateToAlignment,
}: {
  analysis: AiAnalysis | undefined;
  issues: AiAnalysisIssue[];
  onStatusChange: (id: string, status: "in_progress" | "resolved" | "dismissed", note?: string) => void;
  showResolveInput: string | null;
  setShowResolveInput: (id: string | null) => void;
  resolveNote: Record<string, string>;
  setResolveNote: (notes: Record<string, string>) => void;
  onNavigateToAlignment?: (studentId: string) => void;
}) {
  if (!analysis) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Brain className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No analysis has been run yet.</p>
        <p className="text-xs mt-1">Click "Analyze Data" to run your first analysis.</p>
      </div>
    );
  }

  const criticalIssues = issues.filter((i) => i.severity === "critical");
  const warningIssues = issues.filter((i) => i.severity === "warning");
  const infoIssues = issues.filter((i) => i.severity === "info");

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-muted/50">
        <p className="text-sm">{analysis.summary}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(analysis.createdAt).toLocaleString()}
        </p>
      </div>

      {criticalIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide">
            Critical ({criticalIssues.length})
          </h4>
          {criticalIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onStatusChange={onStatusChange}
              showResolveInput={showResolveInput}
              setShowResolveInput={setShowResolveInput}
              resolveNote={resolveNote}
              setResolveNote={setResolveNote}
              onNavigateToAlignment={onNavigateToAlignment}
            />
          ))}
        </div>
      )}

      {warningIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
            Warnings ({warningIssues.length})
          </h4>
          {warningIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onStatusChange={onStatusChange}
              showResolveInput={showResolveInput}
              setShowResolveInput={setShowResolveInput}
              resolveNote={resolveNote}
              setResolveNote={setResolveNote}
              onNavigateToAlignment={onNavigateToAlignment}
            />
          ))}
        </div>
      )}

      {infoIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Informational ({infoIssues.length})
          </h4>
          {infoIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onStatusChange={onStatusChange}
              showResolveInput={showResolveInput}
              setShowResolveInput={setShowResolveInput}
              resolveNote={resolveNote}
              setResolveNote={setResolveNote}
              onNavigateToAlignment={onNavigateToAlignment}
            />
          ))}
        </div>
      )}

      {issues.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No new issues were found in this analysis.
        </p>
      )}
    </div>
  );
}

// ─── History Tab ────────────────────────────────────────────────

function HistoryTab({
  analyses,
  expandedAnalysis,
  expandedIssues,
  onExpand,
}: {
  analyses: AiAnalysis[];
  expandedAnalysis: string | null;
  expandedIssues: AiAnalysisIssue[];
  onExpand: (id: string) => void;
}) {
  if (analyses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No analysis history yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {analyses.map((a) => {
        const isExpanded = expandedAnalysis === a.id;
        return (
          <div key={a.id} className="border border-border rounded-lg">
            <button
              onClick={() => onExpand(a.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {new Date(a.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(a.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {a.summary}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs text-muted-foreground">
                  {a.issuesFound} found · {a.issuesResolved} resolved
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
            {isExpanded && (
              <div className="border-t border-border p-3 space-y-2 bg-muted/10">
                {expandedIssues.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No issues in this analysis.</p>
                ) : (
                  expandedIssues.map((issue) => {
                    const colors = getSeverityColors(
                      issue.severity as "critical" | "warning" | "info"
                    );
                    const SeverityIcon =
                      issue.severity === "critical"
                        ? AlertTriangle
                        : issue.severity === "warning"
                        ? AlertCircle
                        : Info;
                    return (
                      <div
                        key={issue.id}
                        className="flex items-start gap-2 text-xs p-2 rounded bg-card"
                      >
                        <SeverityIcon className={`h-3.5 w-3.5 ${colors.text} mt-0.5 shrink-0`} />
                        <div>
                          <span className="font-medium">{issue.title}</span>
                          <span className="text-muted-foreground ml-2">
                            — {issue.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Open Issues Tab ────────────────────────────────────────────

function OpenIssuesTab({
  issues,
  onStatusChange,
  showResolveInput,
  setShowResolveInput,
  resolveNote,
  setResolveNote,
  onNavigateToAlignment,
}: {
  issues: AiAnalysisIssue[];
  onStatusChange: (id: string, status: "in_progress" | "resolved" | "dismissed", note?: string) => void;
  showResolveInput: string | null;
  setShowResolveInput: (id: string | null) => void;
  resolveNote: Record<string, string>;
  setResolveNote: (notes: Record<string, string>) => void;
  onNavigateToAlignment?: (studentId: string) => void;
}) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filtered = issues.filter((i) => {
    if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
    if (severityFilter !== "all" && i.severity !== severityFilter) return false;
    return true;
  });

  const categories = [...new Set(issues.map((i) => i.category))];

  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No open issues. Great work!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs px-2 py-1.5 rounded border border-border bg-background"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-xs px-2 py-1.5 rounded border border-border bg-background"
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Issue list */}
      {filtered.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          onStatusChange={onStatusChange}
          showResolveInput={showResolveInput}
          setShowResolveInput={setShowResolveInput}
          resolveNote={resolveNote}
          setResolveNote={setResolveNote}
        />
      ))}
    </div>
  );
}
