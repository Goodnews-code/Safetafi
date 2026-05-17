import type { Metadata } from "next";
import LandingPageClient from "@/components/LandingPageClient";

export const metadata: Metadata = {
  title: "Book Your Trip | Safetafi Express",
  description: "Secure your seat on the next Safetafi trip. Select your meeting point and pay safely online.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] relative overflow-hidden flex flex-col font-sans">
      
      {/* Dynamic Glass Background Shapes - ANIMATED GLOBS */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#100287] opacity-[0.12] rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E7B036] opacity-[0.12] rounded-full blur-[120px] animate-pulse duration-[5s] pointer-events-none" />

      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 opacity-[0.03] pattern-grid-lg pointer-events-none" />

      {/* Trifecta Brand Watermarks */}
      {/* TOP CENTER */}
      <div className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 opacity-[0.05] pointer-events-none select-none z-0 whitespace-nowrap leading-none transition-opacity duration-1000">
        <h2 className="text-[14rem] font-black tracking-tighter text-slate-900 leading-none uppercase italic">
          SAFETAFI
        </h2>
      </div>

      {/* LEFT EDGE */}
      <div className="hidden md:block absolute -left-24 top-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none select-none z-0 transform -rotate-90 origin-center whitespace-nowrap leading-none transition-opacity duration-1000">
        <h2 className="text-[12rem] font-black tracking-tighter text-slate-900 leading-none uppercase italic">
          SAFETAFI
        </h2>
      </div>

      {/* RIGHT EDGE */}
      <div className="hidden md:block absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none select-none z-0 transform rotate-90 origin-center whitespace-nowrap leading-none transition-opacity duration-1000">
        <h2 className="text-[12rem] font-black tracking-tighter text-slate-900 leading-none uppercase italic">
          SAFETAFI
        </h2>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex-1">
        <LandingPageClient />
      </div>
    </div>
  );
}
