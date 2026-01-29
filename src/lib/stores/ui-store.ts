import { create } from "zustand";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  speed: "ultra-fast" | "very-fast" | "fast" | "medium";
  contextWindow: string;
  isCustom?: boolean;
}

export const AI_MODELS: AIModel[] = [
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    speed: "ultra-fast",
    contextWindow: "1M",
  },
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "Meta / Groq",
    speed: "ultra-fast",
    contextWindow: "128k",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    provider: "Meta / Groq",
    speed: "ultra-fast",
    contextWindow: "128k",
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    provider: "Mistral / Groq",
    speed: "very-fast",
    contextWindow: "32k",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek / Groq",
    speed: "fast",
    contextWindow: "64k",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek / SambaNova",
    speed: "fast",
    contextWindow: "64k",
  },
  {
    id: "llama-3.1-405b",
    name: "Llama 3.1 405B",
    provider: "Meta / SambaNova",
    speed: "medium",
    contextWindow: "8k",
  }
];

export const CUSTOM_MODEL: AIModel = {
  id: "custom-model",
  name: "Custom Model",
  provider: "Any OpenAI Compatible",
  speed: "medium",
  contextWindow: "Unknown",
  isCustom: true,
};

interface UIState {
  selectedModel: AIModel;
  aiStatus: "idle" | "thinking" | "streaming";
  setSelectedModel: (model: AIModel) => void;
  setAIStatus: (status: "idle" | "thinking" | "streaming") => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedModel: AI_MODELS[0],
  aiStatus: "idle",
  setSelectedModel: (model) => set({ selectedModel: model }),
  setAIStatus: (status) => set({ aiStatus: status }),
}));
