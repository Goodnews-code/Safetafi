import { NextRequest, NextResponse } from "next/server";
import { crypto } from "next/dist/compiled/@edge-runtime/primitives"; // Or just use standard crypto if available
import { getSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Since next/dist/compiled/crypto might not be reliable in all environments, 
// and standard node crypto is better for this.
import crypto_node from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Get raw body for verification
    const rawBody = await req.text();
    const hash = crypto_node
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    const signature = req.headers.get("x-paystack-signature");

    if (hash !== signature) {
      console.error("Invalid Paystack signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;
    const transaction = body.data;

    console.log(`Paystack Webhook Received: ${event} for Ref: ${transaction?.reference}`);

    if (event === "charge.success") {
      const reference = transaction.reference;
      const supabase = getSupabase();

      // IMPORTANT: Check if reference is already recorded to avoid double entries
      // if the user ALSO clicked "I've sent money" and triggerred the verify route.
      const { data: existing, error: checkError } = await supabase
        .from("transactions")
        .select("reference")
        .eq("reference", reference)
        .maybeSingle();

      if (checkError) {
         console.error("Database check error in Webhook:", checkError);
      }

      if (existing) {
        console.log(`Transaction ${reference} already recorded. Skipping.`);
        return NextResponse.json({ status: "success", message: "Duplicate record ignored" });
      }

      // Map metadata fields consistently with the verify route
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
        destination: getMetaValue("destination"),
        date: getMetaValue("date"),
        description: getMetaValue("description"),
        status: transaction.status,
        paid_at: transaction.paid_at,
      };

      const { error: dbError } = await supabase
        .from("transactions")
        .insert([dbTransaction]);

      if (dbError) {
        console.error("Supabase insert error in Webhook:", dbError);
        return NextResponse.json({ status: "error", message: "Database insert failed" }, { status: 500 });
      }

      // Bust the dashboard cache so the admin dashboard shows fresh data
      revalidatePath("/admin/dashboard");
      console.log(`[Webhook SUCCESS] Recorded transaction ${reference} to Ledger.`);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ status: "error", message: "Processing failed" }, { status: 500 });
  }
}

// Paystack sends webhooks as POST requests.
// We must return a 200 OK as soon as possible.
