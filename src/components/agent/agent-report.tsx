"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, FileCode, Plus, Minus, Trash2, Lightbulb, ChevronRight } from "lucide-react";
import { useAgentStore } from "@/lib/stores/agent-store";

export function AgentReport() {
  const { report, state } = useAgentStore();

  if (!report || state !== "COMPLETED") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            {report.success ? (
              <CheckCircle className="size-5 text-emerald-400" />
            ) : (
              <XCircle className="size-5 text-red-400" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-200">
              {report.success ? "Changes Applied Successfully" : "Completed with Issues"}
            </h4>
            <p className="text-xs text-zinc-500">{report.summary}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-[#1a1a24]/50">
            <div className="flex items-center gap-2 mb-1">
              <FileCode className="size-3.5 text-blue-400" />
              <span className="text-[10px] text-zinc-500 uppercase">Modified</span>
            </div>
            <p className="text-lg font-semibold text-zinc-200">
              {report.filesModified.length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1a24]/50">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="size-3.5 text-emerald-400" />
              <span className="text-[10px] text-zinc-500 uppercase">Added</span>
            </div>
            <p className="text-lg font-semibold text-zinc-200">
              +{report.linesAdded}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1a24]/50">
            <div className="flex items-center gap-2 mb-1">
              <Minus className="size-3.5 text-red-400" />
              <span className="text-[10px] text-zinc-500 uppercase">Removed</span>
            </div>
            <p className="text-lg font-semibold text-zinc-200">
              -{report.linesRemoved}
            </p>
          </div>
        </div>

        {(report.filesCreated.length > 0 || report.filesModified.length > 0 || report.filesDeleted.length > 0) && (
          <div className="space-y-2 mb-4">
            {report.filesCreated.map((file) => (
              <div
                key={file}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10"
              >
                <Plus className="size-3.5 text-emerald-400" />
                <span className="text-xs text-zinc-300">{file}</span>
                <span className="text-[10px] text-emerald-400 ml-auto">created</span>
              </div>
            ))}
            {report.filesModified.map((file) => (
              <div
                key={file}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10"
              >
                <FileCode className="size-3.5 text-blue-400" />
                <span className="text-xs text-zinc-300">{file}</span>
                <span className="text-[10px] text-blue-400 ml-auto">modified</span>
              </div>
            ))}
            {report.filesDeleted.map((file) => (
              <div
                key={file}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10"
              >
                <Trash2 className="size-3.5 text-red-400" />
                <span className="text-xs text-zinc-300">{file}</span>
                <span className="text-[10px] text-red-400 ml-auto">deleted</span>
              </div>
            ))}
          </div>
        )}

        {report.suggestions.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
              <Lightbulb className="size-3.5" />
              <span>Suggested Next Steps</span>
            </div>
            <ul className="space-y-1.5">
              {report.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                  <ChevronRight className="size-3 mt-0.5 text-amber-400/50" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
