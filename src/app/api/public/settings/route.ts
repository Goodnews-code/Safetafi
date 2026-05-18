import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Public endpoint — no auth required. Used by CheckoutPortal on load.
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["trip_date", "payments_enabled", "service_pricing", "payment_gateway"]);

  const defaultPricing = [
    { id: "berger", label: "Berger", amount: 11000, icon: "location_on", enabled: true },
    { id: "oshodi", label: "Oshodi", amount: 12000, icon: "location_on", enabled: true },
    { id: "iyanapaja", label: "Iyanapaja", amount: 12500, icon: "location_on", enabled: true },
    { id: "abeokuta", label: "Abeokuta", amount: 12000, icon: "location_on", enabled: true },
    { id: "ibadan", label: "Ibadan", amount: 5000, icon: "location_on", enabled: true },
    { id: "ikorodu", label: "Ikorodu", amount: 12500, icon: "location_on", enabled: true },
  ];

  if (error) {
    // Fallback defaults so checkout never fully breaks
    return NextResponse.json({
      trip_date: "Tuesday, 7th of April, 2026",
      payments_enabled: false,
      payment_gateway: "paystack",
      service_pricing: defaultPricing,
    });
  }

  const settings: Record<string, string> = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }

  // Parse the stored pricing and filter out any location the admin has disabled
  const rawPricing = settings.service_pricing ? JSON.parse(settings.service_pricing) : defaultPricing;
  const activePricing = rawPricing.filter((p: any) => p.enabled !== false);

  return NextResponse.json(
    {
      trip_date: settings.trip_date ?? "Tuesday, 7th of April, 2026",
      payments_enabled: settings.payments_enabled === "true",
      payment_gateway: settings.payment_gateway ?? "paystack",
      service_pricing: activePricing,
    },
    {
      headers: {
        // Short cache so changes propagate quickly
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      },
    }
  );
}
