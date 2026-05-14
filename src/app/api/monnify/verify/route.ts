import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { verifyMonnifyTransaction } from "@/lib/monnify";

export async function POST(req: NextRequest) {
    try {
        const { reference } = await req.json();

        if (!reference) {
            return NextResponse.json(
                { status: false, message: "Transaction reference is required." },
                { status: 400 }
            );
        }

        // Verify with Monnify
        const monnifyData = await verifyMonnifyTransaction(reference);

        if (!monnifyData || monnifyData.responseBody.paymentStatus !== "PAID") {
            return NextResponse.json(
                {
                    status: false,
                    message: monnifyData?.responseMessage || "Payment verification failed or status is not PAID.",
                    data: monnifyData?.responseBody,
                },
                { status: 400 }
            );
        }

        const transaction = monnifyData.responseBody;
        const metadata = transaction.metaData || {};

        const dbTransaction = {
            reference: transaction.transactionReference,
            amount: transaction.amountPaid, // Monnify returns amount in Naira (not kobo)
            currency: "NGN",
            email: transaction.customerEmail,
            phone: metadata.phone || "",
            customer_name: transaction.customerName,
            service: metadata.service || "",
            destination: metadata.destination || "",
            date: metadata.date || "",
            description: metadata.description || "",
            status: transaction.paymentStatus,
            paid_at: transaction.paymentDate,
        };

        // 2. Insert into Supabase (if not already there via webhook)
        const supabase = getSupabase();

        const { data: existing } = await supabase
            .from("transactions")
            .select("reference")
            .eq("reference", transaction.transactionReference)
            .maybeSingle();

        if (existing) {
            console.log(`Transaction ${transaction.transactionReference} already via Webhook. Redirecting to success.`);
            revalidatePath("/admin/dashboard");
            return NextResponse.json({
                status: true,
                message: "Payment already verified and recorded.",
                data: { reference: transaction.transactionReference },
            });
        }

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

        // Bust the dashboard cache
        revalidatePath("/admin/dashboard");

        return NextResponse.json({
            status: true,
            message: "Payment verified and recorded successfully.",
            data: {
                reference: transaction.transactionReference,
                amount: transaction.amountPaid,
                email: transaction.customerEmail,
                paidAt: transaction.paymentDate,
                metadata: transaction.metaData,
            },
        });
    } catch (error) {
        console.error("Monnify verify error:", error);
        return NextResponse.json(
            { status: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
