import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select(
      `
      *,
      workspace_members!inner(
        role
      )
    `,
    )
    .eq("workspace_members.user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Workspaces fetch error:", error);
  }

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Workspaces</h1>
          <p className="text-muted-foreground mt-2">
            Manage and access your Nexus workspaces.
          </p>
        </div>
        <CreateWorkspaceDialog />
      </div>

      {workspaces && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace: any) => (
            <Card
              key={workspace.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle>{workspace.name}</CardTitle>
                <CardDescription>
                  Created {new Date(workspace.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {workspace.workspace_members?.[0]?.role === "owner"
                    ? "Workspace owner"
                    : "Workspace member"}
                </p>
                <Link href={`/dashboard/${workspace.id}`} className="block">
                  <Button variant="outline" className="w-full">
                    Open Workspace
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>No workspaces yet</CardTitle>
            <CardDescription>
              Create your first workspace to start collaborating.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWorkspaceDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
