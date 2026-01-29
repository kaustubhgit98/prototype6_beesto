"use client";

import { DiffEditor } from "@monaco-editor/react";
import { Check, X, FileCode } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";

export function DiffViewer() {
  const { diffViewer, applyDiff, rejectDiff } = useEditorStore();

  if (!diffViewer.isOpen) return null;

  const fileName = diffViewer.filePath.split("/").pop() ?? "file";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex h-[85vh] w-[90vw] max-w-6xl flex-col rounded-xl border border-[#1a1a24] bg-[#0a0a0f] shadow-2xl">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#1a1a24] px-4">
            <div className="flex items-center gap-3">
              <FileCode className="h-5 w-5 text-white" />
            <span className="font-medium text-zinc-200">Review Changes</span>
            <span className="text-sm text-zinc-500">{fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={rejectDiff}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
            <button
              onClick={applyDiff}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
            >
              <Check className="h-4 w-4" />
              Accept Changes
            </button>
          </div>
        </div>

        <div className="flex shrink-0 border-b border-[#1a1a24]">
          <div className="flex-1 border-r border-[#1a1a24] px-4 py-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Original
            </span>
          </div>
          <div className="flex-1 px-4 py-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Modified
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <DiffEditor
            height="100%"
            language={diffViewer.language}
            original={diffViewer.original}
            modified={diffViewer.modified}
            theme="vs-dark"
            options={{
              readOnly: true,
              renderSideBySide: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Geist Mono', 'Fira Code', monospace",
              lineHeight: 22,
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              renderOverviewRuler: false,
              diffWordWrap: "on",
            }}
          />
        </div>
      </div>
    </div>
  );
}
