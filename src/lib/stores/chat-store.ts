import { create } from "zustand";

// Chat store for managing messages and streaming state
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  chatMode: "chat" | "agent";
  pendingMessage: string | null;
  pendingModel: string | null;
  addMessage: (message: Omit<ChatMessage, "id">) => void;
  appendToLastMessage: (content: string) => void;
  setLastMessageStreaming: (isStreaming: boolean) => void;
  clearMessages: () => void;
  exportConversation: () => string;
  getRecentMessages: (count: number) => ChatMessage[];
  setPendingMessage: (content: string, modelId?: string) => void;
  clearPendingMessage: () => void;
  setChatMode: (mode: "chat" | "agent") => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  chatMode: "chat",
  pendingMessage: null,
  pendingModel: null,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: Math.random().toString(36).substring(7) },
      ],
    })),
  appendToLastMessage: (content) =>
    set((state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (!lastMessage || lastMessage.role !== "assistant") return state;

      const newMessages = [...state.messages];
      newMessages[newMessages.length - 1] = {
        ...lastMessage,
        content: lastMessage.content + content,
      };

      return { messages: newMessages };
    }),
  setLastMessageStreaming: (isStreaming) =>
    set((state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (!lastMessage || lastMessage.role !== "assistant") return state;

      const newMessages = [...state.messages];
      newMessages[newMessages.length - 1] = {
        ...lastMessage,
        isStreaming,
      };

      return { messages: newMessages, isStreaming };
    }),
  clearMessages: () => set({ messages: [], isStreaming: false }),
  exportConversation: () => JSON.stringify(get().messages, null, 2),
  getRecentMessages: (count) => get().messages.slice(-count),
  setPendingMessage: (content, modelId) =>
    set({ pendingMessage: content, pendingModel: modelId || null }),
  clearPendingMessage: () => set({ pendingMessage: null, pendingModel: null }),
  setChatMode: (mode) => set({ chatMode: mode }),
}));
