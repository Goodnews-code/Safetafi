import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ status: false, message: "Server configuration error." }, { status: 500 });
    }

    // 1. Fetch recent transactions from Paystack
    // We fetch the last 50 transactions to sync historical data
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction?perPage=50`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await paystackRes.json();
    if (!data.status) {
      return NextResponse.json({ status: false, message: "Failed to fetch from Paystack." }, { status: 400 });
    }

    const transactions = data.data || [];
    const successfulTransactions = transactions.filter((t: any) => t.status === "success");

    if (successfulTransactions.length === 0) {
      return NextResponse.json({ status: true, message: "No new successful transactions to sync.", syncedCount: 0 });
    }

    // 2. Map Paystack data to Supabase schema
    const dbTransactions = successfulTransactions.map((transaction: any) => {
      const metadataFields = transaction.metadata?.custom_fields || [];
      const getMetaValue = (key: string) => metadataFields.find((f: any) => f.variable_name === key)?.value || "";

      return {
        reference: transaction.reference,
        amount: transaction.amount / 100, // Convert from kobo to Naira
        currency: transaction.currency,
        email: transaction.customer?.email,
        phone: getMetaValue("phone") || transaction.customer?.phone || "",
        customer_name: getMetaValue("name") || `${transaction.customer?.first_name || ""} ${transaction.customer?.last_name || ""}`.trim() || "Anonymous",
        service: getMetaValue("service") || "Logistics",
        destination: getMetaValue("destination") || "N/A",
        date: getMetaValue("date") || "",
        description: getMetaValue("description") || "",
        status: transaction.status,
        paid_at: transaction.paid_at,
      };
    });

    // 3. Upsert into Supabase
    // We use upsert so that existing transactions are updated (preserving details) 
    // and new ones are added without duplicate errors.
    const supabase = getSupabase();
    const { error: dbError } = await supabase
      .from("transactions")
      .upsert(dbTransactions, { onConflict: "reference" });

    if (dbError) {
      console.error("Supabase upsert error in sync:", dbError);
      return NextResponse.json({ status: false, message: "Database sync failed.", error: dbError.message }, { status: 500 });
    }

    // Bust the dashboard cache
    revalidatePath("/admin/dashboard");

    return NextResponse.json({
      status: true,
      message: `Successfully synced ${dbTransactions.length} transactions with Paystack.`,
      syncedCount: dbTransactions.length,
    });
  } catch (error) {
    console.error("Historical sync error:", error);
    return NextResponse.json({ status: false, message: "Internal server error during sync." }, { status: 500 });
  }
}
