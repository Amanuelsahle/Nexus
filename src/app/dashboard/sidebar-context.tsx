"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SidebarContextType {
  isGlobalOpen: boolean;
  setGlobalOpen: (open: boolean) => void;
  isWorkspaceOpen: boolean;
  setWorkspaceOpen: (open: boolean) => void;
  hasWorkspaceSidebar: boolean;
  setHasWorkspaceSidebar: (has: boolean) => void;
  toggleGlobal: () => void;
  toggleWorkspace: () => void;
  closeAll: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isGlobalOpen, setGlobalOpen] = useState(false);
  const [isWorkspaceOpen, setWorkspaceOpen] = useState(false);
  const [hasWorkspaceSidebar, setHasWorkspaceSidebar] = useState(false);
  const pathname = usePathname();

  // Close drawers when navigating
  useEffect(() => {
    setGlobalOpen(false);
    setWorkspaceOpen(false);
  }, [pathname]);

  const toggleGlobal = () => {
    setGlobalOpen((prev) => !prev);
    setWorkspaceOpen(false);
  };

  const toggleWorkspace = () => {
    setWorkspaceOpen((prev) => !prev);
    setGlobalOpen(false);
  };

  const closeAll = () => {
    setGlobalOpen(false);
    setWorkspaceOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isGlobalOpen,
        setGlobalOpen,
        isWorkspaceOpen,
        setWorkspaceOpen,
        hasWorkspaceSidebar,
        setHasWorkspaceSidebar,
        toggleGlobal,
        toggleWorkspace,
        closeAll,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
