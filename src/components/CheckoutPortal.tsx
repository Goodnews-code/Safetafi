"use client";

import { useState } from "react";
import { usePaystackPayment } from "react-paystack";

// ─── Service Pricing ─────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  {
    id: "berger",
    label: "Berger",
    amount: 11000,
    icon: "location_on",
  },
  {
    id: "oshodi",
    label: "Oshodi",
    amount: 12000,
    icon: "location_on",
  },
  {
    id: "iyanapaja",
    label: "Iyanapaja",
    amount: 12500,
    icon: "location_on",
  },
  {
    id: "abeokuta",
    label: "Abeokuta",
    amount: 12000,
    icon: "location_on",
  },
  {
    id: "ibadan",
    label: "Ibadan",
    amount: 5000,
    icon: "location_on",
  },
  {
    id: "ikorodu",
    label: "Ikorodu",
    amount: 12500,
    icon: "location_on",
  },
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
  const [step, setStep] = useState<"form" | "confirm" | "success" | "failed">("form");
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successRef, setSuccessRef] = useState("");
  
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    service: SERVICE_OPTIONS[0].label,
    amount: SERVICE_OPTIONS[0].amount,
    date: "Tuesday, 7th of April, 2026",
    description: "",
    destination: "Campus Gate",
  });

  const selectedService = SERVICE_OPTIONS.find((s) => s.label === details.service);

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

  const handleVerify = async (ref: string) => {
    setVerifying(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/paystack/verify", {
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

  const handlePay = () => {
    initializePayment({
      onSuccess: (response: any) => handleVerify(response.reference),
      onClose: () => {},
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white/90 backdrop-blur-3xl rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden relative group">
        
        <div className="absolute top-0 inset-x-0 h-1.5 flex gap-1 px-1 py-1">
           <div className={`h-full rounded-full transition-all duration-700 ${
             step === 'form' ? 'w-1/4 bg-[#100287]' : 
             step === 'confirm' ? 'w-2/4 bg-[#100287]' : 
             step === 'success' ? 'w-full bg-green-500' : 'w-full bg-red-500'}`} />
        </div>

        <div className="p-10 pt-14">
          
          <div className="mb-10 text-center">
             <img src="/logo.svg" alt="Safetafi" className="h-10 mx-auto mb-4" />
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">
               {step === 'form' && "Book Your Express Service"}
               {step === 'confirm' && "Review & Pay"}
               {step === 'success' && "Transaction Complete"}
               {step === 'failed' && "Payment Error"}
             </h2>
          </div>

          {step === 'form' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('confirm'); }} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Enter Full Name"
                      value={details.name}
                      onChange={(e) => setDetails({...details, name: e.target.value})}
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
                      onChange={(e) => setDetails({...details, phone: e.target.value})}
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
                      onChange={(e) => setDetails({...details, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Schedule Date</label>
                    <select
                      value={details.date}
                      onChange={(e) => setDetails({...details, date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 cursor-pointer appearance-none"
                    >
                       <option value="Tuesday, 7th of April, 2026">Tuesday, 7th of April, 2026</option>
                    </select>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Destination *</label>
                    <select
                      required
                      value={details.destination}
                      onChange={(e) => setDetails({...details, destination: e.target.value})}
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
                  {SERVICE_OPTIONS.map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setDetails({...details, service: svc.label, amount: svc.amount})}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${details.service === svc.label ? 'border-[#100287] bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-3">
                         <span className={`material-symbols-outlined text-sm ${details.service === svc.label ? 'text-[#100287]' : 'text-slate-400'}`}>{svc.icon}</span>
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

          {step === 'confirm' && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
               <div className="bg-[#F4F7FA] rounded-3xl p-8 border border-slate-200 relative overflow-hidden">
                  <div className="space-y-4 relative z-10">
                     <div className="flex justify-between border-b border-slate-200 pb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Client</span>
                        <span className="text-sm font-black text-slate-900">{details.name}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-200 pb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Meeting Point</span>
                        <span className="text-sm font-black text-slate-900">{details.service}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-200 pb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Destination</span>
                        <span className="text-sm font-black text-slate-900">{details.destination}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-200 pb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Scheduled</span>
                        <span className="text-sm font-black text-[#E7B036]">{details.date}</span>
                     </div>
                     <div className="flex justify-between pt-2">
                        <span className="text-lg font-black text-slate-900">Total Price</span>
                        <span className="text-2xl font-black text-[#100287]">{formatNaira(details.amount)}</span>
                     </div>
                  </div>
               </div>

               {verifying ? (
                 <div className="flex flex-col items-center justify-center gap-4 py-6">
                    <div className="w-10 h-10 border-4 border-[#100287] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600 font-black animate-pulse uppercase text-xs tracking-widest">Syncing Ledger...</p>
                 </div>
               ) : (
                 <div className="flex gap-4">
                    <button 
                      onClick={() => setStep('form')}
                      className="flex-1 border-2 border-slate-100 text-slate-500 py-5 rounded-2xl font-black hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                    >
                      Back
                    </button>
                    {!publicKey ? (
                      <div className="flex-1 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col items-center gap-2 text-center animate-pulse">
                         <span className="material-symbols-outlined text-amber-600">settings_suggest</span>
                         <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Configuration Error: PAYSTACK_PUBLIC_KEY Missing on Netlify</p>
                      </div>
                    ) : (
                      <button 
                        onClick={handlePay}
                        className="flex-[2] bg-[#100287] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#030301] transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3"
                      >
                        <span className="material-symbols-outlined">lock</span>
                        Pay Securely
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
