-- Fix RLS policies for workspace membership and document access
-- This corrects recursion issues and ensures collaborator access works properly.

-- Workspace membership policies
DROP POLICY IF EXISTS "Users can view workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON workspace_members;

CREATE POLICY "Users can view workspace memberships"
  ON workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can insert workspace memberships"
  ON workspace_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners can update workspace memberships"
  ON workspace_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners can delete workspace memberships"
  ON workspace_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Document access policies
DROP POLICY IF EXISTS "Users can view documents in their workspaces or as collaborators" ON documents;
DROP POLICY IF EXISTS "Document creators, workspace admins, and editor collaborators can update" ON documents;
DROP POLICY IF EXISTS "Only creators and workspace admins can delete documents" ON documents;

CREATE POLICY "Users can view documents in their workspaces or as collaborators"
  ON documents FOR SELECT
  USING (
    documents.is_archived = FALSE
    AND (
      EXISTS (
        SELECT 1 FROM workspace_members AS wm
        WHERE wm.workspace_id = documents.workspace_id
          AND wm.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM document_collaborators AS dc
        WHERE dc.document_id = documents.id
          AND dc.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Document creators, workspace admins, and editor collaborators can update"
  ON documents FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = documents.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM document_collaborators AS dc
      WHERE dc.document_id = documents.id
        AND dc.user_id = auth.uid()
        AND dc.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Only creators and workspace admins can delete documents"
  ON documents FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = documents.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );
