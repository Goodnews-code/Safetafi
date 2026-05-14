import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
    try {
        // 1. Get raw body for signature verification
        const rawBody = await req.text();
        const signature = req.headers.get("monnify-signature");
        const secretKey = process.env.MONNIFY_SECRET_KEY;

        if (!secretKey) {
            console.error("MONNIFY_SECRET_KEY missing");
            return new Response("Server configuration error", { status: 500 });
        }

        // 2. Verify HMAC SHA512 signature
        const hash = crypto
            .createHmac("sha512", secretKey)
            .update(rawBody)
            .digest("hex");

        if (hash !== signature) {
            console.error("Invalid Monnify signature");
            return new Response("Invalid signature", { status: 401 });
        }

        const body = JSON.parse(rawBody);
        const eventType = body.eventType;
        const transaction = body.eventData;

        console.log(`Monnify Webhook Received: ${eventType} for Ref: ${transaction?.transactionReference}`);

        // 3. Handle successful transaction
        if (eventType === "SUCCESSFUL_TRANSACTION") {
            const reference = transaction.transactionReference;
            const supabase = getSupabase();

            // Check for duplicate
            const { data: existing, error: checkError } = await supabase
                .from("transactions")
                .select("reference")
                .eq("reference", reference)
                .maybeSingle();

            if (checkError) {
                console.error("Database check error in Monnify Webhook:", checkError);
            }

            if (existing) {
                console.log(`Transaction ${reference} already recorded. Skipping.`);
                return NextResponse.json({ status: "success", message: "Duplicate record ignored" });
            }

            // Map metadata fields
            const metadata = transaction.metaData || {};

            const dbTransaction = {
                reference: transaction.transactionReference,
                amount: transaction.amountPaid,
                currency: transaction.currency || "NGN",
                email: transaction.customer?.email,
                phone: metadata.phone || "",
                customer_name: transaction.customer?.name,
                service: metadata.service || "",
                destination: metadata.destination || "",
                date: metadata.date || "",
                description: metadata.description || "",
                status: transaction.paymentStatus || "PAID",
                paid_at: transaction.completedOn, // Monnify uses completedOn for webhooks
            };

            const { error: dbError } = await supabase
                .from("transactions")
                .insert([dbTransaction]);

            if (dbError) {
                console.error("Supabase insert error in Monnify Webhook:", dbError);
                return NextResponse.json({ status: "error", message: "Database insert failed" }, { status: 500 });
            }

            // Bust the dashboard cache
            revalidatePath("/admin/dashboard");
            console.log(`[Monnify Webhook SUCCESS] Recorded transaction ${reference} to Ledger.`);
        }

        return NextResponse.json({ status: "success" });
    } catch (error) {
        console.error("Monnify Webhook processing error:", error);
        return NextResponse.json({ status: "error", message: "Processing failed" }, { status: 500 });
    }
}
