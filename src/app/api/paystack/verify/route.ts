import { NextRequest, NextResponse } from "next/server";

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

    // Payment is verified
    const transaction = data.data;

    // ✅ Here you can:
    // 1. Save payment record to your database
    // 2. Send confirmation email via Nodemailer / Resend / EmailJS
    // 3. Trigger any post-payment business logic

    return NextResponse.json({
      status: true,
      message: "Payment verified successfully.",
      data: {
        reference: transaction.reference,
        amount: transaction.amount / 100, // Convert from kobo to Naira
        currency: transaction.currency,
        email: transaction.customer?.email,
        paidAt: transaction.paid_at,
        channel: transaction.channel,
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
