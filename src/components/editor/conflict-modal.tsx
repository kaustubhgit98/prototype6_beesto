"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Check, FileWarning, ArrowRight } from "lucide-react";
import type { FileConflict, ConflictResolution } from "@/lib/stores/sync-store";

interface ConflictModalProps {
  conflicts: FileConflict[];
  onResolve: (path: string, resolution: ConflictResolution) => Promise<boolean>;
}

export function ConflictModal({ conflicts, onResolve }: ConflictModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [resolving, setResolving] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const currentConflict = conflicts[activeIndex];

  if (!currentConflict) return null;

  const handleResolve = async (resolution: ConflictResolution) => {
    setResolving(true);
    const success = await onResolve(currentConflict.path, resolution);
    setResolving(false);

    if (success && activeIndex < conflicts.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const fileName = currentConflict.path.split("/").pop() || currentConflict.path;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl mx-4 overflow-hidden rounded-xl border border-amber-500/30 bg-[#0d0d14] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold text-amber-100">File Conflict Detected</h2>
                <p className="text-sm text-amber-200/70">
                  {conflicts.length > 1
                    ? `${activeIndex + 1} of ${conflicts.length} conflicts`
                    : "External changes detected"}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleResolve("keep_local")}
              className="rounded-lg p-2 text-amber-200/50 transition-colors hover:bg-amber-500/10 hover:text-amber-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-[#1a1a24] px-4 py-3 border border-[#2a2a3a]">
              <FileWarning className="h-4 w-4 text-amber-400" />
              <span className="font-mono text-sm text-zinc-300">{currentConflict.path}</span>
            </div>

            <p className="text-sm text-zinc-400">
              The file <span className="font-medium text-zinc-200">{fileName}</span> was modified
              externally while you were editing. Choose how to resolve this conflict:
            </p>

            {showDiff ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] overflow-hidden">
                  <div className="border-b border-[#2a2a3a] bg-green-500/10 px-3 py-2">
                    <span className="text-xs font-medium text-green-400">Your Version (Local)</span>
                  </div>
                  <pre className="max-h-32 overflow-auto p-3 text-xs text-zinc-300 font-mono">
                    {currentConflict.localContent.slice(0, 500)}
                    {currentConflict.localContent.length > 500 && "..."}
                  </pre>
                </div>
                <div className="rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] overflow-hidden">
                  <div className="border-b border-[#2a2a3a] bg-blue-500/10 px-3 py-2">
                    <span className="text-xs font-medium text-blue-400">External Version (Remote)</span>
                  </div>
                  <pre className="max-h-32 overflow-auto p-3 text-xs text-zinc-300 font-mono">
                    {currentConflict.remoteContent.slice(0, 500)}
                    {currentConflict.remoteContent.length > 500 && "..."}
                  </pre>
                </div>
                <button
                  onClick={() => setShowDiff(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Hide comparison
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDiff(true)}
                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                View comparison
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex gap-3 border-t border-[#1a1a24] bg-[#08080c] p-4">
            <button
              onClick={() => handleResolve("keep_local")}
              disabled={resolving}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Keep My Version
            </button>
            <button
              onClick={() => handleResolve("use_remote")}
              disabled={resolving}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20 disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4" />
              Use External Version
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
