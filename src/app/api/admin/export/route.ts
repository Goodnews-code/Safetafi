import { getSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  // Check auth
  if (session?.value !== "authenticated") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = getSupabase();
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !transactions) {
    return new NextResponse("Failed to fetch data", { status: 500 });
  }

  return NextResponse.json({ transactions });
}
