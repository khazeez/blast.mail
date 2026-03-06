-- Add use_default_domain column to profiles table
-- This allows users to choose between using MailBlast's default domain or their custom domain

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS use_default_domain BOOLEAN DEFAULT true;

-- Set default sender email for users who don't have one
UPDATE profiles
SET sender_email = 'noreply@send.mailblast.id'
WHERE sender_email IS NULL OR sender_email = '';

-- Set use_default_domain to true for users without verified custom domain
UPDATE profiles
SET use_default_domain = true
WHERE domain_verified = false OR custom_domain IS NULL;

-- Set use_default_domain to false for users with verified custom domain
UPDATE profiles
SET use_default_domain = false
WHERE domain_verified = true AND custom_domain IS NOT NULL;
