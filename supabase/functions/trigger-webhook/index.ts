import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// HMAC-SHA256 signing
async function signPayload(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Deliver webhook with retry (up to 3 attempts, exponential backoff)
async function deliverWebhook(
  url: string,
  secret: string,
  event: string,
  data: Record<string, unknown>,
  supabase: any,
  webhookId: string
) {
  const payload = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data,
  });

  const signature = await signPayload(secret, payload);
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": event,
        },
        body: payload,
      });

      const responseBody = await res.text();
      const success = res.status >= 200 && res.status < 300;

      // Log the delivery
      await supabase.from("webhook_logs").insert({
        webhook_id: webhookId,
        event,
        payload: JSON.parse(payload),
        response_status: res.status,
        response_body: responseBody.slice(0, 1000),
        success,
        attempt,
      });

      if (success) return;

      // If not last attempt, wait before retry
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      await supabase.from("webhook_logs").insert({
        webhook_id: webhookId,
        event,
        payload: JSON.parse(payload),
        response_status: 0,
        response_body: errorMessage.slice(0, 1000),
        success: false,
        attempt,
      });

      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
    }

    // Use service role to bypass RLS for reading all webhooks and inserting logs
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { event, user_id, data } = await req.json();

    if (!event || !user_id || !data) {
      return new Response(
        JSON.stringify({ error: "event, user_id, and data are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find all active webhooks for this user that subscribe to this event
    const { data: webhooks, error: whError } = await supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", user_id)
      .eq("active", true)
      .contains("events", [event]);

    if (whError) {
      console.error("Error fetching webhooks:", whError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch webhooks" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!webhooks || webhooks.length === 0) {
      return new Response(
        JSON.stringify({ delivered: 0, message: "No webhooks subscribed to this event" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deliver to all matching webhooks in parallel
    await Promise.allSettled(
      webhooks.map((wh: any) =>
        deliverWebhook(wh.url, wh.secret, event, data, supabase, wh.id)
      )
    );

    return new Response(
      JSON.stringify({ delivered: webhooks.length, event }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Trigger webhook error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
