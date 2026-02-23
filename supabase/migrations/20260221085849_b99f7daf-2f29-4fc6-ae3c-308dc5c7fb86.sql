-- Drop overly permissive policy and replace with a scoped one
DROP POLICY "Service and users can insert analytics" ON public.campaign_analytics;

-- Allow insert only when campaign belongs to the authenticated user
CREATE POLICY "Users can insert own campaign analytics"
ON public.campaign_analytics
FOR INSERT
WITH CHECK (
  campaign_id IN (
    SELECT id FROM campaigns WHERE user_id = auth.uid()
  )
);
