import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { Database } from "@/types/supabase";

type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ workspaceId: string; docId: string }>;
}) {
  // 2. Unwrap the dynamic route params
  const resolvedParams = await params;
  const { workspaceId, docId } = resolvedParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch document
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("id", docId)
    .eq("workspace_id", workspaceId)
    .single();

  const document = data as DocumentRow | null;

  if (!document) {
    redirect(`/dashboard/${workspaceId}`);
  }

  return (
    <div className="h-full flex flex-col">
      <Editor
        documentId={docId}
        workspaceId={workspaceId}
        initialContent={(document as DocumentRow).content as any}
        initialTitle={document.title}
        initialUpdatedAt={document.updated_at}
      />
    </div>
  );
}
