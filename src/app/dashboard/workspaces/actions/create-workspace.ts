"use server";

import { revalidatePath } from "next/cache";
import { createServerActionSupabaseClient } from "@/lib/supabase/auth";
import { Database } from "@/types/supabase";

export async function createWorkspace(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();

  if (!name) {
    return { error: "Workspace name is required." };
  }

  const supabase = createServerActionSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Workspace creation auth error:", userError);
    return { error: "Authentication required." };
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from<Database["public"]["Tables"]["workspaces"]>("workspaces")
    .insert({
      name,
      owner_id: user.id,
    })
    .select()
    .single();

  if (workspaceError || !workspace) {
    console.error("Workspace creation error:", workspaceError);
    return { error: "Failed to create workspace." };
  }

  const { error: memberError } = await supabase
    .from<
      Database["public"]["Tables"]["workspace_members"]
    >("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    console.error("Member addition error:", memberError);
    return { error: "Failed to add workspace member." };
  }

  revalidatePath("/dashboard");
  return { workspaceId: workspace.id };
}
