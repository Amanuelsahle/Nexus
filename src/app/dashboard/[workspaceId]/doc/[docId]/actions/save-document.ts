"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveDocument(
  documentId: string,
  workspaceId: string,
  title: string,
  content: any,
) {
  const supabase = await createClient();

  const { error } = await (supabase.from("documents") as any)
    .update({
      title,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { error: "Failed to save document" };
  }

  revalidatePath(`/dashboard/${workspaceId}/doc/${documentId}`);
  return { success: true };
}
