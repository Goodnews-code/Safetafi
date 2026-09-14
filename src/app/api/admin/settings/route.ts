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
    .in("key", ["trip_date", "payments_enabled", "service_pricing", "payment_gateway", "trip_direction", "return_pickup_points", "return_pricing"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }

  const defaultPricing = [
    { id: "berger", label: "Berger", amount: 11000, icon: "location_on", enabled: true },
    { id: "oshodi", label: "Oshodi", amount: 12000, icon: "location_on", enabled: true },
    { id: "iyanapaja", label: "Iyanapaja", amount: 12500, icon: "location_on", enabled: true },
    { id: "abeokuta", label: "Abeokuta", amount: 12000, icon: "location_on", enabled: true },
    { id: "ibadan", label: "Ibadan", amount: 5000, icon: "location_on", enabled: true },
    { id: "ikorodu", label: "Ikorodu", amount: 12500, icon: "location_on", enabled: true },
  ];

  const defaultReturnPickupPoints = [
    { id: "campus_gate", label: "Campus Gate", enabled: true },
  ];

  const defaultReturnPricing = [
    { id: "berger", label: "Berger", amount: 11000, icon: "location_on", enabled: true },
    { id: "oshodi", label: "Oshodi", amount: 12000, icon: "location_on", enabled: true },
    { id: "iyanapaja", label: "Iyanapaja", amount: 12500, icon: "location_on", enabled: true },
    { id: "abeokuta", label: "Abeokuta", amount: 12000, icon: "location_on", enabled: true },
    { id: "ibadan", label: "Ibadan", amount: 5000, icon: "location_on", enabled: true },
    { id: "ikorodu", label: "Ikorodu", amount: 12500, icon: "location_on", enabled: true },
  ];

  return NextResponse.json({
    trip_date: settings.trip_date ?? "Tuesday, 7th of April, 2026",
    payments_enabled: settings.payments_enabled === "true",
    payment_gateway: settings.payment_gateway ?? "paystack",
    service_pricing: settings.service_pricing ? JSON.parse(settings.service_pricing) : defaultPricing,
    trip_direction: (settings.trip_direction ?? "to_campus") as "to_campus" | "from_campus",
    return_pickup_points: settings.return_pickup_points ? JSON.parse(settings.return_pickup_points) : defaultReturnPickupPoints,
    return_pricing: settings.return_pricing ? JSON.parse(settings.return_pricing) : defaultReturnPricing,
  });
}

// ── POST — update settings ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { trip_date, payments_enabled, service_pricing, payment_gateway, trip_direction, return_pickup_points, return_pricing } = body;
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
  if (payment_gateway !== undefined) {
    upserts.push({ key: "payment_gateway", value: String(payment_gateway) });
  }
  if (trip_direction !== undefined) {
    upserts.push({ key: "trip_direction", value: String(trip_direction) });
  }
  if (return_pickup_points !== undefined) {
    upserts.push({ key: "return_pickup_points", value: JSON.stringify(return_pickup_points) });
  }
  if (return_pricing !== undefined) {
    upserts.push({ key: "return_pricing", value: JSON.stringify(return_pricing) });
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
