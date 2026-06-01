"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function renameDocument(
  documentId: string,
  workspaceId: string,
  title: string,
) {
  const supabase = createClient();

  const { error } = await (supabase.from("documents") as any)
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { error: "Failed to rename document" };
  }

  revalidatePath(`/dashboard/${workspaceId}`);
  revalidatePath(`/dashboard/${workspaceId}/doc/${documentId}`);
  return { success: true };
}
