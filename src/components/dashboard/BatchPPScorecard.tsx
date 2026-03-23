"use client";

import { useState } from "react";
import { X, Save, Users, Star } from "lucide-react";

interface StudentRow {
  id: string;
  name: string | null;
  email: string;
}

interface PPRow {
  passVotes: string;
  leaderVotes: string;
  scoreNum: string;
  scoreDen: string;
  singOrSit: "enrolled" | "did_not_enroll" | "";
  notes: string;
}

interface BatchPPScorecardProps {
  students: StudentRow[];
  councilId: string;
  currentWeek: number;
  onClose: () => void;
}

export function BatchPPScorecard({ students, councilId, currentWeek, onClose }: BatchPPScorecardProps) {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [moduleTopic, setModuleTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [rows, setRows] = useState<Record<string, PPRow>>(() =>
    Object.fromEntries(
      students.map((s) => [
        s.id,
        { passVotes: "", leaderVotes: "", scoreNum: "", scoreDen: "", singOrSit: "", notes: "" },
      ])
    )
  );

  function updateRow(studentId: string, field: keyof PPRow, value: string) {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  }

  async function handleSave() {
    if (!eventName.trim()) return;
    setSaving(true);
    try {
      // Create individual PP entries per student via Journey Journal API
      const requests = students.map((s) => {
        const row = rows[s.id];
        const votesJson = JSON.stringify({
          pass: row.passVotes ? parseInt(row.passVotes) : null,
          leader: row.leaderVotes ? parseInt(row.leaderVotes) : null,
        });
        const choicesJson = JSON.stringify({
          sing_or_sit: row.singOrSit || null,
        });
        return fetch("/api/journey/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: s.id,
            entryType: "pp",
            entryDate: eventDate,
            weekNumber: currentWeek,
            eventName: eventName.trim(),
            moduleTopic: moduleTopic.trim() || null,
            ppNotes: row.notes.trim() || null,
            ppScoreNum: row.scoreNum ? parseInt(row.scoreNum) : null,
            ppScoreDen: row.scoreDen ? parseInt(row.scoreDen) : null,
            votesJson,
            choicesJson,
            coachObservations: null,
            approvalStatus: "approved",
            approvedFields: ["eventName", "entryDate", "ppNotes", "votesJson", "choicesJson", "ppScoreNum"],
          }),
        });
      });
      await Promise.all(requests);
      setSaved(true);
      setTimeout(onClose, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold">Batch PP Scorecard</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Live scoring mode</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Event info */}
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Event / Session Name *</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. LEAP 99 Intensive Day 3"
                className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Module Topic</label>
              <input
                type="text"
                value={moduleTopic}
                onChange={(e) => setModuleTopic(e.target.value)}
                placeholder="e.g. Enrollment Breakthrough"
                className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Score grid */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wide min-w-[160px]">
                  <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Student</div>
                </th>
                <th className="px-3 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wide text-center w-24">
                  Pass Votes
                </th>
                <th className="px-3 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wide text-center w-24">
                  Leader Votes
                </th>
                <th className="px-3 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wide text-center w-28">
                  Sing or Sit
                </th>
                <th className="px-3 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wide text-center w-28">
                  Score
                </th>
                <th className="px-3 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wide text-left min-w-[200px]">
                  Coach Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => {
                const row = rows[student.id];
                const passNum = row.passVotes ? parseInt(row.passVotes) : null;
                const passDen = row.scoreDen ? parseInt(row.scoreDen) : null;
                const noPass = passNum !== null && passDen !== null && passNum < Math.ceil(passDen / 2);
                return (
                  <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2">
                      <p className="text-sm font-medium">{student.name || student.email}</p>
                      {noPass && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-semibold">No Pass</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={row.passVotes}
                        onChange={(e) => updateRow(student.id, "passVotes", e.target.value)}
                        placeholder="—"
                        className="w-16 text-sm text-center border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={row.leaderVotes}
                        onChange={(e) => updateRow(student.id, "leaderVotes", e.target.value)}
                        placeholder="—"
                        className="w-16 text-sm text-center border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <select
                        value={row.singOrSit}
                        onChange={(e) => updateRow(student.id, "singOrSit", e.target.value)}
                        className="w-full text-xs border border-border rounded px-1.5 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">—</option>
                        <option value="enrolled">Enrolled ✓</option>
                        <option value="did_not_enroll">Did Not Enroll</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <input
                          type="number"
                          min="0"
                          value={row.scoreNum}
                          onChange={(e) => updateRow(student.id, "scoreNum", e.target.value)}
                          placeholder="0"
                          className="w-12 text-sm text-center border border-border rounded px-1.5 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-muted-foreground text-xs">/</span>
                        <input
                          type="number"
                          min="0"
                          value={row.scoreDen}
                          onChange={(e) => updateRow(student.id, "scoreDen", e.target.value)}
                          placeholder="100"
                          className="w-12 text-sm text-center border border-border rounded px-1.5 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => updateRow(student.id, "notes", e.target.value)}
                        placeholder="Coach observations…"
                        className="w-full text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {students.length} students · saves individual PP entries in each student&apos;s Journey Journal
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-muted text-muted-foreground hover:bg-muted/70 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !eventName.trim() || saved}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              {saved ? "✓ Saved!" : saving ? "Saving…" : `Save PP Entries (${students.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
