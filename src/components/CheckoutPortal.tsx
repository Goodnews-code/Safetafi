"use client";

import { useState, useEffect, useRef } from "react";
import { usePaystackPayment } from "react-paystack";

declare global {
  interface Window {
    MonnifySDK: any;
  }
}

// ─── Service Pricing ─────────────────────────────────────────────────────────

interface ServiceOption {
  id: string;
  label: string;
  amount: number;
  icon: string;
}

const DEFAULT_SERVICE_OPTIONS: ServiceOption[] = [
  { id: "berger", label: "Berger", amount: 11000, icon: "location_on" },
  { id: "oshodi", label: "Oshodi", amount: 12000, icon: "location_on" },
  { id: "iyanapaja", label: "Iyanapaja", amount: 12500, icon: "location_on" },
  { id: "abeokuta", label: "Abeokuta", amount: 12000, icon: "location_on" },
  { id: "ibadan", label: "Ibadan", amount: 5000, icon: "location_on" },
  { id: "ikorodu", label: "Ikorodu", amount: 12500, icon: "location_on" },
];

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CheckoutPortal() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<"form" | "paused" | "confirm" | "success" | "failed">("form");
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successRef, setSuccessRef] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>(DEFAULT_SERVICE_OPTIONS);

  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    service: DEFAULT_SERVICE_OPTIONS[0].label,
    amount: DEFAULT_SERVICE_OPTIONS[0].amount,
    date: "",
    description: "",
    destination: "Campus Gate",
  });

  // Fetch live trip settings on mount
  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((data) => {
        setDetails((prev) => ({ 
          ...prev, 
          date: data.trip_date ?? prev.date,
          // If we haven't selected a service yet, update to the first live one
          service: prev.service || (data.service_pricing?.[0]?.label ?? prev.service),
          amount: prev.amount || (data.service_pricing?.[0]?.amount ?? prev.amount)
        }));
        setPaymentsEnabled(data.payments_enabled ?? false);
        if (data.service_pricing) {
          setServiceOptions(data.service_pricing);
        }
      })
      .catch(() => {
        // Keep defaults if API fails
        setDetails((prev) => ({ ...prev, date: "Tuesday, 7th of April, 2026" }));
      })
      .finally(() => setSettingsLoading(false));

    // Load Monnify SDK if needed
    const gateway = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "paystack";
    if (gateway === "monnify" || gateway === "both") {
      const script = document.createElement("script");
      script.src = "https://sdk.monnify.com/plugin/monnify.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      }
    }
  }, []);

  // Scroll to top of portal when step changes to 'paused'
  useEffect(() => {
    if (step === 'paused' && portalRef.current) {
      portalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  const selectedService = serviceOptions.find((s) => s.label === details.service);

  // Paystack Config
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
  const config: any = {
    reference: `SFTF_${Date.now()}`,
    email: details.email,
    amount: (details.amount || 0) * 100,
    currency: "NGN",
    publicKey,
    // Including these outside metadata makes them appear in the Paystack Customer profile
    firstname: details.name,
    phone: details.phone,
    metadata: {
      custom_fields: [
        { display_name: "Customer Name", variable_name: "name", value: details.name },
        { display_name: "Phone", variable_name: "phone", value: details.phone },
        { display_name: "Scheduled Date", variable_name: "date", value: details.date },
        { display_name: "Meeting Point", variable_name: "service", value: details.service },
        { display_name: "Destination", variable_name: "destination", value: details.destination },
        { display_name: "Additional Info", variable_name: "description", value: details.description },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const handleVerify = async (ref: string, gateway: "paystack" | "monnify" = "paystack") => {
    setVerifying(true);
    setErrorMessage("");
    try {
      const endpoint = gateway === "monnify" ? "/api/monnify/verify" : "/api/paystack/verify";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref }),
      });
      const data = await res.json();
      if (data.status) {
        setSuccessRef(ref);
        setStep("success");
      } else {
        setErrorMessage(data.message || data.error || "Payment verified but database sync failed.");
        setStep("failed");
      }
    } catch {
      setErrorMessage("Network error during verification.");
      setStep("failed");
    } finally {
      setVerifying(false);
    }
  };

  const handlePaystackPay = () => {
    initializePayment({
      onSuccess: (response: any) => handleVerify(response.reference, "paystack"),
      onClose: () => { },
    });
  };

  const handleMonnifyPay = () => {
    if (!window.MonnifySDK) {
      setErrorMessage("Monnify SDK not loaded. Please refresh the page.");
      setStep("failed");
      return;
    }

    window.MonnifySDK.initialize({
      amount: details.amount,
      currency: "NGN",
      reference: `SFTF_MON_${Date.now()}`,
      customerFullName: details.name,
      customerEmail: details.email,
      apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY,
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE,
      paymentDescription: `Booking for ${details.service} - ${details.date}`,
      metadata: {
        name: details.name,
        phone: details.phone,
        service: details.service,
        destination: details.destination,
        date: details.date,
        description: details.description,
      },
      onComplete: function (response: any) {
        if (response.status === "SUCCESS") {
          handleVerify(response.transactionReference, "monnify");
        } else {
          setErrorMessage(response.message || "Monnify payment failed.");
          setStep("failed");
        }
      },
      onClose: function (data: any) {
        // Modal closed
      }
    });
  };

  const selectedGateway = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "paystack";

  const handlePay = () => {
    if (selectedGateway === "monnify") {
      handleMonnifyPay();
    } else {
      handlePaystackPay();
    }
  };

  return (
    <div ref={portalRef} className="w-full max-w-xl mx-auto scroll-mt-24">
      <div className="bg-white/90 backdrop-blur-3xl rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden relative group">

        <div className="absolute top-0 inset-x-0 h-1.5 flex gap-1 px-1 py-1">
          <div className={`h-full rounded-full transition-all duration-700 ${step === 'form' ? 'w-1/4 bg-[#100287]' :
              step === 'paused' ? 'w-2/4 bg-amber-400' :
                step === 'confirm' ? 'w-3/4 bg-[#100287]' :
                  step === 'success' ? 'w-full bg-green-500' : 'w-full bg-red-500'}`} />
        </div>

        <div className={`p-8 md:p-10 ${step === 'paused' ? 'pt-2 pb-2' : 'pt-10 md:pt-12'}`}>

          <div className={`${step === 'paused' ? 'mb-2' : 'mb-8'} text-center`}>
            <img src="/logo.svg" alt="Safetafi" className="h-10 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {step === 'form' && "Book Your Express Service"}
              {step === 'paused' && "We\'ll Be Right Back"}
              {step === 'confirm' && "Review & Pay"}
              {step === 'success' && "Transaction Complete"}
              {step === 'failed' && "Payment Error"}
            </h2>
          </div>

          {step === 'form' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(paymentsEnabled ? 'confirm' : 'paused'); }} className="space-y-6">

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter Full Name"
                    value={details.name}
                    onChange={(e) => setDetails({ ...details, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="+234..."
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="Email for receipt"
                    value={details.email}
                    onChange={(e) => setDetails({ ...details, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Schedule Date</label>
                  <div className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold text-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#E7B036] text-sm">calendar_today</span>
                    {settingsLoading ? (
                      <span className="text-slate-300 animate-pulse text-sm">Loading...</span>
                    ) : (
                      <span>{details.date}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Destination *</label>
                  <select
                    required
                    value={details.destination}
                    onChange={(e) => setDetails({ ...details, destination: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 cursor-pointer appearance-none"
                  >
                    <option value="Campus Gate">Campus Gate</option>
                    <option value="Hostels on Campus">Hostels on Campus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Meeting Point</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {serviceOptions.map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setDetails({ ...details, service: svc.label, amount: svc.amount })}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${details.service === svc.label ? 'border-[#100287] bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-sm ${details.service === svc.label ? 'text-[#100287]' : 'text-[#E7B036]'}`}>{svc.icon}</span>
                        <span className={`text-[11px] font-black uppercase tracking-tight ${details.service === svc.label ? 'text-[#100287]' : 'text-slate-600'}`}>{svc.label}</span>
                      </div>
                      {svc.amount > 0 && <span className="text-[10px] font-black text-slate-400">{formatNaira(svc.amount)}</span>}
                    </button>
                  ))}
                </div>
              </div>



              <button type="submit" className="w-full bg-[#100287] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#030301] transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-3 group">
                Review Booking
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </form>
          )}

          {step === 'paused' && (
            <div className="space-y-9 animate-in fade-in zoom-in duration-500">
              {/* Pulsing icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-3xl text-amber-500">calendar_clock</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <span className="material-symbols-outlined text-white text-[10px]">priority_high</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="text-center space-y-3">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.25em]">Notice</p>
                <h3 className="text-xl font-black text-slate-900 leading-snug mb-[5px]">
                  We&apos;ll Be Right Back
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed px-2">
                  We&apos;re sorry &mdash; we are not accepting payments for the
                  <strong className="text-slate-700"> {details.date}</strong> trip at this time.
                  Please check back for the <strong className="text-slate-700">next available trip</strong>.
                </p>
              </div>

              {/* Info card */}
              <div className="bg-amber-50 border border-amber-100 rounded-3xl px-7 py-5 flex items-start gap-4">
                <span className="material-symbols-outlined text-amber-400 mt-0.5 shrink-0">info</span>
                <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                  Booking slots open again once a new trip is announced.
                  Follow our WhatsApp channel or check this page again soon.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/2347070855579"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#1FB34F] text-white py-5 rounded-2xl font-black hover:bg-[#19B14B] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/10"
                >
                  <span className="material-symbols-outlined">chat</span>
                  WhatsApp Inquiries
                </a>
                <button
                  onClick={() => setStep('form')}
                  className="w-full border-2 border-slate-100 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                >
                  ← Go Back
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="bg-[#F4F7FA] rounded-3xl p-8 border border-slate-200 relative overflow-hidden">
                <div className="space-y-4 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-1 md:gap-0">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Client</span>
                    <span className="text-sm font-black text-slate-900 md:text-right w-full md:w-auto">{details.name}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-1 md:gap-0">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Meeting Point</span>
                    <span className="text-sm font-black text-slate-900 md:text-right w-full md:w-auto">{details.service}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-1 md:gap-0">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Destination</span>
                    <span className="text-sm font-black text-slate-900 md:text-right w-full md:w-auto">{details.destination}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-1 md:gap-0">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Scheduled</span>
                    <span className="text-sm font-black text-[#E7B036] md:text-right w-full md:w-auto">{details.date}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between pt-2 gap-1 md:gap-0">
                    <span className="text-lg font-black text-slate-900">Total Price</span>
                    <span className="text-2xl font-black text-[#100287] md:text-right w-full md:w-auto">{formatNaira(details.amount)}</span>
                  </div>
                </div>
              </div>

              {verifying ? (
                <div className="flex flex-col items-center justify-center gap-4 py-6">
                  <div className="w-10 h-10 border-4 border-[#100287] border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-600 font-black animate-pulse uppercase text-xs tracking-widest">Syncing Ledger...</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 border-2 border-slate-100 text-slate-500 py-5 rounded-2xl font-black hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                  >
                    Back
                  </button>
                  {!publicKey && selectedGateway === "paystack" ? (
                    <div className="flex-1 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col items-center gap-2 text-center animate-pulse">
                      <span className="material-symbols-outlined text-amber-600">settings_suggest</span>
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Configuration Error: PAYSTACK_PUBLIC_KEY Missing</p>
                    </div>
                  ) : !process.env.NEXT_PUBLIC_MONNIFY_API_KEY && selectedGateway === "monnify" ? (
                    <div className="flex-1 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col items-center gap-2 text-center animate-pulse">
                      <span className="material-symbols-outlined text-amber-600">settings_suggest</span>
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Configuration Error: MONNIFY_API_KEY Missing</p>
                    </div>
                  ) : (
                    <button
                      onClick={handlePay}
                      className="flex-[2] bg-[#100287] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#030301] transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3"
                    >
                      <span className="material-symbols-outlined">lock</span>
                      Pay Securely {selectedGateway === 'monnify' ? 'via Monnify' : 'via Paystack'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-8 animate-in slide-in-from-bottom duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <span className="material-symbols-outlined text-5xl text-green-500">check_circle</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Verified</h3>
                <p className="text-slate-500 mt-2 font-medium">Order confirmed for <strong>{details.date}</strong>.</p>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href="tel:+2347070855579"
                  className="w-full bg-[#0047BB] text-white py-5 rounded-2xl font-black hover:bg-[#001B44] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">call</span>
                  Support: +234 707 085 5579
                </a>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-slate-900/5 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {step === 'failed' && (
            <div className="text-center space-y-8 animate-in shake duration-500">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-5xl text-red-500">warning</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Verification Error</h3>
                <p className="text-red-500 text-sm font-bold mt-2 px-4 py-3 bg-red-50 rounded-xl border border-red-100 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('confirm')} className="flex-1 bg-[#100287] text-white py-5 rounded-2xl font-black">Retry</button>
                <button onClick={() => setStep('form')} className="flex-1 border-2 border-slate-100 text-slate-500 py-5 rounded-2xl font-black">Edit</button>
              </div>
            </div>
          )}

        </div>

        <div className="bg-slate-50/50 px-10 py-5 border-t border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Official Safetafi Logistics Terminal
          </p>
        </div>
      </div>
    </div>
  );
}
