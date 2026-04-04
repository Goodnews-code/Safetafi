const services = [
  {
    icon: "local_shipping",
    color: "primary",
    title: "Interstate Road Haulage",
    desc: "Specialized transport for dry goods, industrial equipment, and retail supplies across Nigeria's major transport corridors.",
    features: ["Fully Insured Cargo", "24h Express Delivery"],
  },
  {
    icon: "directions_car",
    color: "accent",
    title: "Vehicle Sales & Hire",
    desc: "Fleet management solutions for corporate entities. Rent executive cars or acquire heavy-duty trucks from our certified inventory.",
    features: ["Flexible Lease Terms", "Maintenance Support"],
  },
  {
    icon: "inventory_2",
    color: "primary",
    title: "Supply Chain Sourcing",
    desc: "End-to-end procurement services. We bridge the gap between manufacturers and markets by handling sourcing and distribution.",
    features: ["Bulk Procurement", "Verified Suppliers"],
  },
];

interface ServicesProps {
  onPayNowClick?: () => void;
}

export default function ServicesSection({ onPayNowClick }: ServicesProps) {
  return (
    <section id="services" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl">
            <span className="text-[#0047BB] font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
              Core Competencies
            </span>
            <h2 className="text-5xl font-black text-slate-900 leading-tight">
              Professional Solutions For Every Journey
            </h2>
          </div>
          <div className="hidden md:block">
            <button
              onClick={onPayNowClick}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-[#0047BB] hover:text-white text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all"
            >
              Get a Quote
              <span className="material-symbols-outlined">arrow_right_alt</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-3 gap-10">
          {services.map((s) => {
            const isPrimary = s.color === "primary";
            return (
              <div key={s.title} className="service-card group">
                {/* Icon */}
                <div
                  className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 transition-all duration-500 group-hover:scale-110
                    ${isPrimary ? "bg-blue-50 group-hover:bg-[#0047BB]" : "bg-orange-50 group-hover:bg-[#E7B036]"}`}
                >
                  <span
                    className={`material-symbols-outlined text-5xl transition-colors duration-500
                      ${isPrimary ? "text-[#0047BB] group-hover:text-white" : "text-[#E7B036] group-hover:text-white"}`}
                  >
                    {s.icon}
                  </span>
                </div>

                <h4 className="text-2xl font-extrabold mb-5 text-slate-900">
                  {s.title}
                </h4>
                <p className="text-slate-500 leading-relaxed mb-8 font-light">
                  {s.desc}
                </p>

                {/* Features list */}
                <div className="pt-6 border-t border-slate-100">
                  <ul className="space-y-4">
                    {s.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-3 text-sm font-bold text-slate-500"
                      >
                        <span
                          className={`material-symbols-outlined text-lg ${isPrimary ? "text-[#0047BB]" : "text-[#E7B036]"}`}
                        >
                          check_circle
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
