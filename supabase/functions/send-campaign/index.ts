import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// AWS Signature V4 helpers
function hmac(key: Uint8Array, data: string): Promise<ArrayBuffer> {
  return crypto.subtle
    .importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((k) => crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data)));
}

async function getSignatureKey(key: string, dateStamp: string, region: string, service: string) {
  let k = await hmac(new TextEncoder().encode("AWS4" + key), dateStamp);
  k = await hmac(new Uint8Array(k), region);
  k = await hmac(new Uint8Array(k), service);
  k = await hmac(new Uint8Array(k), "aws4_request");
  return new Uint8Array(k);
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(data: string) {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data)));
}

async function sendSESEmail(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  from: string,
  to: string,
  subject: string,
  htmlBody: string
) {
  const service = "ses";
  const host = `email.${region}.amazonaws.com`;
  const endpoint = `https://${host}/v2/email/outbound-emails`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const dateStamp = amzDate.slice(0, 8);

  const body = JSON.stringify({
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: { Html: { Data: htmlBody, Charset: "UTF-8" } },
      },
    },
    Destination: { ToAddresses: [to] },
    FromEmailAddress: from,
  });

  const payloadHash = await sha256(body);
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-date";
  const canonicalRequest = `POST\n/v2/email/outbound-emails\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = toHex(await crypto.subtle.sign("HMAC", await crypto.subtle.importKey("raw", signingKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]), new TextEncoder().encode(stringToSign)));
  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Amz-Date": amzDate,
      Authorization: authHeader,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SES error ${res.status}: ${err}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller - use SUPABASE_ANON_KEY (standard in edge functions)
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAnon = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const { campaignId } = await req.json();
    if (!campaignId) throw new Error("campaignId required");

    // Fetch campaign
    const { data: campaign, error: cErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("user_id", user.id)
      .single();
    if (cErr || !campaign) throw new Error("Campaign not found");

    // Fetch sender profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("sender_name, sender_email, custom_domain, domain_verified")
      .eq("user_id", user.id)
      .single();

    const senderName = profile?.sender_name || "MailBlast";
    let senderEmail = profile?.sender_email || user.email!;

    // Use custom domain email if verified
    if (profile?.domain_verified && profile?.custom_domain && senderEmail) {
      const localPart = senderEmail.split("@")[0];
      senderEmail = `${localPart}@${profile.custom_domain}`;
    }
    // Fetch recipients from list
    let contacts: { id: string; email: string; name: string | null }[] = [];
    if (campaign.list_id) {
      const { data } = await supabase
        .from("contacts")
        .select("id, email, name")
        .eq("list_id", campaign.list_id)
        .eq("user_id", user.id)
        .eq("status", "subscribed");
      contacts = data || [];
    }

    if (contacts.length === 0) throw new Error("No recipients found");

    const accessKeyId = Deno.env.get("AWS_SES_ACCESS_KEY_ID")!;
    const secretAccessKey = Deno.env.get("AWS_SES_SECRET_ACCESS_KEY")!;
    const region = Deno.env.get("AWS_SES_REGION")!;
    const trackBaseUrl = `${supabaseUrl}/functions/v1/track-email`;

    let sentCount = 0;
    const errors: string[] = [];

    console.log(`Sending to ${contacts.length} contacts, from: ${senderName} <${senderEmail}>, region: ${region}`);
    
    for (const contact of contacts) {
      try {
        // Build tracking pixel & wrapped links
        const openPixel = `<img src="${trackBaseUrl}?type=open&cid=${campaignId}&rid=${contact.id}" width="1" height="1" style="display:none" alt="" />`;
        
        let html = campaign.content || "";
        // Wrap links for click tracking
        html = html.replace(
          /href="(https?:\/\/[^"]+)"/g,
          (_, url) => `href="${trackBaseUrl}?type=click&cid=${campaignId}&rid=${contact.id}&url=${encodeURIComponent(url)}"`
        );
        html += openPixel;

        console.log(`Sending to ${contact.email}...`);
        await sendSESEmail(
          accessKeyId,
          secretAccessKey,
          region,
          `${senderName} <${senderEmail}>`,
          contact.email,
          campaign.subject || campaign.name,
          html
        );
        sentCount++;
        console.log(`Sent to ${contact.email} OK`);

        // Record send event
        await supabase.from("campaign_analytics").insert({
          campaign_id: campaignId,
          contact_id: contact.id,
          event_type: "sent",
        });
      } catch (e) {
        console.error(`Failed to send to ${contact.email}: ${e.message}`);
        errors.push(`${contact.email}: ${e.message}`);
      }
    }

    // Update campaign status
    await supabase
      .from("campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipients_count: sentCount,
      })
      .eq("id", campaignId);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
