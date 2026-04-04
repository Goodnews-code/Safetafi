import { HERO_IMAGE } from "@/lib/constants";

interface HeroProps {
  onPayNowClick?: () => void;
}

export default function HeroSection({ onPayNowClick }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0B0E14] pt-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 hero-gradient z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt="Nigerian Logistics Port"
          className="w-full h-full object-cover animate-float opacity-55"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-36">
        <div className="max-w-4xl">

          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-widest mb-10 border border-white/20 animate-fade-in-up"
            style={{ animationDelay: "0s" }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E7B036] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E7B036]" />
            </span>
            NIGERIA&apos;S PREMIER LOGISTICS NETWORK
          </div>

          {/* Headline */}
          <h1
            className="text-6xl lg:text-8xl font-black text-white leading-[1.0] mb-8 tracking-tight animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Moving Nigeria{" "}
            <br />
            <span className="text-[#0047BB]">Reliably</span> &amp;{" "}
            <span className="text-[#E7B036]">Safely</span>
          </h1>

          {/* Subtext */}
          <p
            className="text-xl md:text-2xl text-slate-300 mb-14 leading-relaxed max-w-2xl font-light animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            From Lagos to Kano, we bridge the gap between businesses and markets
            with end-to-end transport solutions designed for the modern economy.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-5 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <button
              onClick={onPayNowClick}
              className="group bg-[#0047BB] text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-[#001B44] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95"
            >
              <span>Secure Payment</span>
              <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">
                payments
              </span>
            </button>
            <a
              href="#services"
              className="bg-white/8 backdrop-blur-xl text-white border border-white/30 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/15 transition-all text-center flex items-center justify-center gap-3"
            >
              Explore Fleet
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>

          {/* Stats strip */}
          <div
            className="flex gap-10 mt-20 pt-10 border-t border-white/10 animate-fade-in-up"
            style={{ animationDelay: "0.8s" }}
          >
            <div>
              <div className="text-3xl font-black text-white">
                100<span className="text-[#E7B036]">%</span>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Secure Handover
              </div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="text-3xl font-black text-white">36+</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                States Covered
              </div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="text-3xl font-black text-white">24/7</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Live Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-20" />
    </section>
  );
}
