-- Fix infinite recursion in workspace_members SELECT policy
-- Allow users to select only their own workspace member rows.

DROP POLICY IF EXISTS "Users can view workspace memberships" ON workspace_members;

CREATE POLICY "Users can view their own workspace memberships"
  ON workspace_members FOR SELECT
  USING (
    user_id = auth.uid()
  );
