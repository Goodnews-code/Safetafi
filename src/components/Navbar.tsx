"use client";

import { useState, useEffect } from "react";

interface NavbarProps {
  onPayNowClick?: () => void;
}

export default function Navbar({ onPayNowClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Why Choose Us", href: "#why-us" },
    { label: "Services", href: "#services" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled ? "shadow-lg shadow-slate-200/60" : ""
      } glass-nav`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="#" className="flex items-center group">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-[#0047BB]">SAFE</span>
              <span className="text-[#E7B036]">TAFI</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a key={link.href} className="nav-link" href={link.href}>
                {link.label}
              </a>
            ))}
            <button
              onClick={onPayNowClick}
              className="inline-flex items-center gap-2 bg-[#0047BB] text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#001B44] transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="material-symbols-outlined text-lg leading-none">lock</span>
              Pay Now
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-3xl">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-6 pt-4 space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-slate-700 font-semibold py-2 hover:text-[#0047BB] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => { setMenuOpen(false); onPayNowClick?.(); }}
            className="w-full text-center bg-[#0047BB] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#001B44] transition-all mt-2"
          >
            Pay Now
          </button>
        </div>
      )}
    </header>
  );
}
