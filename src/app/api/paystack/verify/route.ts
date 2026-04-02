import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { status: false, message: "Payment reference is required." },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { status: false, message: "Server configuration error." },
        { status: 500 }
      );
    }

    // Verify with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await paystackRes.json();

    if (!data.status || data.data?.status !== "success") {
      return NextResponse.json(
        {
          status: false,
          message: data.message || "Payment verification failed.",
          data: data.data,
        },
        { status: 400 }
      );
    }

    // Payment is verified — now save to Supabase
    const transaction = data.data;

    // 1. Map metadata fields
    const metadataFields = transaction.metadata?.custom_fields || [];
    const getMetaValue = (key: string) => metadataFields.find((f: any) => f.variable_name === key)?.value || "";
    
    const dbTransaction = {
      reference: transaction.reference,
      amount: transaction.amount / 100, // Convert from kobo to Naira
      currency: transaction.currency,
      email: transaction.customer?.email,
      phone: getMetaValue("phone"),
      customer_name: getMetaValue("name"),
      service: getMetaValue("service"),
      date: getMetaValue("date"),
      description: getMetaValue("description"),
      status: transaction.status,
      paid_at: transaction.paid_at,
    };

    // 2. Insert into Supabase
    const supabase = getSupabase();
    const { error: dbError } = await supabase
      .from("transactions")
      .insert([dbTransaction]);

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { 
          status: false, 
          message: "Payment verified but failed to save to ledger. Please contact support.",
          error: dbError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "Payment verified and recorded successfully.",
      data: {
        reference: transaction.reference,
        amount: transaction.amount / 100,
        email: transaction.customer?.email,
        paidAt: transaction.paid_at,
        metadata: transaction.metadata,
      },
    });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
