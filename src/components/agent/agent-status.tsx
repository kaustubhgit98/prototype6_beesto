"use client";

import { motion } from "framer-motion";
import {
  Search,
  FileText,
  PlayCircle,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
  Circle,
} from "lucide-react";
import { useAgentStore } from "@/lib/stores/agent-store";
import type { AgentState } from "@/types";

const stateConfig: Record<
  AgentState,
  { icon: typeof Search; label: string; color: string; bgColor: string }
> = {
  IDLE: {
    icon: Circle,
    label: "Idle",
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
  },
  ANALYZING: {
    icon: Search,
    label: "Analyzing",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  PLANNING: {
    icon: FileText,
    label: "Planning",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  EXECUTING: {
    icon: PlayCircle,
    label: "Executing",
    color: "text-white",
    bgColor: "bg-white/10",
  },
  TESTING: {
    icon: TestTube,
    label: "Testing",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  COMPLETED: {
    icon: CheckCircle,
    label: "Completed",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  FAILED: {
    icon: XCircle,
    label: "Failed",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
};

export function AgentStatus() {
  const { state, isProcessing } = useAgentStore();
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}
    >
      {isProcessing ? (
        <Loader2 className={`size-4 animate-spin ${config.color}`} />
      ) : (
        <Icon className={`size-4 ${config.color}`} />
      )}
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </motion.div>
  );
}
