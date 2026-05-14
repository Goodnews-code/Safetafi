import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { searchMonnifyTransactions } from "@/lib/monnify";

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ status: false, message: "Server configuration error." }, { status: 500 });
    }

    // 1. Fetch from Paystack (Deep Sync)
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction?perPage=100`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = await paystackRes.json();
    const paystackTransactions = (paystackData.data || [])
      .filter((t: any) => t.status === "success")
      .map((transaction: any) => {
        const metadataFields = transaction.metadata?.custom_fields || [];
        const getMetaValue = (key: string) => metadataFields.find((f: any) => f.variable_name === key)?.value || "";

        return {
          reference: transaction.reference,
          amount: transaction.amount / 100,
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

    // 2. Fetch from Monnify (New Provider Sync)
    const monnifyRaw = await searchMonnifyTransactions(100);
    const monnifyTransactions = monnifyRaw
      .filter((t: any) => t.paymentStatus === "PAID")
      .map((t: any) => {
        const metadata = t.metaData || {};
        return {
          reference: t.transactionReference,
          amount: t.amountPaid,
          currency: "NGN",
          email: t.customerEmail,
          phone: metadata.phone || "",
          customer_name: t.customerName,
          service: metadata.service || "Logistics",
          destination: metadata.destination || "N/A",
          date: metadata.date || "",
          description: metadata.description || "",
          status: "success", // Map Monnify PAID to generic success status for ledger
          paid_at: t.paymentDate,
        };
      });

    // 3. Combine and Deduplicate
    const dbTransactions = [...paystackTransactions, ...monnifyTransactions];

    if (dbTransactions.length === 0) {
      return NextResponse.json({ status: true, message: "No new successful transactions to sync.", syncedCount: 0 });
    }

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
      message: `Successfully synced ${dbTransactions.length} transactions from Paystack & Monnify.`,
      syncedCount: dbTransactions.length,
    });
  } catch (error) {
    console.error("Historical sync error:", error);
    return NextResponse.json({ status: false, message: "Internal server error during sync." }, { status: 500 });
  }
}
