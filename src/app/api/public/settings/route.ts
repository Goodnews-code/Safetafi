import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Public endpoint — no auth required. Used by CheckoutPortal on load.
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["trip_date", "payments_enabled"]);

  if (error) {
    // Fallback defaults so checkout never fully breaks
    return NextResponse.json({
      trip_date: "Tuesday, 7th of April, 2026",
      payments_enabled: false,
    });
  }

  const settings: Record<string, string> = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }

  return NextResponse.json(
    {
      trip_date: settings.trip_date ?? "Tuesday, 7th of April, 2026",
      payments_enabled: settings.payments_enabled === "true",
    },
    {
      headers: {
        // Short cache so changes propagate quickly
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      },
    }
  );
}
