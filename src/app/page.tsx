"use client";

import dynamic from "next/dynamic";
import Footer from "@/components/Footer";

const CheckoutPortal = dynamic(() => import("@/components/CheckoutPortal"), { 
  ssr: false,
  loading: () => <div className="w-full max-w-xl h-[600px] bg-white/50 animate-pulse rounded-[3rem] mx-auto" />
});

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] relative overflow-hidden flex flex-col font-sans">
      
      {/* Dynamic Glass Background Shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#100287] opacity-[0.05] rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F27308] opacity-[0.05] rounded-full blur-[100px] animate-pulse duration-[5s]" />

      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 opacity-[0.03] pattern-grid-lg pointer-events-none" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 py-20 lg:py-32">
        
        {/* Left Edge Watermark */}
        <div className="hidden lg:block fixed -left-32 top-1/2 -translate-y-1/2 opacity-[0.012] pointer-events-none select-none z-0 transform -rotate-90 origin-center leading-none">
           <h2 className="text-[20rem] font-black tracking-tighter text-slate-900 leading-none uppercase italic border-none">
             SAFETAFI
           </h2>
        </div>

        {/* Right Edge Watermark */}
        <div className="hidden lg:block fixed -right-32 top-1/2 -translate-y-1/2 opacity-[0.012] pointer-events-none select-none z-0 transform rotate-90 origin-center leading-none">
           <h2 className="text-[20rem] font-black tracking-tighter text-slate-900 leading-none uppercase italic border-none">
             SAFETAFI
           </h2>
        </div>

        {/* Branding */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
           <div className="flex items-center justify-center mb-12">
              <div className="relative group p-6 transition-all duration-700 hover:scale-110 active:scale-95">
                 <img 
                   src="/logo.svg" 
                   alt="Safetafi" 
                   className="h-20 md:h-24 w-auto relative z-10" 
                 />
              </div>
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-[0.9] max-w-4xl mx-auto uppercase">
             Transport and <span className="text-[#100287]">Logistics Network</span>
           </h1>
           <p className="text-2xl text-[#F27308] font-black max-w-lg mx-auto tracking-widest uppercase opacity-90 mt-2">
             Safety, Comfort and Affordability
           </p>
        </div>

        {/* The Payment Portal Checkout Card */}
        <CheckoutPortal />

        {/* Security badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           {['Paystack Licensed', '256-bit SSL', 'Central Bank Verified', 'NDPR Compliant'].map((badge) => (
             <div key={badge} className="flex items-center gap-2 group cursor-default">
               <span className="material-symbols-outlined text-lg text-slate-900 group-hover:text-[#100287] transition-colors">verified_user</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{badge}</span>
             </div>
           ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
