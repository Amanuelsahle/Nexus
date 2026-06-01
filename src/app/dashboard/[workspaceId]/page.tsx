"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useParams } from "next/navigation";

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rootDocuments, setRootDocuments] = useState<any[]>([]);

  useEffect(() => {
    async function loadWorkspace() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/");
        return;
      }

      // Get root documents (no parent)
      const { data: documents, error } = await supabase
        .from("documents")
        .select("*")
        .eq("workspace_id", params.workspaceId)
        .is("parent_id", null)
        .eq("is_archived", false)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Documents fetch error:", error);
      } else {
        setRootDocuments(documents || []);
      }

      setLoading(false);
    }

    loadWorkspace();
  }, [supabase, router, params.workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Workspace Documents</h1>

      {rootDocuments && rootDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rootDocuments.map((doc) => (
            <a
              key={doc.id}
              href={`/dashboard/${params.workspaceId}/doc/${doc.id}`}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-2xl mb-2">{doc.icon || "📄"}</div>
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(doc.updated_at).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No documents yet. Create your first document to get started.
          </p>
        </div>
      )}
    </div>
  );
}
