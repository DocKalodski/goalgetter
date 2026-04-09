"use client";

import { useState, useEffect } from "react";
import { getMyProfile, updateMyProfile, changeMyPassword, updateMyDeclaration } from "@/lib/actions/profile";
import { useNavigation } from "@/components/layout/DashboardShell";
import { User, Pencil, Lock, Save, X, FileText } from "lucide-react";
import { ApprovalBadge } from "./ApprovalBadge";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  councilId: string | null;
  batchId: string | null;
  approvalStatus: string;
  declaration: {
    id: string;
    text: string;
    approvalStatus: string;
  } | null;
}

export function ProfilePanel() {
  const { user } = useNavigation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [declarationMode, setDeclarationMode] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [declarationText, setDeclarationText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadProfile() {
    try {
      const data = await getMyProfile();
      setProfile(data);
      setEditData({ name: data.name || "", email: data.email });
      setDeclarationText(data.declaration?.text || "");
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await updateMyProfile(editData);
      if (result.success) {
        setSuccess("Profile updated");
        setEditMode(false);
        await loadProfile();
      } else {
        setError(result.error || "Failed to update");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await changeMyPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (result.success) {
        setSuccess("Password changed");
        setPasswordMode(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(result.error || "Failed to change password");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDeclaration(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await updateMyDeclaration(declarationText);
      if (result.success) {
        setSuccess("Declaration updated (pending coach approval)");
        setDeclarationMode(false);
        await loadProfile();
      } else {
        setError(result.error || "Failed to update declaration");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update declaration");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-48 bg-muted animate-pulse rounded-xl" />;
  }

  if (!profile) return null;

  const isStudent = user.role === "student" || user.role === "council_leader";
  const roleLabel =
    user.role === "head_coach"
      ? "Head Coach"
      : user.role === "coach"
      ? "Coach"
      : user.role === "council_leader"
      ? "Council Leader"
      : "Student";

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">My Profile</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {roleLabel}
            </span>
          </div>
        </div>
        {!editMode && !passwordMode && (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditMode(true); setError(null); setSuccess(null); }}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-muted border border-border text-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-400/50 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={() => { setPasswordMode(true); setError(null); setSuccess(null); }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Lock className="h-3 w-3" />
              Password
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm bg-green-500/10 text-green-600 rounded-lg">
          {success}
        </div>
      )}

      {/* View Mode */}
      {!editMode && !passwordMode && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Name</p>
              <p className="font-medium">{profile.name || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>

          {/* Declaration section for students */}
          {isStudent && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">My Declaration</span>
                </div>
                {profile.declaration && (
                  <ApprovalBadge
                    status={profile.declaration.approvalStatus}
                    type="declaration"
                    id={profile.declaration.id}
                    canApprove={false}
                  />
                )}
              </div>
              {declarationMode ? (
                <form onSubmit={handleSaveDeclaration} className="space-y-2">
                  <textarea
                    value={declarationText}
                    onChange={(e) => setDeclarationText(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={2}
                    placeholder="Enter your declaration..."
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Save className="h-3 w-3" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeclarationMode(false);
                        setDeclarationText(profile.declaration?.text || "");
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-muted rounded-lg hover:bg-muted/80"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm italic text-muted-foreground">
                    {profile.declaration?.text
                      ? `"${profile.declaration.text}"`
                      : "No declaration set"}
                  </p>
                  <button
                    onClick={() => {
                      setDeclarationMode(true);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    {profile.declaration ? "Edit" : "Set Declaration"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Form */}
      {editMode && (
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, name: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, email: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-3 w-3" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setEditData({ name: profile.name || "", email: profile.email });
              }}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-muted rounded-lg hover:bg-muted/80"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Change Password Form */}
      {passwordMode && (
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((d) => ({
                    ...d,
                    currentPassword: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((d) => ({
                      ...d,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((d) => ({
                      ...d,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={8}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Lock className="h-3 w-3" />
              {saving ? "Changing..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPasswordMode(false);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-muted rounded-lg hover:bg-muted/80"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
