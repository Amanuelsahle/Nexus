"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DocumentTree } from "./document-tree";
import { CreateDocumentDialog } from "./create-document-dialog";
import { renameDocument } from "@/app/dashboard/[workspaceId]/actions/rename-document";
import { deleteDocument } from "@/app/dashboard/[workspaceId]/actions/delete-document";
import { archiveDocument } from "@/app/dashboard/[workspaceId]/actions/archive-document";

interface SidebarProps {
  workspace: any;
  documents: any[];
  workspaceId: string;
}

export function Sidebar({ workspace, documents, workspaceId }: SidebarProps) {
  const router = useRouter();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateDocument = async (parentId?: string | null) => {
    setCreateParentId(parentId ?? null);
    setIsCreateDialogOpen(true);
  };

  const handleRenameDocument = async (document: any) => {
    const newTitle = window.prompt("Rename page", document.title);
    if (!newTitle || newTitle.trim() === "" || newTitle === document.title) {
      return;
    }

    await renameDocument(document.id, workspaceId, newTitle.trim());
    router.refresh();
  };

  const handleDeleteDocument = async (documentId: string) => {
    const confirmed = window.confirm(
      "Delete this page? This cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    await deleteDocument(documentId, workspaceId);
    router.refresh();
  };

  const handleArchiveDocument = async (documentId: string) => {
    const confirmed = window.confirm(
      "Archive this page? It will be hidden from the sidebar.",
    );
    if (!confirmed) {
      return;
    }

    await archiveDocument(documentId, workspaceId);
    router.refresh();
  };

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <div>
          <h1 className="text-lg font-semibold truncate">{workspace.name}</h1>
          <p className="text-sm text-muted-foreground truncate">
            {workspace.description || "Workspace pages"}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Pages
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleCreateDocument(null)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <DocumentTree
            documents={documents}
            workspaceId={workspaceId}
            expandedFolders={expandedFolders}
            onToggleFolder={toggleFolder}
            onCreateDocument={handleCreateDocument}
            onRenameDocument={handleRenameDocument}
            onDeleteDocument={handleDeleteDocument}
            onArchiveDocument={handleArchiveDocument}
          />
        </div>
      </div>
      <CreateDocumentDialog
        workspaceId={workspaceId}
        parentId={createParentId}
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setCreateParentId(null);
          }
        }}
      />
    </aside>
  );
}
