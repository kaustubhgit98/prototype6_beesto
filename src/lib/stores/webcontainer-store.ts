import { create } from "zustand";
import type { ContainerStatus } from "@/lib/webcontainer";

interface WebContainerState {
  status: ContainerStatus;
  previewUrl: string | null;
  error: string | null;
  output: string[];
  isInstalling: boolean;
  isServerRunning: boolean;
  setStatus: (status: ContainerStatus) => void;
  setPreviewUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  appendOutput: (output: string) => void;
  clearOutput: () => void;
  setInstalling: (installing: boolean) => void;
  setServerRunning: (running: boolean) => void;
}

export const useWebContainerStore = create<WebContainerState>((set) => ({
  status: "idle",
  previewUrl: null,
  error: null,
  output: [],
  isInstalling: false,
  isServerRunning: false,
  setStatus: (status) => set({ status }),
  setPreviewUrl: (previewUrl) => set({ previewUrl }),
  setError: (error) => set({ error }),
  appendOutput: (output) =>
    set((state) => ({
      output: [...state.output, output],
    })),
  clearOutput: () => set({ output: [] }),
  setInstalling: (isInstalling) => set({ isInstalling }),
  setServerRunning: (isServerRunning) => set({ isServerRunning }),
}));
