"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, Loader2, X, ChevronDown, ChevronUp, File, AlertTriangle } from "lucide-react";
import { useAgentStore } from "@/lib/stores/agent-store";
import { useState } from "react";
import type { AgentStepStatus } from "@/types";

const stepStatusConfig: Record<
  AgentStepStatus,
  { icon: typeof Check; color: string; bgColor: string }
> = {
  pending: { icon: Circle, color: "text-zinc-500", bgColor: "bg-zinc-500/20" },
  in_progress: { icon: Loader2, color: "text-white", bgColor: "bg-white/20" },
  completed: { icon: Check, color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  failed: { icon: X, color: "text-red-400", bgColor: "bg-red-500/20" },
  skipped: { icon: Circle, color: "text-zinc-600", bgColor: "bg-zinc-600/20" },
};

export function AgentPlanViewer() {
  const { currentPlan, analysis, getProgress } = useAgentStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const progress = getProgress();

  if (!currentPlan && !analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-xl border border-[#1a1a24] bg-[#0f0f15] overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-[#1a1a24]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <File className="size-4 text-white" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-medium text-zinc-200">
              {currentPlan?.summary || analysis?.intent || "Agent Plan"}
            </h4>
            {currentPlan && (
              <p className="text-xs text-zinc-500">
                {progress.current}/{progress.total} steps · {currentPlan.estimatedTime}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentPlan && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#1a1a24]">
              <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[10px] text-zinc-500">{progress.percentage}%</span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="size-4 text-zinc-500" />
          ) : (
            <ChevronDown className="size-4 text-zinc-500" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {analysis && !currentPlan && (
                <div className="p-3 rounded-lg bg-[#1a1a24]/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <AlertTriangle className="size-3" />
                    <span>Analysis Results</span>
                  </div>
                  <p className="text-sm text-zinc-300">{analysis.intent}</p>
                  {analysis.affectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {analysis.affectedFiles.map((file) => (
                        <span
                          key={file}
                          className="px-2 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-400"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentPlan?.steps.map((step, index) => {
                const config = stepStatusConfig[step.status];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        step.status === "in_progress"
                          ? "bg-white/10 border border-white/20"
                          : "bg-[#1a1a24]/50"
                      }`}
                  >
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center ${config.bgColor}`}
                    >
                      <Icon
                        className={`size-3.5 ${config.color} ${
                          step.status === "in_progress" ? "animate-spin" : ""
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-zinc-200">{step.title}</h5>
                        <span className="text-[10px] text-zinc-600">Step {index + 1}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
                      {step.fileChanges && step.fileChanges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {step.fileChanges.map((fc, i) => (
                            <span
                              key={i}
                              className={`px-1.5 py-0.5 text-[10px] rounded ${
                                fc.action === "create"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : fc.action === "delete"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {fc.action}: {fc.filePath}
                            </span>
                          ))}
                        </div>
                      )}
                      {step.error && (
                        <p className="text-xs text-red-400 mt-1">{step.error}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {currentPlan?.risks && currentPlan.risks.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
                    <AlertTriangle className="size-3" />
                    <span>Potential Risks</span>
                  </div>
                  <ul className="space-y-1">
                    {currentPlan.risks.map((risk, i) => (
                      <li key={i} className="text-xs text-zinc-400">
                        • {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
