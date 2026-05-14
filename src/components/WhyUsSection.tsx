const features = [
  {
    icon: "verified_user",
    color: "primary",
    title: "Absolute Reliability",
    desc: "We understand that time is money. Our schedules are rigorous and our delivery promise is ironclad.",
  },
  {
    icon: "gpp_good",
    color: "accent",
    title: "Maximum Safety",
    desc: "Our fleet undergoes weekly inspections and our drivers are trained in advanced defensive driving techniques.",
  },
  {
    icon: "location_searching",
    color: "primary",
    title: "Real-time Tracking",
    desc: "Know exactly where your cargo is at any moment with our sophisticated GPS and logistics dashboard.",
  },
];

export default function WhyUsSection() {
  return (
    <section id="why-us" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#0047BB] font-bold tracking-[0.3em] uppercase text-xs mb-3 block">
            Why Choose Us
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900">
            Built on Three Pillars
          </h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-10">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-6 p-8 rounded-3xl border border-slate-100 hover:bg-[#F4F7FA] hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                  ${
                    f.color === "primary"
                      ? "bg-blue-50 group-hover:bg-[#0047BB]"
                      : "bg-orange-50 group-hover:bg-[#E7B036]"
                  }`}
              >
                <span
                  className={`material-symbols-outlined text-3xl transition-colors duration-300
                    ${
                      f.color === "primary"
                        ? "text-[#0047BB] group-hover:text-white"
                        : "text-[#E7B036] group-hover:text-white"
                    }`}
                >
                  {f.icon}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
