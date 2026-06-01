export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: "owner" | "admin" | "member" | "viewer";
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member" | "viewer";
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member" | "viewer";
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          title: string;
          content: Json | null;
          parent_id: string | null;
          workspace_id: string;
          is_archived: boolean;
          icon: string | null;
          cover_image: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: Json | null;
          parent_id?: string | null;
          workspace_id: string;
          is_archived?: boolean;
          icon?: string | null;
          cover_image?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: Json | null;
          parent_id?: string | null;
          workspace_id?: string;
          is_archived?: boolean;
          icon?: string | null;
          cover_image?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      document_collaborators: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          role: "owner" | "editor" | "commenter" | "viewer";
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          role?: "owner" | "editor" | "commenter" | "viewer";
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          role?: "owner" | "editor" | "commenter" | "viewer";
          created_at?: string;
        };
      };
      document_presence: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          cursor: Json | null;
          color: string | null;
          last_active: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          cursor?: Json | null;
          color?: string | null;
          last_active?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          cursor?: Json | null;
          color?: string | null;
          last_active?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
