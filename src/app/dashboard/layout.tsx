"use client";

import { signOut } from "@/app/auth/actions/sign-out";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
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
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Nexus</h1>
        </div>
        <nav className="p-4 flex-1">
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
                    onClick={() => router.push(`/dashboard/${workspace.id}`)}
                    className="w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent"
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
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border rounded-md shadow-lg">
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
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
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
