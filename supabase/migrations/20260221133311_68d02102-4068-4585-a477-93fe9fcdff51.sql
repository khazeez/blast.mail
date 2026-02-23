
-- Function to trigger webhooks via edge function when contacts change
CREATE OR REPLACE FUNCTION public.notify_webhook_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_name TEXT;
  payload JSONB;
  supabase_url TEXT;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_name := 'contact.created';
    payload := jsonb_build_object(
      'id', NEW.id, 'email', NEW.email, 'name', NEW.name,
      'status', NEW.status, 'list_id', NEW.list_id
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'unsubscribed' AND OLD.status != 'unsubscribed' THEN
      event_name := 'contact.unsubscribed';
    ELSE
      event_name := 'contact.updated';
    END IF;
    payload := jsonb_build_object(
      'id', NEW.id, 'email', NEW.email, 'name', NEW.name,
      'status', NEW.status, 'list_id', NEW.list_id,
      'old_status', OLD.status
    );
  ELSIF TG_OP = 'DELETE' THEN
    event_name := 'contact.deleted';
    payload := jsonb_build_object(
      'id', OLD.id, 'email', OLD.email, 'name', OLD.name
    );
  END IF;

  -- Check if there are any webhooks for this user subscribed to this event
  IF EXISTS (
    SELECT 1 FROM public.webhooks
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
      AND active = true
      AND event_name = ANY(events)
  ) THEN
    -- Call the edge function asynchronously via pg_net if available,
    -- otherwise just insert a pending record. For now we use a simple
    -- HTTP call via the Supabase edge function URL.
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/trigger-webhook',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'event', event_name,
        'user_id', COALESCE(NEW.user_id, OLD.user_id),
        'data', payload
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers on contacts table
CREATE TRIGGER webhook_contact_insert
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_webhook_contact();

CREATE TRIGGER webhook_contact_update
  AFTER UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_webhook_contact();

CREATE TRIGGER webhook_contact_delete
  AFTER DELETE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_webhook_contact();

-- Similar function for campaigns
CREATE OR REPLACE FUNCTION public.notify_webhook_campaign()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_name TEXT;
  payload JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    event_name := 'campaign.created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
      event_name := 'campaign.sent';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  payload := jsonb_build_object(
    'id', NEW.id, 'name', NEW.name, 'status', NEW.status,
    'subject', NEW.subject, 'recipients_count', NEW.recipients_count
  );

  IF EXISTS (
    SELECT 1 FROM public.webhooks
    WHERE user_id = NEW.user_id
      AND active = true
      AND event_name = ANY(events)
  ) THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/trigger-webhook',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'event', event_name,
        'user_id', NEW.user_id,
        'data', payload
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER webhook_campaign_insert
  AFTER INSERT ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_webhook_campaign();

CREATE TRIGGER webhook_campaign_update
  AFTER UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_webhook_campaign();

-- Similar for lists
CREATE OR REPLACE FUNCTION public.notify_webhook_list()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_name TEXT;
  payload JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    event_name := 'list.created';
    payload := jsonb_build_object('id', NEW.id, 'name', NEW.name);
  ELSIF TG_OP = 'DELETE' THEN
    event_name := 'list.deleted';
    payload := jsonb_build_object('id', OLD.id, 'name', OLD.name);
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.webhooks
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
      AND active = true
      AND event_name = ANY(events)
  ) THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/trigger-webhook',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'event', event_name,
        'user_id', COALESCE(NEW.user_id, OLD.user_id),
        'data', payload
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER webhook_list_insert
  AFTER INSERT ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_webhook_list();

CREATE TRIGGER webhook_list_delete
  AFTER DELETE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_webhook_list();
