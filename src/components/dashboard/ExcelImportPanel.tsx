"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, X, Loader2, CheckCircle2, AlertCircle, Users, UserPlus, SkipForward } from "lucide-react";

interface SeedStudentResult {
  studentName: string;
  action: "created" | "skipped" | "error";
  userId?: string;
  goalsCreated?: number;
  milestonesWritten?: number;
  error?: string;
}

interface SeedSummary {
  created: number;
  skipped: number;
  errored: number;
  totalMilestones: number;
}

interface SeedResponse {
  success: boolean;
  summary?: SeedSummary;
  results?: SeedStudentResult[];
  error?: string;
}

export function ExcelImportPanel() {
  const [dragOver, setDragOver]         = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [response, setResponse]         = useState<SeedResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls") {
      setError("Only .xlsx or .xls files are accepted");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("File too large (max 15MB)");
      return;
    }
    setError(null);
    setResponse(null);
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleImport = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);

      const res = await fetch("/api/admin/seed-from-excel", { method: "POST", body: fd });
      const data: SeedResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Import failed");
        return;
      }

      setResponse(data);
      setSelectedFile(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">Import from LEAP 99 Excel Tracker</h3>
        <p className="text-xs text-muted-foreground">
          Upload the master .xlsx file — creates any missing student accounts and syncs all milestones automatically.
        </p>
      </div>

      {/* Drop zone */}
      {!response && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
        >
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Drop LEAP 99 .xlsx / .xls file here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Selected file row */}
      {selectedFile && (
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3">
          <FileSpreadsheet className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setError(null); }}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Import button */}
      {selectedFile && (
        <button
          onClick={handleImport}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing all students...</>
          ) : (
            <><Upload className="h-4 w-4" /> Create Students + Import All</>
          )}
        </button>
      )}

      {/* Results */}
      {response?.success && response.summary && (
        <div className="space-y-3">
          {/* Summary bar */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Created", value: response.summary.created, color: "text-green-600", Icon: UserPlus },
              { label: "Already Existed", value: response.summary.skipped, color: "text-muted-foreground", Icon: SkipForward },
              { label: "Errors", value: response.summary.errored, color: "text-destructive", Icon: AlertCircle },
              { label: "Milestones", value: response.summary.totalMilestones, color: "text-primary", Icon: CheckCircle2 },
            ].map((s) => (
              <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Per-student results */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Per-Student Results
              </span>
            </div>
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {response.results?.map((r) => (
                <div key={r.studentName} className="flex items-center gap-3 px-4 py-2.5">
                  {r.action === "created" ? (
                    <UserPlus className="h-4 w-4 text-green-500 shrink-0" />
                  ) : r.action === "skipped" ? (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <span className="text-sm font-medium flex-1">{r.studentName}</span>
                  {r.action === "created" && (
                    <span className="text-xs text-green-600">
                      {r.goalsCreated} goals · {r.milestonesWritten ?? 0} milestones
                    </span>
                  )}
                  {r.action === "skipped" && (
                    <span className="text-xs text-muted-foreground">
                      existing · {r.milestonesWritten ?? 0} milestones updated
                    </span>
                  )}
                  {r.action === "error" && (
                    <span className="text-xs text-destructive">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Import again button */}
          <button
            onClick={() => { setResponse(null); setError(null); }}
            className="w-full text-xs text-muted-foreground hover:text-foreground py-2 transition-colors"
          >
            Import another file
          </button>
        </div>
      )}
    </div>
  );
}
