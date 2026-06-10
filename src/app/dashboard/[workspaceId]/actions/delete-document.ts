"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteDocument(documentId: string, workspaceId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { error: "Failed to delete document" };
  }

  revalidatePath(`/dashboard/${workspaceId}`);
  revalidatePath(`/dashboard/${workspaceId}/doc/${documentId}`);
  return { success: true };
}
