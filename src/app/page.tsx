import type { Metadata } from "next";
import { HERO_IMAGE } from "@/lib/constants";

import Footer from "@/components/Footer";
import DynamicCheckoutPortal from "@/components/DynamicCheckoutPortal";

export const metadata: Metadata = {
  title: "Book Your Trip | Safetafi Express",
  description: "Secure your seat on the next Safetafi trip. Select your meeting point and pay safely online.",
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0B0E14] overflow-x-hidden flex flex-col font-sans">

      {/* ── Animated Wallpaper Background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(135deg, rgba(11,14,20,0.92) 0%, rgba(16,2,135,0.50) 100%)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover animate-float opacity-40"
        />
        {/* Glow orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#100287] opacity-20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E7B036] opacity-10 rounded-full blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 relative z-10 py-12 lg:py-20 gap-8">
        
        {/* Branding */}
        <div className="text-center mb-8 animate-in fade-in duration-300">
           <div className="flex items-center justify-center mb-6">
              <div className="relative group p-6 transition-all duration-700 hover:scale-110 active:scale-95">
                 <img 
                   src="/logo.svg" 
                   alt="Safetafi" 
                   className="h-20 md:h-24 w-auto relative z-10" 
                   fetchPriority="high"
                 />
              </div>
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 leading-[0.9] max-w-4xl mx-auto uppercase">
             Transport and <span className="text-[#E7B036]">Logistics Network</span>
           </h1>
           <p className="text-2xl text-[#E7B036] font-black max-w-lg mx-auto tracking-widest uppercase opacity-90 mt-2">
             Safety, Comfort and Affordability
           </p>
        </div>

        {/* The Payment Portal Checkout Card */}
        <DynamicCheckoutPortal />

        {/* Security badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           {['Paystack Licensed', '256-bit SSL', 'Central Bank Verified', 'NDPR Compliant'].map((badge) => (
             <div key={badge} className="flex items-center gap-2 group cursor-default">
               <span className="material-symbols-outlined text-lg text-white group-hover:text-[#E7B036] transition-colors">verified_user</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">{badge}</span>
             </div>
           ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
