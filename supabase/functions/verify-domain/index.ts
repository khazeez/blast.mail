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

async function sesRequest(
  method: string,
  path: string,
  body: string,
  accessKeyId: string,
  secretAccessKey: string,
  region: string
) {
  const service = "ses";
  const host = `email.${region}.amazonaws.com`;
  const endpoint = `https://${host}${path}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = await sha256(body);
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-date";
  const canonicalRequest = `${method}\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = toHex(
    await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", signingKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      new TextEncoder().encode(stringToSign)
    )
  );
  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Amz-Date": amzDate,
      Authorization: authHeader,
    },
    body: body || undefined,
  });
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

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAnon = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const { action, domain } = await req.json();
    const accessKeyId = Deno.env.get("AWS_SES_ACCESS_KEY_ID")!;
    const secretAccessKey = Deno.env.get("AWS_SES_SECRET_ACCESS_KEY")!;
    const region = Deno.env.get("AWS_SES_REGION")!;

    if (action === "add") {
      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domain || !domainRegex.test(domain)) {
        throw new Error("Invalid domain format");
      }

      // Create identity in SES (domain verification)
      const res = await sesRequest(
        "POST",
        `/v2/email/identities`,
        JSON.stringify({ EmailIdentity: domain }),
        accessKeyId,
        secretAccessKey,
        region
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`SES error: ${err}`);
      }

      const sesData = await res.json();

      // Store domain and DKIM tokens
      const dkimTokens = sesData.DkimAttributes?.Tokens || [];
      const verificationToken = JSON.stringify({
        dkimTokens,
        identityType: sesData.IdentityType,
      });

      await supabase
        .from("profiles")
        .update({
          custom_domain: domain,
          domain_verified: false,
          domain_verification_token: verificationToken,
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({
          success: true,
          domain,
          dkimTokens,
          message: "Domain added to SES. Add DKIM CNAME records to your DNS, then check verification status.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "check") {
      // Get current domain from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("custom_domain")
        .eq("user_id", user.id)
        .single();

      if (!profile?.custom_domain) throw new Error("No domain configured");

      // Check identity verification status
      const encodedDomain = encodeURIComponent(profile.custom_domain);
      const res = await sesRequest(
        "GET",
        `/v2/email/identities/${encodedDomain}`,
        "",
        accessKeyId,
        secretAccessKey,
        region
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`SES error: ${err}`);
      }

      const sesData = await res.json();
      const isVerified = sesData.VerifiedForSendingStatus === true;

      // Update profile
      await supabase
        .from("profiles")
        .update({ domain_verified: isVerified })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({
          success: true,
          domain: profile.custom_domain,
          verified: isVerified,
          dkimStatus: sesData.DkimAttributes?.Status,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "remove") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("custom_domain")
        .eq("user_id", user.id)
        .single();

      if (profile?.custom_domain) {
        // Remove from SES
        const encodedDomain = encodeURIComponent(profile.custom_domain);
        await sesRequest(
          "DELETE",
          `/v2/email/identities/${encodedDomain}`,
          "",
          accessKeyId,
          secretAccessKey,
          region
        );
      }

      await supabase
        .from("profiles")
        .update({
          custom_domain: null,
          domain_verified: false,
          domain_verification_token: null,
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ success: true, message: "Domain removed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action. Use: add, check, or remove");
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
