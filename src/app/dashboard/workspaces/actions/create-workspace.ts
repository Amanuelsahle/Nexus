"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

export async function createWorkspace(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();

  if (!name) {
    return { error: "Workspace name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Workspace creation auth error:", userError);
    return { error: "Authentication required." };
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    // @ts-ignore
    .insert({ name, owner_id: user.id } as any)
    .select()
    .single();

  if (workspaceError || !workspace) {
    console.error("Workspace creation error:", workspaceError);
    return { error: "Failed to create workspace." };
  }

  // @ts-ignore
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: (workspace as any).id,
      user_id: user.id,
      role: "owner",
    } as any);

  if (memberError) {
    console.error("Member addition error:", memberError);
    return { error: "Failed to add workspace member." };
  }

  revalidatePath("/dashboard");
  // @ts-ignore
  return { workspaceId: (workspace as any).id };
}
