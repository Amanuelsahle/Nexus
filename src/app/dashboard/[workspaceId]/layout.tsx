import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/workspace/sidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceId: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verify user has access to workspace
  const { data: member } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", params.workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/dashboard");
  }

  // Fetch workspace details
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", params.workspaceId)
    .single();

  if (!workspace) {
    redirect("/dashboard");
  }

  // Fetch documents for sidebar
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("workspace_id", params.workspaceId)
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  return (
    <div className="flex h-full bg-background">
      <Sidebar
        workspace={workspace}
        documents={documents || []}
        workspaceId={params.workspaceId}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
