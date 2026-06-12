

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_presence ENABLE ROW LEVEL SECURITY;

-- 1️⃣ SECURITY DEFINER Helper Functions (Prevents RLS recursion) --

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


-- 2️⃣ RLS Policies ------------------------------------------------

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


DROP POLICY IF EXISTS "Workspace owners/admins can manage members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners/admins can update members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners/admins can delete members" ON workspace_members;
DROP POLICY IF EXISTS "Members can view workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners/admins can insert members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can insert members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON workspace_members;
DROP POLICY IF EXISTS "Members can view their own memberships" ON workspace_members;


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

-- Sync Pre-existing Auth Users
-- Ensures pre-existing users have a profile row after a database reset
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Drop trigger that caused presence updates to fail
DROP TRIGGER IF EXISTS update_document_presence_updated_at ON document_presence;


