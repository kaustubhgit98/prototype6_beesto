"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Check, AlertCircle, Loader2 } from "lucide-react";
import { useSyncStore } from "@/lib/stores/sync-store";

export function SyncStatusIndicator() {
  const { syncStatus, pendingChanges, conflicts } = useSyncStore();

  const pendingCount = pendingChanges.size;
  const conflictCount = conflicts.length;

  return (
    <AnimatePresence mode="wait">
      {syncStatus === "syncing" && (
        <motion.div
          key="syncing"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-400"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Syncing...</span>
        </motion.div>
      )}

      {syncStatus === "conflict" && conflictCount > 0 && (
        <motion.div
          key="conflict"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-400"
        >
          <AlertCircle className="h-3 w-3" />
          <span>{conflictCount} conflict{conflictCount > 1 ? "s" : ""}</span>
        </motion.div>
      )}

      {syncStatus === "error" && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-400"
        >
          <AlertCircle className="h-3 w-3" />
          <span>Sync Error</span>
        </motion.div>
      )}

      {syncStatus === "idle" && pendingCount > 0 && (
        <motion.div
          key="pending"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1.5 rounded-md bg-zinc-500/10 px-2 py-1 text-xs text-zinc-400"
        >
          <RefreshCw className="h-3 w-3" />
          <span>{pendingCount} pending</span>
        </motion.div>
      )}

      {syncStatus === "idle" && pendingCount === 0 && conflictCount === 0 && (
        <motion.div
          key="synced"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-1 text-xs text-green-400"
        >
          <Check className="h-3 w-3" />
          <span>Synced</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
