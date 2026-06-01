-- Fix document policies to rely on workspace membership only
-- This removes recursive document_collaborators checks and allows workspace members to access documents.

DROP POLICY IF EXISTS "Users can view documents in their workspaces" ON documents;
DROP POLICY IF EXISTS "Users can view documents in their workspaces or as collaborators" ON documents;
DROP POLICY IF EXISTS "Document creators can update their documents" ON documents;
DROP POLICY IF EXISTS "Document creators, workspace admins, and editor collaborators can update" ON documents;
DROP POLICY IF EXISTS "Only creators and workspace admins can delete documents" ON documents;

CREATE POLICY "Users can view documents in their workspaces"
  ON documents FOR SELECT
  USING (
    documents.is_archived = FALSE
    AND EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = documents.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create documents"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = documents.workspace_id
        AND wm.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Workspace members can update documents"
  ON documents FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = documents.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin', 'member')
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
