
-- Allow service role to insert webhook logs (edge function uses service role)
-- Drop the restrictive insert policy and create one that allows service role
DROP POLICY "System can insert webhook logs" ON public.webhook_logs;

-- Service role bypasses RLS, so we just need the SELECT policy for users.
-- For insert, the edge function will use service_role key which bypasses RLS.

-- Also allow users to delete their own webhook logs (cleanup)
CREATE POLICY "Users can delete own webhook logs"
  ON public.webhook_logs FOR DELETE
  USING (webhook_id IN (
    SELECT id FROM public.webhooks WHERE user_id = auth.uid()
  ));
