"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, FileJson, X, Loader2 } from "lucide-react";

interface UploadResult {
  success: boolean;
  uploadId?: string;
  summary?: {
    totalChanges: number;
    byType: { added: number; modified: number; removed: number };
    byEntity: Record<string, number>;
    studentsAffected: number;
    weeksAffected: number[];
    unmatchedStudents: string[];
  };
  error?: string;
  details?: string[];
  warnings?: string[];
}

interface ExcelUploadFormProps {
  onUploadComplete: (result: UploadResult) => void;
}

export function ExcelUploadForm({ onUploadComplete }: ExcelUploadFormProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls" && ext !== ".json") {
      return "Invalid file type. Accepted: .xlsx, .xls, .json";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File too large. Maximum: 10MB";
    }
    return null;
  };

  const handleFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
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

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload-tracker", {
        method: "POST",
        body: formData,
      });

      const result: UploadResult = await response.json();

      if (!response.ok) {
        setError(result.error || "Upload failed");
        return;
      }

      onUploadComplete(result);
      setSelectedFile(null);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const ext = selectedFile?.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
  const FileIcon = ext === ".json" ? FileJson : FileSpreadsheet;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
          }
        `}
      >
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop .xlsx, .xls or .json file here
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          or click to browse
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Accepts: .xlsx / .xls (Excel Tracker), .json (extracted data). Max: 10MB
      </p>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Selected file */}
      {selectedFile && (
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3">
          <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              setError(null);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload & Analyze Changes
            </>
          )}
        </button>
      )}
    </div>
  );
}
