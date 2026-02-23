
-- Table to store per-user Google Sheets integration configs
CREATE TABLE public.google_sheets_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  spreadsheet_id TEXT NOT NULL,
  sheet_name TEXT NOT NULL DEFAULT 'Sheet1',
  email_column TEXT NOT NULL DEFAULT 'email',
  name_column TEXT DEFAULT 'name',
  list_id UUID REFERENCES public.lists(id) ON DELETE SET NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  auto_sync BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_sheets_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can CRUD own google sheets integrations"
  ON public.google_sheets_integrations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_google_sheets_integrations_updated_at
  BEFORE UPDATE ON public.google_sheets_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
