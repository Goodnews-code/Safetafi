import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Public endpoint — no auth required. Used by CheckoutPortal on load.
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["trip_date", "payments_enabled", "service_pricing", "payment_gateway", "trip_direction", "return_pickup_points", "return_pricing"]);

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

  if (error) {
    // Fallback defaults so checkout never fully breaks
    return NextResponse.json({
      trip_date: "Tuesday, 7th of April, 2026",
      payments_enabled: false,
      payment_gateway: "paystack",
      service_pricing: defaultPricing,
      trip_direction: "to_campus",
      return_pickup_points: defaultReturnPickupPoints,
      return_pricing: defaultReturnPricing,
    });
  }

  const settings: Record<string, string> = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }

  // Parse the stored pricing and filter out any location the admin has disabled
  // Ensure amount is always a number (input fields return strings)
  const rawPricing = settings.service_pricing ? JSON.parse(settings.service_pricing) : defaultPricing;
  const activePricing = rawPricing
    .filter((p: any) => p.enabled !== false)
    .map((p: any) => ({ ...p, amount: Number(p.amount) }));

  const rawReturnPickup = settings.return_pickup_points ? JSON.parse(settings.return_pickup_points) : defaultReturnPickupPoints;
  const activeReturnPickup = rawReturnPickup.filter((p: any) => p.enabled !== false);

  const rawReturnPricing = settings.return_pricing ? JSON.parse(settings.return_pricing) : defaultReturnPricing;
  const activeReturnPricing = rawReturnPricing
    .filter((p: any) => p.enabled !== false)
    .map((p: any) => ({ ...p, amount: Number(p.amount) }));

  return NextResponse.json(
    {
      trip_date: settings.trip_date ?? "Tuesday, 7th of April, 2026",
      payments_enabled: settings.payments_enabled === "true",
      payment_gateway: settings.payment_gateway ?? "paystack",
      service_pricing: activePricing,
      trip_direction: (settings.trip_direction ?? "to_campus") as "to_campus" | "from_campus",
      return_pickup_points: activeReturnPickup,
      return_pricing: activeReturnPricing,
    },
    {
      headers: {
        // No caching — price/location changes must reflect immediately
        "Cache-Control": "no-store",
      },
    }
  );
}
