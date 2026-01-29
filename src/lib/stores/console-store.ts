import { create } from "zustand";

export type ConsoleLogType = "log" | "info" | "warn" | "error";
export type ConsoleFilter = "all" | "errors" | "warnings";

export interface ConsoleLogEntry {
  id: string;
  type: ConsoleLogType;
  message: string;
  timestamp: number;
}

interface ConsoleStore {
  logs: ConsoleLogEntry[];
  filter: ConsoleFilter;
  addLog: (type: ConsoleLogType, message: string) => void;
  clearLogs: () => void;
  setFilter: (filter: ConsoleFilter) => void;
  getFilteredLogs: () => ConsoleLogEntry[];
}

export const useConsoleStore = create<ConsoleStore>((set, get) => ({
  logs: [],
  filter: "all",

  addLog: (type: ConsoleLogType, message: string) => {
    set((state) => ({
      logs: [
        ...state.logs,
        {
          id: `${Date.now()}-${Math.random()}`,
          type,
          message,
          timestamp: Date.now(),
        },
      ],
    }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  setFilter: (filter: ConsoleFilter) => {
    set({ filter });
  },

  getFilteredLogs: () => {
    const state = get();
    const filter = state.filter;

    if (filter === "all") {
      return state.logs;
    } else if (filter === "errors") {
      return state.logs.filter((log) => log.type === "error");
    } else if (filter === "warnings") {
      return state.logs.filter((log) => log.type === "warn");
    }

    return state.logs;
  },
}));
