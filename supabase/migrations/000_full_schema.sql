-- ------------------------------------------------------------
-- 000_full_schema.sql  –  All tables, indexes, RLS, functions, etc.
-- ------------------------------------------------------------

-- 1️⃣ Extensions ------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2️⃣ Tables ----------------------------------------------------
-- Profiles (user info)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Workspace members (junction)
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner','admin','member','viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- Documents (hierarchical)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT 'Untitled',
  content JSONB,
  parent_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  icon TEXT,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Document collaborators (junction)
CREATE TABLE IF NOT EXISTS document_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner','editor','commenter','viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(document_id, user_id)
);

-- Document presence (realtime cursors)
CREATE TABLE IF NOT EXISTS document_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cursor JSONB,
  color TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(document_id, user_id)
);

-- 3️⃣ Indexes ----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_documents_workspace_id ON documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_archived ON documents(is_archived);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_document_id ON document_collaborators(document_id);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_user_id ON document_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_document_presence_document_id ON document_presence(document_id);
CREATE INDEX IF NOT EXISTS idx_document_presence_user_id ON document_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_document_presence_last_active ON document_presence(last_active);

-- 4️⃣ Enable Row‑Level Security -----------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_presence ENABLE ROW LEVEL SECURITY;

-- 5️⃣ SECURITY DEFINER Helper Functions (Prevents RLS recursion) --

-- Check if user is a member of the workspace
CREATE OR REPLACE FUNCTION public.check_is_workspace_member(p_workspace_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id
  );
$$;

-- Check if user is an admin or owner of the workspace
CREATE OR REPLACE FUNCTION public.check_is_workspace_admin(p_workspace_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND role IN ('owner', 'admin')
  );
$$;

-- Check if user is the owner of the workspace (from workspaces table)
CREATE OR REPLACE FUNCTION public.check_is_workspace_owner(p_workspace_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = p_workspace_id AND owner_id = p_user_id
  );
$$;

-- Get workspace ID for a document
CREATE OR REPLACE FUNCTION public.get_document_workspace_id(p_document_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT workspace_id FROM public.documents WHERE id = p_document_id;
$$;

-- Check if user is the creator of the document
CREATE OR REPLACE FUNCTION public.check_is_document_creator(p_document_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.documents
    WHERE id = p_document_id AND created_by = p_user_id
  );
$$;


-- 6️⃣ RLS Policies ------------------------------------------------

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);


-- Workspaces
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can insert workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners/admins can update their workspaces" ON workspaces;

CREATE POLICY "Users can view workspaces they belong to"
  ON workspaces FOR SELECT USING (
    auth.uid() = owner_id
    OR public.check_is_workspace_member(id, auth.uid())
  );

CREATE POLICY "Workspace owners can insert workspaces"
  ON workspaces FOR INSERT WITH CHECK (
    auth.uid() = owner_id
  );

CREATE POLICY "Workspace owners/admins can update their workspaces"
  ON workspaces FOR UPDATE USING (
    auth.uid() = owner_id
    OR public.check_is_workspace_admin(id, auth.uid())
  );


-- Workspace members
DROP POLICY IF EXISTS "Members can view their own memberships" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners/admins can manage members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners/admins can update members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners/admins can delete members" ON workspace_members;
DROP POLICY IF EXISTS "Members can view workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners/admins can insert members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can insert members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON workspace_members;


CREATE POLICY "Members can view workspace memberships"
  ON workspace_members FOR SELECT USING (
    auth.uid() = user_id
    OR public.check_is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "Workspace owners/admins can insert members"
  ON workspace_members FOR INSERT WITH CHECK (
    public.check_is_workspace_owner(workspace_id, auth.uid())
    OR public.check_is_workspace_admin(workspace_id, auth.uid())
  );

CREATE POLICY "Workspace owners/admins can update members"
  ON workspace_members FOR UPDATE USING (
    public.check_is_workspace_owner(workspace_id, auth.uid())
    OR public.check_is_workspace_admin(workspace_id, auth.uid())
  );

CREATE POLICY "Workspace owners/admins can delete members"
  ON workspace_members FOR DELETE USING (
    public.check_is_workspace_owner(workspace_id, auth.uid())
    OR public.check_is_workspace_admin(workspace_id, auth.uid())
  );


-- Documents
DROP POLICY IF EXISTS "Users can view documents in their workspaces" ON documents;
DROP POLICY IF EXISTS "Workspace members can create documents" ON documents;
DROP POLICY IF EXISTS "Document creators / workspace admins can update documents" ON documents;
DROP POLICY IF EXISTS "Document creators / workspace admins can delete documents" ON documents;

CREATE POLICY "Users can view documents in their workspaces"
  ON documents FOR SELECT USING (
    public.check_is_workspace_member(workspace_id, auth.uid())
    AND is_archived = FALSE
  );

CREATE POLICY "Workspace members can create documents"
  ON documents FOR INSERT WITH CHECK (
    public.check_is_workspace_member(workspace_id, auth.uid())
    AND auth.uid() = created_by
  );

CREATE POLICY "Document creators / workspace admins can update documents"
  ON documents FOR UPDATE USING (
    auth.uid() = created_by
    OR public.check_is_workspace_admin(workspace_id, auth.uid())
  );

CREATE POLICY "Document creators / workspace admins can delete documents"
  ON documents FOR DELETE USING (
    auth.uid() = created_by
    OR public.check_is_workspace_admin(workspace_id, auth.uid())
  );


-- Document collaborators
DROP POLICY IF EXISTS "Owners/admins can insert collaborators" ON document_collaborators;
DROP POLICY IF EXISTS "Owners/admins can update collaborators" ON document_collaborators;
DROP POLICY IF EXISTS "Owners/admins can view collaborators" ON document_collaborators;
DROP POLICY IF EXISTS "Workspace owners/admins can insert collaborators" ON document_collaborators;
DROP POLICY IF EXISTS "Workspace owners/admins can update collaborators" ON document_collaborators;
DROP POLICY IF EXISTS "Workspace owners/admins can view collaborators" ON document_collaborators;
DROP POLICY IF EXISTS "Workspace owners/admins can delete collaborators" ON document_collaborators;

CREATE POLICY "Workspace owners/admins can view collaborators"
  ON document_collaborators FOR SELECT USING (
    public.check_is_workspace_admin(public.get_document_workspace_id(document_id), auth.uid())
    OR public.check_is_document_creator(document_id, auth.uid())
    OR auth.uid() = user_id
  );

CREATE POLICY "Workspace owners/admins can insert collaborators"
  ON document_collaborators FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR public.check_is_workspace_admin(public.get_document_workspace_id(document_id), auth.uid())
    OR public.check_is_document_creator(document_id, auth.uid())
  );

CREATE POLICY "Workspace owners/admins can update collaborators"
  ON document_collaborators FOR UPDATE USING (
    public.check_is_workspace_admin(public.get_document_workspace_id(document_id), auth.uid())
    OR public.check_is_document_creator(document_id, auth.uid())
  );

CREATE POLICY "Workspace owners/admins can delete collaborators"
  ON document_collaborators FOR DELETE USING (
    public.check_is_workspace_admin(public.get_document_workspace_id(document_id), auth.uid())
    OR public.check_is_document_creator(document_id, auth.uid())
  );


-- Document presence
DROP POLICY IF EXISTS "Workspace members can view presence" ON document_presence;
DROP POLICY IF EXISTS "Document presence owner can insert" ON document_presence;
DROP POLICY IF EXISTS "Document presence owner can update" ON document_presence;
DROP POLICY IF EXISTS "Document presence owner can delete" ON document_presence;

CREATE POLICY "Workspace members can view presence"
  ON document_presence FOR SELECT USING (
    public.check_is_workspace_member(public.get_document_workspace_id(document_id), auth.uid())
  );

CREATE POLICY "Document presence owner can insert"
  ON document_presence FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Document presence owner can update"
  ON document_presence FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Document presence owner can delete"
  ON document_presence FOR DELETE USING (auth.uid() = user_id);


-- 7️⃣ Triggers and Functions ---------------------------------------

-- Auto‑create a profile row when a new auth user appears
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep `updated_at` in sync
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_collaborators_updated_at ON document_collaborators;
CREATE TRIGGER update_document_collaborators_updated_at
  BEFORE UPDATE ON document_collaborators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_presence_updated_at ON document_presence;


-- 8️⃣ Sync Pre-existing Auth Users ---------------------------------
-- Ensures pre-existing users have a profile row after a database reset
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- End of 000_full_schema.sql
-- ------------------------------------------------------------
