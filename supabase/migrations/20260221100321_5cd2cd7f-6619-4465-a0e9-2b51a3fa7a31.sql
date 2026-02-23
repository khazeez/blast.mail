
-- Add custom domain fields to profiles
ALTER TABLE public.profiles
ADD COLUMN custom_domain text DEFAULT NULL,
ADD COLUMN domain_verified boolean NOT NULL DEFAULT false,
ADD COLUMN domain_verification_token text DEFAULT NULL;
