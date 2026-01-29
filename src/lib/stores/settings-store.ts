import { create } from "zustand";

interface SettingsState {
  customApiKey: string | null;
  fontSize: number;
  lineNumbers: boolean;
  minimap: boolean;
  wordWrap: boolean;
  geminiApiKey: string;
  groqApiKey: string;
  setCustomApiKey: (key: string | null) => void;
  setFontSize: (size: number) => void;
  setLineNumbers: (enabled: boolean) => void;
  setMinimap: (enabled: boolean) => void;
  setWordWrap: (enabled: boolean) => void;
  setGeminiApiKey: (key: string) => void;
  setGroqApiKey: (key: string) => void;
  hasAnyApiKey: () => boolean;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  customApiKey: null,
  fontSize: 14,
  lineNumbers: true,
  minimap: true,
  wordWrap: false,
  geminiApiKey: "",
  groqApiKey: "",
  setCustomApiKey: (key) => set({ customApiKey: key }),
  setFontSize: (size) => set({ fontSize: size }),
  setLineNumbers: (enabled) => set({ lineNumbers: enabled }),
  setMinimap: (enabled) => set({ minimap: enabled }),
  setWordWrap: (enabled) => set({ wordWrap: enabled }),
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  setGroqApiKey: (key) => set({ groqApiKey: key }),
  hasAnyApiKey: () => {
    const state = get();
    return state.geminiApiKey.trim() !== "" || state.groqApiKey.trim() !== "";
  },
}));
