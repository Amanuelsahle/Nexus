-- Fix RLS policies for document_collaborators to properly support INSERT operations

-- Drop the problematic ALL policy
DROP POLICY IF EXISTS "Owners/admins can manage document collaborators" ON document_collaborators;

-- Recreate with separate policies for different operations
CREATE POLICY "Workspace owners/admins can insert collaborators"
  ON document_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      JOIN workspace_members ON workspace_members.workspace_id = documents.workspace_id
      WHERE documents.id = document_collaborators.document_id
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners/admins can update collaborators"
  ON document_collaborators FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      JOIN workspace_members ON workspace_members.workspace_id = documents.workspace_id
      WHERE documents.id = document_collaborators.document_id
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners/admins can delete collaborators"
  ON document_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      JOIN workspace_members ON workspace_members.workspace_id = documents.workspace_id
      WHERE documents.id = document_collaborators.document_id
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role IN ('owner', 'admin')
    )
  );
