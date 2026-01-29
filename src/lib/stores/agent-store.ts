import { create } from "zustand";
import { AgentState, AgentStep } from "@/types";

interface AgentStateStore {
  state: AgentState;
  isProcessing: boolean;
  plan: AgentStep[];
  currentStepId: string | null;
  logs: string[];
  report: string | null;
  setState: (state: AgentState) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setPlan: (plan: AgentStep[]) => void;
  setCurrentStepId: (id: string | null) => void;
  addLog: (log: string) => void;
  setReport: (report: string | null) => void;
  reset: () => void;
}

export const useAgentStore = create<AgentStateStore>((set) => ({
  state: "IDLE",
  isProcessing: false,
  plan: [],
  currentStepId: null,
  logs: [],
  report: null,
  setState: (state) => set({ state }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setPlan: (plan) => set({ plan }),
  setCurrentStepId: (id) => set({ currentStepId: id }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setReport: (report) => set({ report }),
  reset: () =>
    set({
      state: "IDLE",
      isProcessing: false,
      plan: [],
      currentStepId: null,
      logs: [],
      report: null,
    }),
}));
