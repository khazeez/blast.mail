
-- Table: plans (konfigurasi paket yang tersedia)
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  max_contacts integer NOT NULL,
  max_messages integer, -- NULL = unlimited
  price_monthly integer NOT NULL DEFAULT 0, -- dalam IDR
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_free boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Plans bisa dilihat semua orang (public catalog)
CREATE POLICY "Plans are viewable by everyone"
  ON public.plans FOR SELECT
  USING (true);

-- Table: subscriptions (langganan user)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'active', -- active, expired, cancelled
  duration_months integer NOT NULL DEFAULT 1,
  discount_percent integer NOT NULL DEFAULT 0,
  price_per_month integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL DEFAULT 0,
  contacts_used integer NOT NULL DEFAULT 0,
  messages_used integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed: Free plan
INSERT INTO public.plans (name, max_contacts, max_messages, price_monthly, is_free, features)
VALUES ('Free', 100, 200, 0, true, '["100 kontak","200 pesan/bulan","Email editor dasar","1 template","Statistik dasar"]'::jsonb);

-- Seed: Pro plans untuk setiap tier kontak
INSERT INTO public.plans (name, max_contacts, max_messages, price_monthly, is_free, features)
VALUES
  ('Pro 1K', 1000, NULL, 50000, false, '["1.000 kontak","Pesan unlimited","Drag & Drop email builder","Template tanpa batas","Analytics lengkap","Marketing automation","Custom domain & DKIM","Webhook & API access","Integrasi Google Sheets","Prioritas support"]'::jsonb),
  ('Pro 2.5K', 2500, NULL, 125000, false, '["2.500 kontak","Pesan unlimited","Drag & Drop email builder","Template tanpa batas","Analytics lengkap","Marketing automation","Custom domain & DKIM","Webhook & API access","Integrasi Google Sheets","Prioritas support"]'::jsonb),
  ('Pro 5K', 5000, NULL, 250000, false, '["5.000 kontak","Pesan unlimited","Drag & Drop email builder","Template tanpa batas","Analytics lengkap","Marketing automation","Custom domain & DKIM","Webhook & API access","Integrasi Google Sheets","Prioritas support"]'::jsonb),
  ('Pro 7.5K', 7500, NULL, 375000, false, '["7.500 kontak","Pesan unlimited","Drag & Drop email builder","Template tanpa batas","Analytics lengkap","Marketing automation","Custom domain & DKIM","Webhook & API access","Integrasi Google Sheets","Prioritas support"]'::jsonb),
  ('Pro 10K', 10000, NULL, 500000, false, '["10.000 kontak","Pesan unlimited","Drag & Drop email builder","Template tanpa batas","Analytics lengkap","Marketing automation","Custom domain & DKIM","Webhook & API access","Integrasi Google Sheets","Prioritas support"]'::jsonb),
  ('Pro 15K', 15000, NULL, 750000, false, '["15.000 kontak","Pesan unlimited","Drag & Drop email builder","Template tanpa batas","Analytics lengkap","Marketing automation","Custom domain & DKIM","Webhook & API access","Integrasi Google Sheets","Prioritas support"]'::jsonb),
  ('Pro 20K', 20000, NULL, 1000000, false, '["20.000 kontak","Pesan unlimited","Drag & Drop email builder","Template tanpa batas","Analytics lengkap","Marketing automation","Custom domain & DKIM","Webhook & API access","Integrasi Google Sheets","Prioritas support"]'::jsonb),
  ('Pro 25K', 25000, NULL, 1250000, false, '["25.000 kontak","Pesan unlimited","Drag & Drop email builder","Template tanpa batas","Analytics lengkap","Marketing automation","Custom domain & DKIM","Webhook & API access","Integrasi Google Sheets","Prioritas support"]'::jsonb),
  ('Pro 50K', 50000, NULL, 2500000, false, '["50.000 kontak","Pesan unlimited","Drag & Drop email builder","Template tanpa batas","Analytics lengkap","Marketing automation","Custom domain & DKIM","Webhook & API access","Integrasi Google Sheets","Prioritas support"]'::jsonb),
  ('Pro 75K', 75000, NULL, 3750000, false, '["75.000 kontak","Pesan unlimited","Drag & Drop email builder","Template tanpa batas","Analytics lengkap","Marketing automation","Custom domain & DKIM","Webhook & API access","Integrasi Google Sheets","Prioritas support"]'::jsonb);

-- Auto-assign free plan to new users
CREATE OR REPLACE FUNCTION public.assign_free_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  SELECT id INTO free_plan_id FROM public.plans WHERE is_free = true LIMIT 1;
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status, duration_months, price_per_month, total_price, expires_at)
    VALUES (NEW.id, free_plan_id, 'active', 0, 0, 0, '2099-12-31'::timestamptz);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_plan
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_free_plan();
