// src/api/chatApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface ChatItem {
  id: number;
  title: string;
  result: string;
  createdAt: string;
}

export interface ChatListResponse {
  message: string;
  data: ChatItem[];
  total: number;
}

export interface ChatPhoto {
  id: number;
  idChat: number;
  fileUri: string;
  mimeType: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface ChatDetailResponse {
  message: string;
  data: {
    id: number;
    idUser: number;
    title: string;
    result: string;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    photos: ChatPhoto[];
  };
}

export interface UploadImageItem {
  url: string;
  gcsUri: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface UploadImageResponse {
  message: string;
  data: UploadImageItem[];
}

export interface CreateChatPayload {
  fileUris: string[];
  mimeType: string;
}

export interface DeleteChatResponse {
  message: string;
}

/* ================= API ================= */

// ✅ upload images (multipart)
export const uploadDentalImagesApi = async (
  files: File[]
): Promise<UploadImageResponse> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return fetchWithAuth<UploadImageResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/upload/dental-images`,
    {
      method: "POST",
      body: formData,
    }
  );
};

// ✅ create chat (IMPORTANT FIX)
export const createChatApi = async (
  payload: CreateChatPayload
): Promise<ChatDetailResponse> => {
  return fetchWithAuth<ChatDetailResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/chat/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify(payload),
    }
  );
};


// ✅ get chat list
export const getChatListApi = async (): Promise<ChatListResponse> => {
  return fetchWithAuth<ChatListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/chat/list`,
    { method: "GET" }
  );
};

// ✅ get chat detail
export const getChatDetailApi = async (
  id: number
): Promise<ChatDetailResponse> => {
  return fetchWithAuth<ChatDetailResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/chat/${id}`,
    { method: "GET" }
  );
};

// ✅ delete chat
export const deleteChatApi = async (
  id: number
): Promise<DeleteChatResponse> => {
  return fetchWithAuth<DeleteChatResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/chat/delete/${id}`,
    {
      method: "DELETE",
    }
  );
};

