"use client";

import { create } from "zustand";

interface UiState {
  isSidebarOpen: boolean;
  activeDocumentId: string | null;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveDocumentId: (documentId: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  activeDocumentId: null,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setActiveDocumentId: (documentId) => set({ activeDocumentId: documentId }),
}));
