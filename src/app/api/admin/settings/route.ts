import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";

// Helper: check admin session
async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

// ── GET — read current settings ─────────────────────────────────────────────
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["trip_date", "payments_enabled"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }

  return NextResponse.json({
    trip_date: settings.trip_date ?? "Tuesday, 7th of April, 2026",
    payments_enabled: settings.payments_enabled === "true",
  });
}

// ── POST — update settings ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { trip_date, payments_enabled } = body;
  const supabase = getSupabase();

  const upserts = [];

  if (trip_date !== undefined) {
    upserts.push({ key: "trip_date", value: String(trip_date) });
  }
  if (payments_enabled !== undefined) {
    upserts.push({ key: "payments_enabled", value: String(payments_enabled) });
  }

  if (upserts.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("app_settings")
    .upsert(upserts, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: true, message: "Settings updated." });
}
