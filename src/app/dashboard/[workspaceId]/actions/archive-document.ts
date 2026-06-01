"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function archiveDocument(documentId: string, workspaceId: string) {
  const supabase = createClient();

  const { error } = await (supabase.from("documents") as any)
    .update({
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { error: "Failed to archive document" };
  }

  revalidatePath(`/dashboard/${workspaceId}`);
  revalidatePath(`/dashboard/${workspaceId}/doc/${documentId}`);
  return { success: true };
}
