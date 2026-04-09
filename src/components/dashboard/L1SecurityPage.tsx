"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  UserX,
} from "lucide-react";
import { useNavigation } from "@/components/layout/DashboardShell";

interface LoginAuditRow {
  id: string;
  userId: string | null;
  email: string;
  userName: string | null;
  ipAddress: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  status: string;
  failReason: string | null;
  isSuspicious: number;
  suspicionReason: string | null;
  createdAt: string | null;
}

interface SessionRow {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  ipAddress: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  lastSeenAt: string | null;
  createdAt: string | null;
  expiresAt: string | null;
}

interface InactiveUserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string | null;
  lastLogin: string | null;
}

interface SecurityData {
  stats: {
    loginsToday: number;
    failedToday: number;
    successToday: number;
    activeSessions: number;
    suspiciousCount: number;
    inactiveCount: number;
  };
  recentLogins: LoginAuditRow[];
  currentSessions: SessionRow[];
  suspiciousLogins: LoginAuditRow[];
  inactiveAccounts: InactiveUserRow[];
}

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone className="h-4 w-4" />;
  if (type === "tablet") return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "success")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
        <CheckCircle className="h-3 w-3" /> OK
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
        <XCircle className="h-3 w-3" /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400">
      <XCircle className="h-3 w-3" /> Blocked
    </span>
  );
}

export function L1SecurityPage() {
  const { setL1SubView, setL1ManageOpen } = useNavigation();
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllLogins, setShowAllLogins] = useState(false);
  const [activeTab, setActiveTab] = useState<"logins" | "sessions" | "suspicious" | "inactive">("logins");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/security");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-16">
        Failed to load security data.
      </div>
    );
  }

  const displayedLogins = showAllLogins
    ? data.recentLogins
    : data.recentLogins.slice(0, 30);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setL1SubView("overview"); setL1ManageOpen(true); }} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Shield className="h-6 w-6 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Security Center</h1>
            <p className="text-sm text-muted-foreground">
              Login history · Active sessions · Threat detection
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-muted hover:bg-muted/80 text-muted-foreground"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Logins Today"
          value={data.stats.loginsToday}
          icon={<Eye className="h-5 w-5 text-blue-400" />}
          color="blue"
        />
        <StatCard
          label="Successful"
          value={data.stats.successToday}
          icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
          color="emerald"
        />
        <StatCard
          label="Failed"
          value={data.stats.failedToday}
          icon={<XCircle className="h-5 w-5 text-red-400" />}
          color="red"
        />
        <StatCard
          label="Active Now"
          value={data.stats.activeSessions}
          icon={<Users className="h-5 w-5 text-purple-400" />}
          color="purple"
        />
        <StatCard
          label="Suspicious"
          value={data.stats.suspiciousCount}
          icon={<AlertTriangle className="h-5 w-5 text-orange-400" />}
          color={data.stats.suspiciousCount > 0 ? "orange" : "gray"}
          alert={data.stats.suspiciousCount > 0}
        />
        <StatCard
          label="Inactive 7d+"
          value={data.stats.inactiveCount}
          icon={<UserX className="h-5 w-5 text-slate-400" />}
          color={data.stats.inactiveCount > 0 ? "slate" : "gray"}
          alert={false}
        />
      </div>

      {/* Suspicious Alert Banner */}
      {data.stats.suspiciousCount > 0 && (
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-300">
              {data.stats.suspiciousCount} suspicious login{data.stats.suspiciousCount > 1 ? "s" : ""} detected
            </p>
            <p className="text-xs text-orange-400 mt-1">
              Same account accessed from multiple IP addresses — possible credential sharing. Check the Suspicious tab.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border flex-wrap">
        {(["logins", "sessions", "suspicious", "inactive"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "logins" && `Login History (${data.recentLogins.length})`}
            {tab === "sessions" && `Active Sessions (${data.currentSessions.length})`}
            {tab === "suspicious" && (
              <span className="flex items-center gap-1">
                {data.suspiciousLogins.length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-orange-400 inline-block" />
                )}
                Suspicious ({data.suspiciousLogins.length})
              </span>
            )}
            {tab === "inactive" && (
              <span className="flex items-center gap-1">
                {data.inactiveAccounts.length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" />
                )}
                Inactive ({data.inactiveAccounts.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Login History Tab ── */}
      {activeTab === "logins" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Last 7 days · {data.recentLogins.length} records</p>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">IP Address</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Device</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedLogins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                      No login records yet
                    </td>
                  </tr>
                )}
                {displayedLogins.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      row.isSuspicious ? "bg-orange-500/5 border-l-2 border-l-orange-400" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.isSuspicious === 1 && (
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-foreground text-xs">
                            {row.userName || "—"}
                          </p>
                          <p className="text-muted-foreground text-xs">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell font-mono">
                      {row.ipAddress || "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <DeviceIcon type={row.deviceType} />
                        <span>{row.browser || "?"} · {row.os || "?"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <StatusBadge status={row.status} />
                        {row.failReason && (
                          <p className="text-xs text-muted-foreground mt-0.5">{row.failReason}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtTime(row.createdAt as string | null)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.recentLogins.length > 30 && (
            <button
              type="button"
              onClick={() => setShowAllLogins(!showAllLogins)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto"
            >
              {showAllLogins ? (
                <><ChevronUp className="h-3 w-3" /> Show less</>
              ) : (
                <><ChevronDown className="h-3 w-3" /> Show all {data.recentLogins.length} records</>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── Active Sessions Tab ── */}
      {activeTab === "sessions" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {data.currentSessions.length} active session{data.currentSessions.length !== 1 ? "s" : ""} right now
          </p>
          {data.currentSessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No active sessions
            </div>
          ) : (
            <div className="grid gap-3">
              {data.currentSessions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-border bg-card p-4 flex items-center gap-4"
                >
                  <div className="flex-shrink-0 text-muted-foreground">
                    <DeviceIcon type={s.deviceType} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">{s.userName || "Unknown"}</p>
                      <span className="text-xs text-muted-foreground">{s.userEmail}</span>
                      <RolePill role={s.userRole} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                      <span className="font-mono">{s.ipAddress || "—"}</span>
                      <span>{s.browser || "?"} · {s.os || "?"}</span>
                      <span>Last active: {timeAgo(s.lastSeenAt as string | null)}</span>
                      <span>Logged in: {fmtTime(s.createdAt as string | null)}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Inactive Tab ── */}
      {activeTab === "inactive" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Coaches and students with no login in the past 7 days (or never logged in)
          </p>
          {data.inactiveAccounts.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All accounts are active — everyone logged in within 7 days</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3">User</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Last Login</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Account Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.inactiveAccounts.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground text-xs">{u.name || "—"}</p>
                        <p className="text-muted-foreground text-xs">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <RolePill role={u.role} />
                      </td>
                      <td className="px-4 py-3">
                        {u.lastLogin ? (
                          <span className="text-xs text-amber-500 font-medium">{timeAgo(u.lastLogin)}</span>
                        ) : (
                          <span className="text-xs text-red-400 font-medium">Never logged in</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                        {fmtTime(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Suspicious Tab ── */}
      {activeTab === "suspicious" && (
        <div className="space-y-3">
          {data.suspiciousLogins.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No suspicious activity detected</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Accounts that logged in from multiple different IP addresses — possible credential sharing
              </p>
              <div className="space-y-3">
                {data.suspiciousLogins.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground">
                            {row.userName || row.email}
                          </p>
                          <span className="text-xs text-muted-foreground">{row.email}</span>
                        </div>
                        <p className="text-xs text-orange-300 mt-1">{row.suspicionReason}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="font-mono">New IP: {row.ipAddress}</span>
                          <span>{row.browser} · {row.os}</span>
                          <span>{fmtTime(row.createdAt as string | null)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  alert = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 bg-card ${
        alert ? "border-orange-500/40 bg-orange-500/5" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        {alert && <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />}
      </div>
      <p className={`text-2xl font-bold text-foreground`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function RolePill({ role }: { role: string | null }) {
  const map: Record<string, string> = {
    head_coach: "bg-purple-500/10 text-purple-400",
    coach: "bg-blue-500/10 text-blue-400",
    council_leader: "bg-amber-500/10 text-amber-400",
    student: "bg-muted text-muted-foreground",
  };
  const label: Record<string, string> = {
    head_coach: "HC",
    coach: "Coach",
    council_leader: "CL",
    student: "Student",
  };
  if (!role) return null;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[role] || "bg-muted text-muted-foreground"}`}>
      {label[role] || role}
    </span>
  );
}
