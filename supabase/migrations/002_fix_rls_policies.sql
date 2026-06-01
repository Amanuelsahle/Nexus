-- Fix infinite recursion in workspace_members RLS policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON workspace_members;

-- Create corrected policies that don't create circular references
CREATE POLICY "Users can view workspace memberships"
  ON workspace_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert workspace memberships"
  ON workspace_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workspace membership"
  ON workspace_members FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own workspace membership"
  ON workspace_members FOR DELETE
  USING (user_id = auth.uid());

-- Update workspaces SELECT policy to be simpler and avoid circular reference
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;

CREATE POLICY "Users can view workspaces they are members of"
  ON workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );
