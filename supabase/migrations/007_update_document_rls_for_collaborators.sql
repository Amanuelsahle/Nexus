-- Update document RLS policies to support document-level collaborators
-- This allows collaborators added via document_collaborators table to view and edit documents

-- Drop existing document policies that don't account for collaborators
DROP POLICY IF EXISTS "Users can view documents in their workspaces" ON documents;
DROP POLICY IF EXISTS "Document creators can update their documents" ON documents;

-- New SELECT policy: allow workspace members OR document collaborators to view
CREATE POLICY "Users can view documents in their workspaces or as collaborators"
  ON documents FOR SELECT
  USING (
    (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = documents.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
      AND documents.is_archived = FALSE
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM document_collaborators
        WHERE document_collaborators.document_id = documents.id
        AND document_collaborators.user_id = auth.uid()
      )
      AND documents.is_archived = FALSE
    )
  );

-- New UPDATE policy: allow creators, workspace admins, OR collaborators with edit/owner roles
CREATE POLICY "Document creators, workspace admins, and editor collaborators can update"
  ON documents FOR UPDATE
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = documents.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_collaborators.document_id = documents.id
      AND document_collaborators.user_id = auth.uid()
      AND document_collaborators.role IN ('owner', 'editor')
    )
  );

-- Keep DELETE policy restrictive: only creator or workspace admins
CREATE POLICY "Only creators and workspace admins can delete documents"
  ON documents FOR DELETE
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = documents.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );
