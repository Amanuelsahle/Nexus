import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Editor } from "@/components/editor/editor";

export default async function DocumentPage({
  params,
}: {
  params: { workspaceId: string; docId: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch document
  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", params.docId)
    .eq("workspace_id", params.workspaceId)
    .single();

  if (!document) {
    redirect(`/dashboard/${params.workspaceId}`);
  }

  return (
    <div className="h-full flex flex-col">
      <Editor
        documentId={params.docId}
        workspaceId={params.workspaceId}
        initialContent={document.content as any}
        initialTitle={document.title}
        initialUpdatedAt={document.updated_at}
      />
    </div>
  );
}
