"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030301] text-white pt-28 pb-12 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Main Footer Content: Centered Profile */}
        <div className="w-full flex justify-center border-b border-white/5 pb-12 mb-4 text-center">

          <div className="max-w-3xl flex flex-col items-center">
            <a href="#" className="inline-block group mb-10 transition-transform duration-500 hover:scale-105 active:scale-95">
              <div className="relative">
                {/* Subtle Brand Glow */}
                <div className="absolute -inset-4 bg-[#F27308]/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <img 
                   src="/logo.svg" 
                   alt="Safetafi" 
                   className="h-16 w-auto brightness-0 invert opacity-80 group-hover:opacity-100 transition-all drop-shadow-[0_8px_20px_rgba(242,115,8,0.15)]" 
                />
              </div>
            </a>
            <p className="text-slate-400 text-xl md:text-2xl leading-relaxed font-light mb-12 text-justify">
              Redefining the movement of people and goods through transparency, 
              technology, and trust. Safetafi empowers businesses to reach further 
              and individuals to travel safer, faster, and more affordably. 
              We are your comprehensive Transport and Logistics Network.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-10 border-t border-white/5 pt-14 text-center md:text-left">
          
          <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
             <p className="text-slate-500 text-sm font-black tracking-[0.25em] uppercase">
               © {currentYear} SAFETAFI Transport &amp; Logistics Network
             </p>
             <p className="text-[#F27308] text-xs font-black uppercase tracking-[0.4em]">
               HQ: Ile-Ife, Nigeria • Verified Operations
             </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 px-8 py-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
            <a href="mailto:safetafilogistics@gmail.com" className="flex items-center gap-3 group">
               <span className="material-symbols-outlined text-sm text-[#F27308] group-hover:scale-110 transition-transform">mail</span>
               <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest transition-colors">safetafilogistics@gmail.com</span>
            </a>
            <span className="h-4 w-px bg-white/10 hidden md:block" />
            <a href="tel:+2347070855579" className="flex items-center gap-3 group">
               <span className="material-symbols-outlined text-sm text-green-500 group-hover:scale-110 transition-transform">call</span>
               <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest transition-colors">+234 707 085 5579</span>
            </a>
            <span className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                Operational
              </span>
            </div>
            <span className="h-4 w-px bg-white/10" />
            <a href="/admin" className="group flex items-center gap-2 px-4 py-2 bg-[#100287]/20 rounded-full border border-[#100287]/30 hover:bg-[#100287] transition-all">
              <span className="material-symbols-outlined text-xs text-[#100287] group-hover:text-white transition-colors">vpn_key</span>
              <span className="text-[9px] font-black text-slate-300 group-hover:text-white uppercase tracking-widest">Admin</span>
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
