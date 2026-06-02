"use client";

import { signOut } from "@/app/auth/actions/sign-out";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { ChevronDown, LogOut, Menu, FileText } from "lucide-react";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "./sidebar-context";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  const {
    isGlobalOpen,
    toggleGlobal,
    isWorkspaceOpen,
    toggleWorkspace,
    hasWorkspaceSidebar,
    closeAll,
  } = useSidebar();

  useEffect(() => {
    async function getUserEmail() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    }

    async function loadWorkspaces() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/");
        return;
      }

      const { data: workspaceData, error } = await supabase
        .from("workspaces")
        .select(`*, workspace_members!inner(user_id)`)
        .eq("workspace_members.user_id", session.user.id);

      if (error) {
        console.error("Workspaces fetch error:", error);
      } else {
        setWorkspaces(workspaceData || []);
      }
    }

    getUserEmail();
    loadWorkspaces();
  }, [supabase, router, pathname]);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Mobile Top Navbar Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b flex items-center justify-between px-4 z-30 md:hidden animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleGlobal}
            type="button"
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Nexus
          </span>
        </div>

        {hasWorkspaceSidebar && (
          <button
            onClick={toggleWorkspace}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 mr-9 rounded-lg border bg-muted text-xs font-medium hover:bg-accent transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Pages</span>
          </button>
        )}
      </header>

      {/* Global Sidebar Backdrop for Mobile */}
      {isGlobalOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={closeAll}
        />
      )}

      {/* Global Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r bg-card flex flex-col transition-transform duration-300 md:static md:translate-x-0
          ${isGlobalOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Nexus</h1>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <div className="rounded-2xl border bg-muted p-4 space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Select a workspace to get started
              </div>
            </div>

            {workspaces.length > 0 ? (
              <div className="space-y-2">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    type="button"
                    onClick={() => {
                      router.push(`/dashboard/${workspace.id}`);
                      closeAll();
                    }}
                    className="w-full text-left rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    {workspace.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No workspaces yet. Create one below.
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <CreateWorkspaceDialog />
            </div>
          </div>
        </nav>
        <div className="p-4 border-t">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="truncate">{email || "Loading..."}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border rounded-md shadow-lg z-55">
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0 h-full">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
