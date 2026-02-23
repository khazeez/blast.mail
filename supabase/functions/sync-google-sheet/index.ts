import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Build a JWT for the Google Service Account
async function getAccessToken(email: string, privateKeyPem: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const enc = new TextEncoder();
  const b64url = (buf: ArrayBuffer | Uint8Array) =>
    btoa(String.fromCharCode(...new Uint8Array(buf instanceof ArrayBuffer ? buf : buf)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const headerB64 = b64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  // Import PEM private key
  const pemBody = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const keyBuf = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuf,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, enc.encode(signingInput));
  const jwt = `${signingInput}.${b64url(signature)}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Failed to get Google access token: ${err}`);
  }
  const { access_token } = await tokenRes.json();
  return access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { integration_id } = await req.json();
    if (!integration_id) {
      return new Response(JSON.stringify({ error: "integration_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch integration config (RLS ensures user owns it)
    const { data: integration, error: intError } = await supabase
      .from("google_sheets_integrations")
      .select("*")
      .eq("id", integration_id)
      .single();

    if (intError || !integration) {
      return new Response(JSON.stringify({ error: "Integration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Google credentials
    const serviceEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    const serviceKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
    if (!serviceEmail || !serviceKey) {
      return new Response(JSON.stringify({ error: "Google service account not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get access token
    const accessToken = await getAccessToken(serviceEmail, serviceKey);

    // Fetch sheet data
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${integration.spreadsheet_id}/values/${encodeURIComponent(integration.sheet_name)}`;
    const sheetRes = await fetch(sheetUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!sheetRes.ok) {
      const errText = await sheetRes.text();
      return new Response(
        JSON.stringify({ error: `Failed to fetch sheet: ${errText}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sheetData = await sheetRes.json();
    const rows: string[][] = sheetData.values || [];

    if (rows.length < 2) {
      return new Response(
        JSON.stringify({ error: "Sheet has no data rows (need header + at least 1 row)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find column indexes from header row
    const headers = rows[0].map((h: string) => h.trim().toLowerCase());
    const emailCol = headers.indexOf(integration.email_column.toLowerCase());
    const nameCol = integration.name_column
      ? headers.indexOf(integration.name_column.toLowerCase())
      : -1;

    if (emailCol === -1) {
      return new Response(
        JSON.stringify({ error: `Column "${integration.email_column}" not found in sheet headers: ${headers.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process data rows
    const dataRows = rows.slice(1);
    let synced = 0;
    let skipped = 0;

    for (const row of dataRows) {
      const email = row[emailCol]?.trim();
      if (!email || !email.includes("@")) {
        skipped++;
        continue;
      }

      const name = nameCol >= 0 ? row[nameCol]?.trim() || null : null;

      // Upsert: skip if email already exists for this user
      const { data: existing } = await supabase
        .from("contacts")
        .select("id")
        .eq("user_id", userId)
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      const { error: insertError } = await supabase.from("contacts").insert({
        user_id: userId,
        email,
        name,
        list_id: integration.list_id || null,
        status: "subscribed",
      });

      if (insertError) {
        console.error("Insert error for", email, insertError.message);
        skipped++;
      } else {
        synced++;
      }
    }

    // Update last_synced_at
    await supabase
      .from("google_sheets_integrations")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", integration_id);

    return new Response(
      JSON.stringify({ success: true, synced, skipped, total: dataRows.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Sync error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
