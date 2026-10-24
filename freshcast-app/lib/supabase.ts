import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer the new publishable key (sb_publishable_...); fall back to the legacy anon key.
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const RESTAURANT_ID = "marcos-trattoria";

let client: SupabaseClient | null = null;
let currentToken: string | null = null;

// Public visitors get a read-only client. The owner's client also sends an
// x-admin-token header; Postgres row-level security checks it before any write
// (see supabase/security.sql). The token never ships in the JavaScript bundle.
export function getSupabase(): SupabaseClient | null {
  if (!url || !key) return null;
  if (!client) client = makeClient(currentToken);
  return client;
}

export function setAdminToken(token: string | null) {
  if (token === currentToken && client) return;
  currentToken = token;
  client = url && key ? makeClient(token) : null;
}

function makeClient(token: string | null): SupabaseClient {
  return createClient(url!, key!, {
    auth: { persistSession: false },
    global: token ? { headers: { "x-admin-token": token } } : undefined,
  });
}
