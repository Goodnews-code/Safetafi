"use client";

import { useState } from "react";

const contactInfo = [
  {
    icon: "location_on",
    label: "Regional HQ",
    value: "Fajuyi Hall, Obafemi Awolowo University, Ile-Ife, Osun State, Nigeria",
  },
  {
    icon: "phone_in_talk",
    label: "Direct Support",
    value: "+234 905 805 0350",
  },
  {
    icon: "mail",
    label: "Official Email",
    value: "safetafitransport@gmail.com",
  },
];

const services = ["Road Haulage", "Vehicle Sales", "Corporate Hire", "Supply Chain"];

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="py-32 bg-[#F4F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20">

          {/* Left: Info */}
          <div>
            <span className="text-[#0047BB] font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
              Let&apos;s Connect
            </span>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-8 leading-tight">
              Start Your Logistics Journey Today
            </h2>
            <p className="text-slate-500 text-xl mb-14 leading-relaxed font-light">
              Whether you need interstate haulage or corporate fleet leasing, our
              team is ready to deliver excellence.
            </p>

            <div className="space-y-10">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-center gap-7 group">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm group-hover:bg-[#0047BB] transition-all duration-500 group-hover:scale-110 flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl text-[#0047BB] group-hover:text-white transition-colors duration-500">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-2">
                      {item.label}
                    </h4>
                    <p className="text-slate-600 text-lg">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-6">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-green-600">
                    check_circle
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">Request Sent!</h3>
                <p className="text-slate-500">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-100 focus:border-[#0047BB] outline-none transition-all placeholder:text-slate-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-100 focus:border-[#0047BB] outline-none transition-all placeholder:text-slate-300 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Service Required
                  </label>
                  <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-100 focus:border-[#0047BB] outline-none transition-all text-slate-700 font-bold">
                    {services.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Your Request
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe your logistics needs..."
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-100 focus:border-[#0047BB] outline-none transition-all placeholder:text-slate-300 font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0047BB] text-white font-black py-5 rounded-2xl hover:bg-[#001B44] transition-all shadow-2xl shadow-blue-600/25 text-lg uppercase tracking-[0.15em] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
                >
                  Send Request
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
