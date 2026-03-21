import { ABOUT_IMAGE } from "@/lib/constants";

export default function AboutSection() {
  return (
    <section id="about" className="py-32 bg-[#F4F7FA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-24 items-center">

          {/* Text Block */}
          <div className="relative">
            <div className="absolute -z-10 -top-12 -left-12 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40" />
            <span className="text-[#0047BB] font-bold tracking-[0.3em] uppercase text-xs mb-6 block">
              Legacy of Excellence
            </span>
            <h2 className="text-5xl lg:text-6xl font-black mb-10 text-slate-900 leading-tight">
              Your Success Driven by Our Logistics
            </h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-light">
              <p>
                SAFETAFI isn&apos;t just a transport company; we are the engine
                of Nigerian enterprise. Registered and headquartered in the heart
                of commercial Nigeria, we provide the infrastructure businesses
                need to scale.
              </p>
              <blockquote className="border-l-4 border-[#FF8C00] pl-6 italic font-medium text-slate-800 text-xl">
                &ldquo;We don&apos;t just move boxes; we move the dreams and
                inventory that power a nation.&rdquo;
              </blockquote>
            </div>

            {/* Stat Cards */}
            <div className="flex flex-wrap gap-6 mt-14">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 flex-1 min-w-[180px] hover:shadow-md transition-shadow">
                <div className="text-5xl font-black text-[#0047BB] mb-2">
                  100<span className="text-[#FF8C00]">%</span>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Secure Handover
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 flex-1 min-w-[180px] hover:shadow-md transition-shadow">
                <div className="text-5xl font-black text-[#0047BB] mb-2">36+</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  States Covered
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 mt-10">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                <span className="material-symbols-outlined text-green-600 text-base">verified</span>
                <span className="text-xs font-bold text-green-700">CAC Registered</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                <span className="material-symbols-outlined text-[#0047BB] text-base">shield</span>
                <span className="text-xs font-bold text-[#0047BB]">Fully Insured</span>
              </div>
            </div>
          </div>

          {/* Image Block */}
          <div className="relative group">
            <div className="absolute inset-0 bg-[#0047BB]/20 rounded-[3rem] rotate-3 scale-95 opacity-25 group-hover:rotate-1 transition-transform duration-700" />
            <div className="rounded-[3rem] overflow-hidden shadow-2xl relative z-10 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ABOUT_IMAGE}
                alt="SAFETAFI Operations Center"
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 text-white">
                <p className="font-bold text-xl mb-1">Lagos Distribution Hub</p>
                <p className="text-sm text-slate-300">
                  Modern warehousing and dispatch for nationwide haulage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
