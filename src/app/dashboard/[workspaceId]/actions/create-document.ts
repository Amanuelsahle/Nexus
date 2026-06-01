"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDocument(
  workspaceId: string,
  parentId?: string | null,
  title = "Untitled",
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: document, error } = await supabase
    .from("documents")
    .insert({
      title,
      workspace_id: workspaceId,
      parent_id: parentId || null,
      created_by: user.id,
      content: null,
    })
    .select()
    .single();

  if (error) {
    return { error: "Failed to create document" };
  }

  await supabase.from("document_collaborators").insert({
    document_id: document.id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath(`/dashboard/${workspaceId}`);
  redirect(`/dashboard/${workspaceId}/doc/${document.id}`);
}
