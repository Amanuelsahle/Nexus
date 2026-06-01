"use client";

import { Mark, mergeAttributes } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { saveDocument } from "@/app/dashboard/[workspaceId]/doc/[docId]/actions/save-document";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import Collaboration from "@tiptap/extension-collaboration";

const TextStyle = Mark.create({
  name: "textStyle",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { style: "font-size" },
      { style: "font-weight" },
      { style: "color" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }

          return {
            style: `font-size: ${attributes.fontSize};`,
          };
        },
      },
      fontWeight: {
        default: null,
        parseHTML: (element) => element.style.fontWeight || null,
        renderHTML: (attributes) => {
          if (!attributes.fontWeight) {
            return {};
          }

          return {
            style: `font-weight: ${attributes.fontWeight};`,
          };
        },
      },
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }

          return {
            style: `color: ${attributes.color};`,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      setTextStyle:
        (attributes) =>
        ({ chain }) => {
          const attrs = Object.fromEntries(
            Object.entries(attributes).filter(([, value]) => value != null),
          );
          return chain().setMark(this.name, attrs).run();
        },
      unsetTextStyle:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

interface EditorProps {
  documentId: string;
  workspaceId: string;
  initialContent: any;
  initialTitle: string;
  initialUpdatedAt: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Collaborator {
  id: string;
  document_id: string;
  user_id: string;
  role: "owner" | "editor" | "commenter" | "viewer";
  created_at: string;
  profile: Profile | null;
}

interface PresenceRow {
  id: string;
  document_id: string;
  user_id: string;
  cursor: any;
  color: string | null;
  last_active: string;
  profile: Profile | null;
}

const MAX_PRESENCE_AGE_MS = 30_000;

function generatePresenceColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 60%)`;
}

function userLabel(profile: Profile | null, userId: string) {
  return profile?.full_name || profile?.email || userId.slice(0, 8);
}

export function Editor({
  documentId,
  workspaceId,
  initialContent,
  initialTitle,
  initialUpdatedAt,
}: EditorProps) {
  const supabase = createClientComponentClient<Database>();
  const skipRemoteUpdateRef = useRef(false);
  const mountedRef = useRef(true);
  const presenceColorRef = useRef(generatePresenceColor());

  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const providerRef = useRef<any>(null);

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(() =>
    JSON.parse(JSON.stringify(initialContent ?? { type: "doc", content: [] })),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [fontSize, setFontSize] = useState("18px");
  const [fontWeight, setFontWeight] = useState("400");
  const [textColor, setTextColor] = useState("#111827");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<
    "owner" | "admin" | "member" | "viewer" | null
  >(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [presence, setPresence] = useState<PresenceRow[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Collaborator["role"]>("editor");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState(initialUpdatedAt);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Collaboration.configure({
        document: ydocRef.current,
      }),
      StarterKit,
      TextStyle,
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    // Don't pass `content` when using Yjs collaboration — we'll set content
    // manually only when no provider is present to avoid duplication.
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] px-8 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      if (skipRemoteUpdateRef.current) {
        skipRemoteUpdateRef.current = false;
        return;
      }

      setContent(JSON.parse(JSON.stringify(editor.getJSON())));
      setIsDirty(true);
    },
  });

  useEffect(() => {
    if (editor && initialContent && !providerRef.current) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    const defaultHost = "localhost:1234";
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url =
      process.env.NEXT_PUBLIC_YJS_WS_URL || `${protocol}://${defaultHost}`;

    try {
      providerRef.current = new WebsocketProvider(
        url,
        `document-${documentId}`,
        ydocRef.current,
      );

      // Persist yjs updates locally
      const persistence = new IndexeddbPersistence(
        `doc-${documentId}`,
        ydocRef.current,
      );

      providerRef.current.on &&
        providerRef.current.on("status", (e: any) => {
          console.debug("Yjs provider status", e);
        });
    } catch (err) {
      console.error("Failed to initialize Yjs provider", err);
    }

    return () => {
      try {
        providerRef.current?.disconnect();
      } catch (e) {
        /* ignore */
      }
    };
  }, [documentId]);

  const fetchProfiles = useCallback(
    async (userIds: string[]) => {
      if (userIds.length === 0) {
        return [] as Profile[];
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      if (error) {
        console.error("Failed to load profiles", error);
        return [] as Profile[];
      }

      return data ?? [];
    },
    [supabase],
  );

  const loadCollaborators = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from("document_collaborators")
      .select("id, document_id, user_id, role, created_at")
      .eq("document_id", documentId);

    if (error) {
      console.error("Failed to load document collaborators", error);
      return;
    }

    const ids = (rows ?? []).map((row) => row.user_id);
    const profiles = await fetchProfiles(ids);
    const profileMap = new Map(
      profiles.map((profile) => [profile.id, profile]),
    );

    setCollaborators(
      (rows ?? []).map((row) => ({
        ...row,
        profile: profileMap.get(row.user_id) ?? null,
      })),
    );
  }, [fetchProfiles, supabase, documentId]);

  const loadPresence = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from("document_presence")
      .select("id, document_id, user_id, cursor, color, last_active")
      .eq("document_id", documentId);

    if (error) {
      console.error("Failed to load document presence", error);
      return;
    }

    const ids = (rows ?? []).map((row) => row.user_id);
    const profiles = await fetchProfiles(ids);
    const profileMap = new Map(
      profiles.map((profile) => [profile.id, profile]),
    );

    setPresence(
      (rows ?? []).map((row) => ({
        ...row,
        profile: profileMap.get(row.user_id) ?? null,
      })),
    );
  }, [fetchProfiles, supabase, documentId]);

  const loadSession = useCallback(async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Failed to get session", sessionError);
    }

    const userId = session?.user?.id;
    if (!userId) {
      return;
    }

    setCurrentUserId(userId);

    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (membershipError) {
      console.error("Failed to load workspace role", membershipError);
    } else if (membership?.role) {
      setCurrentUserRole(membership.role as typeof currentUserRole);
    }

    await Promise.all([loadCollaborators(), loadPresence()]);
  }, [loadCollaborators, loadPresence, supabase, workspaceId]);

  useEffect(() => {
    loadSession();

    return () => {
      mountedRef.current = false;
    };
  }, [loadSession]);

  const activePresence = useMemo(() => {
    const threshold = Date.now() - MAX_PRESENCE_AGE_MS;
    return presence.filter(
      (row) => new Date(row.last_active).getTime() >= threshold,
    );
  }, [presence]);

  const updatePresence = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    const { error } = await supabase.from("document_presence").upsert(
      {
        document_id: documentId,
        user_id: currentUserId,
        cursor: null,
        color: presenceColorRef.current,
        last_active: new Date().toISOString(),
      },
      { onConflict: ["document_id", "user_id"] },
    );

    if (error) {
      console.error("Failed to update presence", error);
    }
  }, [currentUserId, documentId, supabase]);

  const cleanupPresence = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    const { error } = await supabase
      .from("document_presence")
      .delete()
      .eq("document_id", documentId)
      .eq("user_id", currentUserId);

    if (error) {
      console.error("Failed to clean up presence", error);
    }
  }, [currentUserId, documentId, supabase]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    updatePresence();
    const interval = window.setInterval(updatePresence, 10_000);
    const handleUnload = () => {
      void cleanupPresence();
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", updatePresence);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", updatePresence);
      void cleanupPresence();
    };
  }, [cleanupPresence, currentUserId, updatePresence]);

  useEffect(() => {
    const presenceChannel = supabase
      .channel(`document-presence-${documentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "document_presence",
          filter: `document_id=eq.${documentId}`,
        },
        () => {
          void loadPresence();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "document_presence",
          filter: `document_id=eq.${documentId}`,
        },
        () => {
          void loadPresence();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "document_presence",
          filter: `document_id=eq.${documentId}`,
        },
        () => {
          void loadPresence();
        },
      );

    void presenceChannel.subscribe();

    return () => {
      void supabase.removeChannel(presenceChannel);
    };
  }, [documentId, loadPresence, supabase]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const documentChannel = supabase
      .channel(`document-updates-${documentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
          filter: `id=eq.${documentId}`,
        },
        (payload) => {
          if (providerRef.current) {
            // When using Yjs collaboration, ignore DB update events to avoid
            // duplicating content — Yjs handles syncing.
            return;
          }
          const updatedAt = payload.record?.updated_at;
          if (!payload.record || !updatedAt || !mountedRef.current) {
            return;
          }

          if (updatedAt === lastSavedAt) {
            return;
          }

          if (isDirty) {
            return;
          }

          skipRemoteUpdateRef.current = true;
          editor.commands.setContent(
            payload.record.content ?? { type: "doc", content: [] },
          );
          setContent(
            JSON.parse(
              JSON.stringify(
                payload.record.content ?? { type: "doc", content: [] },
              ),
            ),
          );
          setTitle(payload.record.title ?? title);
          setSaveStatus("Updated by collaborator");
          setIsDirty(false);
          setLastSavedAt(updatedAt);
        },
      );

    void documentChannel.subscribe();

    return () => {
      void supabase.removeChannel(documentChannel);
    };
  }, [
    currentUserId,
    documentId,
    editor,
    isDirty,
    lastSavedAt,
    supabase,
    title,
  ]);

  const handleInvite = useCallback(async () => {
    if (!inviteEmail.trim()) {
      setInviteError("Enter a collaborator email.");
      setInviteSuccess(null);
      return;
    }

    setInviteError(null);
    setInviteSuccess(null);

    const normalizedEmail = inviteEmail.trim().toLowerCase();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("email", normalizedEmail)
      .single();

    if (profileError || !profile) {
      setInviteError("No user found with that email.");
      return;
    }

    const { error: insertError } = await supabase
      .from("document_collaborators")
      .insert({
        document_id: documentId,
        user_id: profile.id,
        role: inviteRole,
      });

    if (insertError) {
      setInviteError(insertError.message || "Failed to add collaborator.");
      return;
    }

    const { error: workspaceInsertError } = await supabase
      .from("workspace_members")
      .upsert(
        {
          workspace_id: workspaceId,
          user_id: profile.id,
          role: "member",
        },
        { onConflict: ["workspace_id", "user_id"] },
      );

    if (workspaceInsertError) {
      console.error(
        "Failed to add collaborator to workspace_members",
        workspaceInsertError,
      );
    }

    setInviteEmail("");
    setInviteRole("editor");
    setInviteSuccess("Collaborator added.");
    await loadCollaborators();
  }, [
    documentId,
    inviteEmail,
    inviteRole,
    loadCollaborators,
    supabase,
    workspaceId,
  ]);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="border-b px-8 py-4 flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-4xl font-bold bg-transparent border-none outline-none w-full placeholder:text-muted-foreground"
            placeholder="Untitled"
          />
          <div className="text-sm text-muted-foreground">{saveStatus}</div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <span className="font-medium">Collaborators</span>
            <div className="flex items-center gap-2">
              {collaborators.length > 0 ? (
                collaborators.map((collaborator) => {
                  const label = userLabel(
                    collaborator.profile,
                    collaborator.user_id,
                  );
                  return (
                    <div
                      key={collaborator.id}
                      className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-white"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                        {collaborator.profile?.full_name?.[0] ||
                          collaborator.profile?.email?.[0] ||
                          "U"}
                      </span>
                      <span>{label}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-600">
                        {collaborator.role}
                      </span>
                    </div>
                  );
                })
              ) : (
                <span className="text-slate-500">
                  No collaborators configured yet.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <span className="font-medium">Online now</span>
            <div className="flex items-center gap-2">
              {activePresence.length > 0 ? (
                activePresence.map((row) => (
                  <span
                    key={row.id}
                    className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs"
                    style={{ borderColor: row.color || "#CBD5E1" }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: row.color || "#60A5FA" }}
                    />
                    {userLabel(row.profile, row.user_id)}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">No one else online yet.</span>
              )}
            </div>
          </div>
        </div>

        {(currentUserRole === "owner" || currentUserRole === "admin") && (
          <div className="grid gap-2 rounded-lg border bg-white p-4 text-sm shadow-sm">
            <div className="font-semibold text-slate-800">
              Invite a collaborator
            </div>
            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="User email"
                className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              />
              <select
                value={inviteRole}
                onChange={(event) =>
                  setInviteRole(event.target.value as Collaborator["role"])
                }
                className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="owner">Owner</option>
                <option value="editor">Editor</option>
                <option value="commenter">Commenter</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" onClick={handleInvite}>
                Add collaborator
              </Button>
              {inviteError && (
                <span className="text-sm text-red-600">{inviteError}</span>
              )}
              {inviteSuccess && (
                <span className="text-sm text-green-600">{inviteSuccess}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-b px-8 py-3 bg-slate-50 flex flex-col gap-3">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <label htmlFor="fontSize" className="font-medium text-slate-700">
              Size
            </label>
            <select
              id="fontSize"
              value={fontSize}
              onChange={(e) => {
                const next = e.target.value;
                setFontSize(next);
                applyTextStyle({
                  fontSize: next,
                  fontWeight,
                  color: textColor,
                });
              }}
              className="rounded-md border px-2 py-1 text-sm"
            >
              <option value="14px">Small</option>
              <option value="16px">Base</option>
              <option value="18px">Medium</option>
              <option value="22px">Large</option>
              <option value="26px">XL</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <label htmlFor="fontWeight" className="font-medium text-slate-700">
              Weight
            </label>
            <select
              id="fontWeight"
              value={fontWeight}
              onChange={(e) => {
                const next = e.target.value;
                setFontWeight(next);
                applyTextStyle({
                  fontSize,
                  fontWeight: next,
                  color: textColor,
                });
              }}
              className="rounded-md border px-2 py-1 text-sm"
            >
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="600">Semi-bold</option>
              <option value="700">Bold</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <label htmlFor="textColor" className="font-medium text-slate-700">
              Color
            </label>
            <input
              id="textColor"
              type="color"
              value={textColor}
              onChange={(e) => {
                const next = e.target.value;
                setTextColor(next);
                applyTextStyle({ fontSize, fontWeight, color: next });
              }}
              className="h-9 w-12 rounded-md border p-0"
            />
            <Button
              type="button"
              variant={editor?.isActive("italic") ? "secondary" : "ghost"}
              size="sm"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain()?.focus()?.toggleItalic()?.run()}
            >
              Italic
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
