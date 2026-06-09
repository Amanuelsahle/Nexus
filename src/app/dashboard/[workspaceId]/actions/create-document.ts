"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/supabase";
export async function createDocument(
  workspaceId: string,
  parentId?: string | null,
  title = "Untitled",
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify the user is a member of the workspace
  const { data: memberCheck } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!memberCheck) {
    return { error: "Unauthorized: You are not a member of this workspace" };
  }

  const documentId = crypto.randomUUID();

  // Document payload – using the generated Insert type
  const doc: Database["public"]["Tables"]["documents"]["Insert"] = {
    id: documentId,
    title,
    workspace_id: workspaceId,
    parent_id: parentId ?? null,
    created_by: user.id,
    content: null,
  };

  const { error: docError } = await supabase
    .from("documents")
    .insert([doc] as any);
  if (docError) {
    console.error("CREATE_DOCUMENT_ERROR (documents):", docError);
    return { error: `Failed to create document: ${docError.message}` };
  }

  // Add the creator as a collaborator (owner)
  const collabPayload: Database["public"]["Tables"]["document_collaborators"]["Insert"] =
    {
      document_id: documentId,
      user_id: user.id,
      role: "owner",
    };

  const { error: collabError } = await supabase
    .from("document_collaborators")
    .insert([collabPayload] as any);

  if (collabError) {
    console.error("CREATE_DOCUMENT_ERROR (collaborators):", collabError);
    return {
      error: `Failed to associate collaborator: ${collabError.message}`,
    };
  }

  revalidatePath(`/dashboard/${workspaceId}`);

  return { documentId };
}
