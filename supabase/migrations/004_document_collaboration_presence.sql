-- Add document collaborator and presence tables for collaborative workspace features

CREATE TABLE IF NOT EXISTS document_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'commenter', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(document_id, user_id)
);

CREATE TABLE IF NOT EXISTS document_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cursor JSONB,
  color TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(document_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_document_collaborators_document_id ON document_collaborators(document_id);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_user_id ON document_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_document_presence_document_id ON document_presence(document_id);
CREATE INDEX IF NOT EXISTS idx_document_presence_user_id ON document_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_document_presence_last_active ON document_presence(last_active);

ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view document collaborators"
  ON document_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      JOIN workspace_members ON workspace_members.workspace_id = documents.workspace_id
      WHERE documents.id = document_collaborators.document_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners/admins can manage document collaborators"
  ON document_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM documents
      JOIN workspace_members ON workspace_members.workspace_id = documents.workspace_id
      WHERE documents.id = document_collaborators.document_id
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace members can view document presence"
  ON document_presence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      JOIN workspace_members ON workspace_members.workspace_id = documents.workspace_id
      WHERE documents.id = document_presence.document_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own presence"
  ON document_presence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presence"
  ON document_presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presence"
  ON document_presence FOR DELETE
  USING (auth.uid() = user_id);
