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
    .in("key", ["trip_date", "payments_enabled", "service_pricing"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }

  const defaultPricing = [
    { id: "berger", label: "Berger", amount: 11000, icon: "location_on" },
    { id: "oshodi", label: "Oshodi", amount: 12000, icon: "location_on" },
    { id: "iyanapaja", label: "Iyanapaja", amount: 12500, icon: "location_on" },
    { id: "abeokuta", label: "Abeokuta", amount: 12000, icon: "location_on" },
    { id: "ibadan", label: "Ibadan", amount: 5000, icon: "location_on" },
    { id: "ikorodu", label: "Ikorodu", amount: 12500, icon: "location_on" },
  ];

  return NextResponse.json({
    trip_date: settings.trip_date ?? "Tuesday, 7th of April, 2026",
    payments_enabled: settings.payments_enabled === "true",
    service_pricing: settings.service_pricing ? JSON.parse(settings.service_pricing) : defaultPricing,
  });
}

// ── POST — update settings ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { trip_date, payments_enabled, service_pricing } = body;
  const supabase = getSupabase();

  const upserts = [];

  if (trip_date !== undefined) {
    upserts.push({ key: "trip_date", value: String(trip_date) });
  }
  if (payments_enabled !== undefined) {
    upserts.push({ key: "payments_enabled", value: String(payments_enabled) });
  }
  if (service_pricing !== undefined) {
    upserts.push({ key: "service_pricing", value: JSON.stringify(service_pricing) });
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
