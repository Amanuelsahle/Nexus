"use client";

import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface DocumentTreeProps {
  documents: any[];
  workspaceId: string;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  onCreateDocument: (parentId?: string | null) => Promise<void>;
  onRenameDocument: (document: any) => Promise<void>;
  onDeleteDocument: (documentId: string) => Promise<void>;
  onArchiveDocument: (documentId: string) => Promise<void>;
  parentId?: string | null;
  level?: number;
}

export function DocumentTree({
  documents,
  workspaceId,
  expandedFolders,
  onToggleFolder,
  onCreateDocument,
  onRenameDocument,
  onDeleteDocument,
  onArchiveDocument,
  parentId = null,
  level = 0,
}: DocumentTreeProps) {
  const filteredDocuments = documents.filter(
    (doc) => doc.parent_id === parentId,
  );

  if (filteredDocuments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {filteredDocuments.map((doc) => {
        const hasChildren = documents.some((d) => d.parent_id === doc.id);
        const isExpanded = expandedFolders.has(doc.id);

        return (
          <div key={doc.id}>
            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent group"
              style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0"
                  onClick={() => onToggleFolder(doc.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              ) : (
                <div className="w-5 h-5" />
              )}
              <span className="text-lg">{doc.icon || "📄"}</span>
              <Link
                href={`/dashboard/${workspaceId}/doc/${doc.id}`}
                className="flex-1 text-sm truncate hover:underline"
              >
                {doc.title}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCreateDocument(doc.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add sub-page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRenameDocument(doc)}>
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDeleteDocument(doc.id)}>
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onArchiveDocument(doc.id)}>
                    Archive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {isExpanded && hasChildren && (
              <DocumentTree
                documents={documents}
                workspaceId={workspaceId}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                onCreateDocument={onCreateDocument}
                onRenameDocument={onRenameDocument}
                onDeleteDocument={onDeleteDocument}
                onArchiveDocument={onArchiveDocument}
                parentId={doc.id}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
