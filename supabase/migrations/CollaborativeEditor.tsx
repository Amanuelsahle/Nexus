"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { debounce } from "lodash";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import SupabaseProvider from "y-supabase";
import { createClient } from "@/lib/supabase/client";

interface Props {
  documentId: string;
  user: {
    id: string;
    name: string;
    color: string;
  };
}

export const CollaborativeEditor = ({ documentId, user }: Props) => {
  const supabase = useMemo(() => createClient(), []);
  const [provider, setProvider] = useState<SupabaseProvider | null>(null);

  // Initialize Yjs Document
  const ydoc = useMemo(() => new Y.Doc(), [documentId]);

  useEffect(() => {
    if (!documentId) return;

    //  Initialize Supabase Yjs Provider
    const newProvider = new SupabaseProvider(ydoc, supabase, {
      tableName: "documents",
      columnName: "content",
      idName: "id",
      id: documentId,
      channel: `doc-${documentId}`,
      awareness: new Awareness(ydoc),
    });

    setProvider(newProvider);

    return () => {
      newProvider.destroy();
      ydoc.destroy();
    };
  }, [documentId, ydoc, supabase]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        // Configure Real-time Content Sync
        Collaboration.configure({
          document: ydoc,
          field: "content",
        }),
        //  Configure Real-time Cursors (Awareness)
        ...(provider
          ? [
              CollaborationCursor.configure({
                provider: provider,
                user: {
                  name: user.name,
                  color: user.color,
                },
              }),
            ]
          : []),
      ],
      //  Sync Presence to the database table
      onSelectionUpdate: useMemo(
        () =>
          debounce(({ editor }) => {
            const { from, to } = editor.state.selection;

            (supabase.from("document_presence") as any)
              .upsert(
                {
                  document_id: documentId,
                  user_id: user.id,
                  cursor: { from, to },
                  color: user.color,
                  last_active: new Date().toISOString(),
                },
                { onConflict: "document_id,user_id" },
              )
              .then(({ error }: { error: any }) => {
                if (error) console.error("Error syncing presence:", error);
              });
          }, 500),
        [documentId, user.id, supabase],
      ),
    },
    [provider, ydoc, user],
  );

  // Cleanup presence on unmount
  useEffect(() => {
    return () => {
      (supabase.from("document_presence") as any)
        .delete()
        .match({ document_id: documentId, user_id: user.id });
    };
  }, [documentId, user.id, supabase]);

  if (!editor || !provider) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
        <p className="text-sm text-muted-foreground">
          Connecting to collaborative session...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full border rounded-xl bg-background shadow-sm overflow-hidden">
      {/* Active Users Header */}
      <div className="flex items-center justify-end p-2 border-b bg-muted/10 gap-2">
        <div className="flex -space-x-2">
          {Array.from(provider.awareness.getStates().values()).map(
            (state: any, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: state.user?.color || "#000" }}
                title={state.user?.name}
              >
                {state.user?.name?.charAt(0).toUpperCase()}
              </div>
            ),
          )}
        </div>
      </div>

      <div className="p-4 prose prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
