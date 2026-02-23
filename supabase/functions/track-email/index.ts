import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TRANSPARENT_PIXEL = Uint8Array.from(atob(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
), (c) => c.charCodeAt(0));

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const type = url.searchParams.get("type"); // "open" or "click"
  const campaignId = url.searchParams.get("cid");
  const contactId = url.searchParams.get("rid");
  const redirectUrl = url.searchParams.get("url");

  if (campaignId && type) {
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase.from("campaign_analytics").insert({
        campaign_id: campaignId,
        contact_id: contactId || null,
        event_type: type,
        metadata: redirectUrl ? { url: redirectUrl } : {},
      });
    } catch (_) {
      // Silent fail - don't break tracking
    }
  }

  if (type === "click" && redirectUrl) {
    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  }

  // Return transparent pixel for open tracking
  return new Response(TRANSPARENT_PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
});
