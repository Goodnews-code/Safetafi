const testimonials = [
  {
    quote:
      "SAFETAFI has transformed our distribution network. Their reliability in road transport is unmatched in the region.",
    initials: "CA",
    name: "Chidi Azikiwe",
    title: "Retail Manager, Lagos",
    bgColor: "#0047BB",
    featured: false,
  },
  {
    quote:
      "The vehicle hire service was seamless. The truck was in excellent condition and the driver was extremely professional.",
    initials: "FB",
    name: "Fatima Bello",
    title: "Logistics Lead, Abuja",
    bgColor: "#001B44",
    featured: true,
  },
  {
    quote:
      "Reliable partner for general merchandise. They handled our supply chain needs with impressive efficiency and care.",
    initials: "OT",
    name: "Olawale Tunde",
    title: "CEO, Tunde Enterprises",
    bgColor: "#FF8C00",
    featured: false,
  },
];

function StarRating() {
  return (
    <div className="flex gap-1 text-[#FF8C00] mb-8">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="material-symbols-outlined fill-1 text-xl">
          star
        </span>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-32 bg-[#001B44] text-white relative overflow-hidden"
    >
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-10 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #0047BB 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <span className="text-[#FF8C00] font-bold tracking-[0.4em] uppercase text-xs mb-4 block">
            Proven Performance
          </span>
          <h2 className="text-5xl lg:text-6xl font-black mb-6">
            Trusted Across Nigeria
          </h2>
          <div className="w-24 h-1 bg-[#FF8C00] mx-auto rounded-full" />
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-3 gap-10 items-stretch">
          {testimonials.map((t) =>
            t.featured ? (
              /* Featured (elevated) card */
              <div
                key={t.name}
                className="bg-white p-12 rounded-[3rem] text-slate-900 shadow-2xl relative lg:-translate-y-8 flex flex-col"
              >
                <span className="material-symbols-outlined text-6xl text-[#0047BB]/10 absolute top-10 right-10">
                  format_quote
                </span>
                <StarRating />
                <p className="text-slate-600 text-xl leading-relaxed italic mb-12 font-medium flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white"
                    style={{ backgroundColor: t.bgColor }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-black text-[#001B44]">{t.name}</p>
                    <p className="text-xs font-bold text-[#0047BB] uppercase tracking-widest">
                      {t.title}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard card */
              <div
                key={t.name}
                className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all duration-500 flex flex-col"
              >
                <StarRating />
                <p className="text-slate-300 text-xl leading-relaxed italic mb-10 font-light flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg"
                    style={{ backgroundColor: t.bgColor }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-black text-white">{t.name}</p>
                    <p className="text-xs font-bold text-[#FF8C00] uppercase tracking-widest">
                      {t.title}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
