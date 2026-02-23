-- Allow service role to insert analytics (edge functions use service role key)
-- Also allow authenticated users to insert (for future client-side tracking)
CREATE POLICY "Service and users can insert analytics"
ON public.campaign_analytics
FOR INSERT
WITH CHECK (true);
