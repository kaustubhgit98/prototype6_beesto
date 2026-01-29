import { create } from "zustand";

export type SyncStatus = "idle" | "syncing" | "conflict" | "error";

export interface SyncConflict {
  filePath: string;
  localContent: string;
  remoteContent: string;
  timestamp: number;
}

interface SyncStore {
  syncStatus: SyncStatus;
  pendingChanges: Set<string>;
  conflicts: SyncConflict[];
  setSyncStatus: (status: SyncStatus) => void;
  addPendingChange: (filePath: string) => void;
  removePendingChange: (filePath: string) => void;
  clearPendingChanges: () => void;
  addConflict: (conflict: SyncConflict) => void;
  removeConflict: (filePath: string) => void;
  clearConflicts: () => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  syncStatus: "idle",
  pendingChanges: new Set(),
  conflicts: [],

  setSyncStatus: (status: SyncStatus) => {
    set({ syncStatus: status });
  },

  addPendingChange: (filePath: string) => {
    set((state) => ({
      pendingChanges: new Set(state.pendingChanges).add(filePath),
    }));
  },

  removePendingChange: (filePath: string) => {
    set((state) => {
      const updated = new Set(state.pendingChanges);
      updated.delete(filePath);
      return { pendingChanges: updated };
    });
  },

  clearPendingChanges: () => {
    set({ pendingChanges: new Set() });
  },

  addConflict: (conflict: SyncConflict) => {
    set((state) => ({
      conflicts: [...state.conflicts, conflict],
    }));
  },

  removeConflict: (filePath: string) => {
    set((state) => ({
      conflicts: state.conflicts.filter((c) => c.filePath !== filePath),
    }));
  },

  clearConflicts: () => {
    set({ conflicts: [] });
  },
}));
