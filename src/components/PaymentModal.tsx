"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePaystackPayment } from "react-paystack";
import { HERO_IMAGE } from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PaymentDetails {
  name: string;
  email: string;
  phone: string;
  service: string;
  amount: number;
  description: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Service Pricing ─────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  {
    id: "haulage_small",
    label: "Road Haulage — Small Load (< 1 Tonne)",
    amount: 35000,
    icon: "local_shipping",
  },
  {
    id: "haulage_large",
    label: "Road Haulage — Large Load (1+ Tonnes)",
    amount: 80000,
    icon: "local_shipping",
  },
  {
    id: "vehicle_hire_day",
    label: "Vehicle Hire — Daily Rate",
    amount: 25000,
    icon: "directions_car",
  },
  {
    id: "vehicle_hire_week",
    label: "Vehicle Hire — Weekly Rate",
    amount: 120000,
    icon: "directions_car",
  },
  {
    id: "supply_chain",
    label: "Supply Chain Sourcing",
    amount: 50000,
    icon: "inventory_2",
  },
];

// ─── Amount Display ───────────────────────────────────────────────────────────

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Steps ────────────────────────────────────────────────────────────────────

type Step = "form" | "confirm" | "success" | "failed";

// ─── Inner checkout (needs hooks at top level) ────────────────────────────────

function PaystackCheckout({
  details,
  onSuccess,
  onFailed,
  onBack,
}: {
  details: PaymentDetails;
  onSuccess: (ref: string, data: unknown) => void;
  onFailed: () => void;
  onBack: () => void;
}) {
  const [verifying, setVerifying] = useState(false);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  const config = {
    reference: `SFTF_${Date.now()}`,
    email: details.email,
    amount: details.amount * 100, // Paystack uses kobo
    currency: "NGN",
    publicKey,
    metadata: {
      custom_fields: [
        { display_name: "Customer Name", variable_name: "name", value: details.name },
        { display_name: "Phone", variable_name: "phone", value: details.phone },
        { display_name: "Service", variable_name: "service", value: details.service },
        { display_name: "Description", variable_name: "description", value: details.description },
      ],
    },
  };

  const onPaystackSuccess = useCallback(
    async (response: { reference: string }) => {
      setVerifying(true);
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference }),
        });
        const data = await res.json();
        if (data.status) {
          onSuccess(response.reference, data.data);
        } else {
          onFailed();
        }
      } catch {
        onFailed();
      } finally {
        setVerifying(false);
      }
    },
    [onSuccess, onFailed]
  );

  const initializePayment = usePaystackPayment(config);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-[#F4F7FA] rounded-2xl p-6 border border-slate-200">
        <h4 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-widest">
          Order Summary
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Name</span>
            <span className="font-bold text-slate-900">{details.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-bold text-slate-900">{details.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Service</span>
            <span className="font-bold text-slate-900">{details.service}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between">
            <span className="font-black text-slate-900">Total</span>
            <span className="font-black text-[#0047BB] text-lg">
              {formatNaira(details.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment icons */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-green-600 text-xl">shield</span>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your payment is secured by <strong>Paystack</strong> — Nigeria&apos;s
          most trusted payment infrastructure. We never store your card details.
        </p>
      </div>

      {/* Paystack payment methods logos */}
      <div className="flex flex-wrap gap-2 items-center">
        {["Visa", "MasterCard", "Verve", "Bank Transfer", "USSD"].map((m) => (
          <span
            key={m}
            className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg"
          >
            {m}
          </span>
        ))}
      </div>

      {verifying ? (
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-6 h-6 border-2 border-[#0047BB] border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 font-medium">Verifying payment…</span>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              // Fallback to dummy demo mode if Paystack is not configured
              if (!publicKey || publicKey.includes("your_paystack_public_key")) {
                setVerifying(true);
                setTimeout(() => {
                  setVerifying(false);
                  onSuccess(`DEMO_REF_${Math.floor(Math.random() * 10000000)}`, { dummy: true });
                }, 1500);
                return;
              }
              
              initializePayment({
                onSuccess: onPaystackSuccess,
                onClose: () => {},
              });
            }}
            className="flex-[2] bg-[#0047BB] text-white py-4 rounded-2xl font-black hover:bg-[#001B44] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">lock</span>
            Pay {formatNaira(details.amount)} Securely
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [successRef, setSuccessRef] = useState("");
  const [details, setDetails] = useState<PaymentDetails>({
    name: "",
    email: "",
    phone: "",
    service: SERVICE_OPTIONS[0].label,
    amount: SERVICE_OPTIONS[0].amount,
    description: "",
  });

  // No body scroll lock — the portal overlay handles its own scroll

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedService = SERVICE_OPTIONS.find((s) => s.label === details.service);

  const handleServiceChange = (label: string) => {
    const svc = SERVICE_OPTIONS.find((s) => s.label === label);
    setDetails((d) => ({
      ...d,
      service: label,
      amount: svc?.amount || 0,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.name || !details.email || !details.amount) return;
    setStep("confirm");
  };

  const handleSuccess = (ref: string) => {
    setSuccessRef(ref);
    setStep("success");
  };

  const handleClose = () => {
    onClose();
    // Reset after a brief delay
    setTimeout(() => {
      setStep("form");
      setSuccessRef("");
      setDetails({
        name: "",
        email: "",
        phone: "",
        service: SERVICE_OPTIONS[0].label,
        amount: SERVICE_OPTIONS[0].amount,
        description: "",
      });
    }, 400);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Layer 1: Animated wallpaper + blur backdrop — clicks here close modal */}
      <div
        style={{
          position: "fixed", inset: 0,
          zIndex: 2147483646,
          overflow: "hidden",
        }}
        onClick={handleClose}
      >
        {/* Floating hero image wallpaper */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            opacity: 0.35,
            animation: "float 3s ease-in-out infinite",
          }}
        />
        {/* Dark gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(11,14,20,0.88) 0%, rgba(16,2,135,0.50) 100%)",
        }} />
        {/* Frosted blur layer */}
        <div style={{
          position: "absolute", inset: 0,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }} />
      </div>

      {/* Layer 2: Scrollable overlay (transparent) on top of blur */}
      <div
        style={{
          position: "fixed", inset: 0,
          zIndex: 2147483647,
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
          padding: "3rem 1rem",
        }}
        onClick={handleClose}
      >
        <div
          style={{
            position: "relative",
            backgroundColor: "#fff",
            borderRadius: "2rem",
            width: "90%",
            maxWidth: "680px",
            alignSelf: "flex-start",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-8 py-6 flex items-center justify-between rounded-t-[2rem]">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {step === "form" && "Book a Service"}
              {step === "confirm" && "Confirm Payment"}
              {step === "success" && "Payment Successful!"}
              {step === "failed" && "Payment Failed"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {step === "form" && "Fill in your details below"}
              {step === "confirm" && "Review and complete your payment"}
              {step === "success" && "Your booking is confirmed"}
              {step === "failed" && "Something went wrong"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-8">

          {/* ── Step 1: Form ── */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={details.name}
                  onChange={(e) => setDetails({ ...details, name: e.target.value })}
                  placeholder="Azeez Kazeem"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-100 focus:border-[#0047BB] outline-none transition-all placeholder:text-slate-300 font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={details.email}
                  onChange={(e) => setDetails({ ...details, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-100 focus:border-[#0047BB] outline-none transition-all placeholder:text-slate-300 font-medium"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-100 focus:border-[#0047BB] outline-none transition-all placeholder:text-slate-300 font-medium"
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Select Service *
                </label>
                <div className="space-y-2">
                  {SERVICE_OPTIONS.map((svc) => (
                    <label
                      key={svc.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        details.service === svc.label
                          ? "border-[#0047BB] bg-blue-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="service"
                          className="hidden"
                          checked={details.service === svc.label}
                          onChange={() => handleServiceChange(svc.label)}
                        />
                        <span
                          className={`material-symbols-outlined text-xl ${
                            details.service === svc.label ? "text-[#0047BB]" : "text-slate-400"
                          }`}
                        >
                          {svc.icon}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            details.service === svc.label ? "text-[#0047BB]" : "text-slate-700"
                          }`}
                        >
                          {svc.label}
                        </span>
                      </div>
                      {svc.amount > 0 && (
                        <span
                          className={`text-sm font-black ${
                            details.service === svc.label ? "text-[#0047BB]" : "text-slate-500"
                          }`}
                        >
                          {formatNaira(svc.amount)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>



              {/* Description */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={details.description}
                  onChange={(e) => setDetails({ ...details, description: e.target.value })}
                  placeholder="Route details, special requirements…"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-100 focus:border-[#0047BB] outline-none transition-all placeholder:text-slate-300 font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0047BB] text-white py-5 rounded-2xl font-black hover:bg-[#001B44] transition-all shadow-xl shadow-blue-600/20 text-lg flex items-center justify-center gap-2"
              >
                Continue to Payment
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
          )}

          {/* ── Step 2: Confirm + Paystack ── */}
          {step === "confirm" && (
            <PaystackCheckout
              details={details}
              onSuccess={handleSuccess}
              onFailed={() => setStep("failed")}
              onBack={() => setStep("form")}
            />
          )}

          {/* ── Step 3: Success ── */}
          {step === "success" && (
            <div className="text-center py-8 space-y-6">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-5xl text-green-600">
                  check_circle
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  Payment Confirmed!
                </h3>
                <p className="text-slate-500">
                  Thank you, <strong>{details.name}</strong>. A confirmation has
                  been sent to <strong>{details.email}</strong>.
                </p>
              </div>
              <div className="bg-[#F4F7FA] rounded-2xl p-5 text-left">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Payment Reference
                </p>
                <p className="font-mono font-bold text-slate-900 text-sm break-all">
                  {successRef}
                </p>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Our team will contact you within <strong>2 hours</strong> to
                coordinate your service. For urgent requests, call{" "}
                <a
                  href="tel:+2349058050350"
                  className="text-[#0047BB] font-bold"
                >
                  +234 905 805 0350
                </a>
                .
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-[#0047BB] text-white py-4 rounded-2xl font-black hover:bg-[#001B44] transition-all"
              >
                Close
              </button>
            </div>
          )}

          {/* ── Step 4: Failed ── */}
          {step === "failed" && (
            <div className="text-center py-8 space-y-6">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-5xl text-red-500">
                  cancel
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  Payment Failed
                </h3>
                <p className="text-slate-500">
                  We couldn&apos;t verify your payment. Please try again or
                  contact us directly.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("confirm")}
                  className="flex-1 bg-[#0047BB] text-white py-4 rounded-2xl font-black hover:bg-[#001B44] transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
