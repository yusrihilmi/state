// src/stores/useChatStore.ts
import { create } from "zustand";
import {
  getChatListApi,
  getChatDetailApi,
  uploadDentalImagesApi,
  createChatApi,
  deleteChatApi 
} from "../api/chatApi";
import type { ChatItem, ChatDetailResponse } from "../api/chatApi";
import { toast } from "react-toastify";

interface PendingChat {
  fileUris: string[];
  mimeType: string;
}

interface ChatState {
  chats: ChatItem[];
  loading: boolean;
  error: string | null;

  selectedChat?: ChatDetailResponse["data"];

  // 🆕 NEW
  pendingImages: string[];      // untuk tampil di kanan atas
  isAnalyzing: boolean;         // loading bubble
  pendingPayload?: PendingChat; // untuk retry

  deleteChat: (id: number) => Promise<void>;

  fetchChats: () => Promise<void>;
  fetchChatDetail: (id: number) => Promise<void>;

  createChatWithImages: (files: File[]) => Promise<void>;
  retryCreateChat: () => Promise<void>; // 🆕 retry

  clearChats: () => void;
  resetCurrentChat: () => void;
}


export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  loading: false,
  error: null,
  selectedChat: undefined,

  // 🆕
  pendingImages: [],
  isAnalyzing: false,
  pendingPayload: undefined,

  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getChatListApi();
      set({ chats: res.data });
    } finally {
      set({ loading: false });
    }
  },

  /* ================== MAIN FLOW ================== */
  createChatWithImages: async (files: File[]) => {
    set({ loading: true, error: null, isAnalyzing: true });

    try {
      // 1️⃣ Upload images
      const uploadRes = await uploadDentalImagesApi(files);
      const fileUris = uploadRes.data.map((i) => i.gcsUri);
      const mimeType = uploadRes.data[0]?.mimeType || "image/jpeg";

      // 2️⃣ Simpan image langsung (optimistic)
      set({
        pendingImages: fileUris,
        pendingPayload: {
          fileUris,
          mimeType,
        },
      });

      // 3️⃣ Create chat
      const chatRes = await createChatApi(get().pendingPayload!);

      set({
        selectedChat: chatRes.data,
        isAnalyzing: false,
        pendingPayload: undefined,
      });

      await get().fetchChats();

      toast.success("Photo analysis created successfully");
    } catch (err: any) {
      set({
        error: err.message,
        isAnalyzing: false,
      });

      toast.error(err.message || "Image to large");
    } finally {
      set({ loading: false });
    }
  },

  /* ================== RETRY ================== */
  retryCreateChat: async () => {
    const payload = get().pendingPayload;
    if (!payload) return;

    set({ isAnalyzing: true, error: null });

    try {
      const chatRes = await createChatApi(payload);
      set({
        selectedChat: chatRes.data,
        isAnalyzing: false,
        pendingPayload: undefined,
      });

      
      await get().fetchChats();

      toast.success("Retry success");
    } catch (err: any) {
      set({ error: err.message, isAnalyzing: false });
      toast.error(err.message);
    }
  },

  fetchChatDetail: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const res = await getChatDetailApi(id);
      set({ selectedChat: res.data });
    } finally {
      set({ loading: false });
    }
  },

  deleteChat: async (id: number) => {
    try {
      await deleteChatApi(id);

      // langsung hapus dari state (tanpa fetch ulang)
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== id),
      }));

      toast.success("Chat deleted successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to delete chat";
      toast.error(message);
    }
  },


  clearChats: () =>
    set({
      chats: [],
      selectedChat: undefined,
      pendingImages: [],
      pendingPayload: undefined,
      isAnalyzing: false,
    }),

    resetCurrentChat: () =>
  set({
    selectedChat: undefined,
    pendingImages: [],
    pendingPayload: undefined,
    isAnalyzing: false,
  }),
}));

