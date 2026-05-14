const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Why Choose Us", href: "#why-us" },
  { label: "Leadership", href: "#" },
  { label: "Fleet Info", href: "#" },
];

const resourceLinks = [
  { label: "Services", href: "#services" },
  { label: "Support", href: "#contact" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Hub", href: "#" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B0E14] text-white pt-28 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-14 border-b border-white/5 pb-20 mb-14">

          {/* Brand col */}
          <div className="lg:col-span-5">
            <a href="#" className="inline-block mb-8">
              <span className="text-3xl font-black tracking-tight">
                <span className="text-[#0047BB]">SAFE</span>
                <span className="text-[#FF8C00]">TAFI</span>
              </span>
            </a>
            <p className="text-slate-400 max-w-md text-lg leading-relaxed font-light mb-10">
              Redefining Nigerian logistics through transparency, technology, and
              trust. We empower businesses to reach further and faster across the
              continent.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {[
                {
                  label: "Twitter",
                  path: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
                },
                {
                  label: "Instagram",
                  path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                },
                {
                  label: "LinkedIn",
                  path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0047BB] hover:border-[#0047BB] transition-all group"
                >
                  <svg
                    className="w-5 h-5 fill-current text-slate-400 group-hover:text-white"
                    viewBox="0 0 24 24"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div className="lg:col-span-2">
            <h5 className="font-black text-white uppercase text-xs tracking-[0.3em] mb-10">
              Company
            </h5>
            <ul className="space-y-5 text-slate-400">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="hover:text-[#FF8C00] transition-colors text-sm font-medium"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div className="lg:col-span-2">
            <h5 className="font-black text-white uppercase text-xs tracking-[0.3em] mb-10">
              Resources
            </h5>
            <ul className="space-y-5 text-slate-400">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="hover:text-[#FF8C00] transition-colors text-sm font-medium"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h5 className="font-black text-white uppercase text-xs tracking-[0.3em] mb-10">
              Newsletter
            </h5>
            <p className="text-slate-400 text-sm mb-6 font-light leading-relaxed">
              Join 500+ businesses receiving our weekly route updates and logistics tips.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-[#0047BB] focus:border-[#0047BB] placeholder:text-slate-600 outline-none transition-all"
              />
              <button className="bg-[#0047BB] text-white font-bold py-4 rounded-2xl hover:bg-[#001B44] transition-all shadow-xl shadow-blue-900/30 text-sm tracking-wider">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-500 text-sm font-medium">
            © {currentYear} SAFETAFI Transport &amp; Logistics. A Standard of Excellence.
          </p>
          <div className="flex items-center gap-6 px-7 py-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                System: Active
              </span>
            </div>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-xs font-bold text-[#FF8C00]">
              BN: 7441816
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
