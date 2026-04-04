"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyUsSection from "@/components/WhyUsSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const PaymentModal = dynamic(() => import("@/components/PaymentModal"), {
  ssr: false,
});

/**
 * 📢 ARCHIVED VERSION OF THE FULL LANDING PAGE
 * -------------------------------------------
 * This page contains the complete marketing sections (Hero, About, Why Us, etc.)
 * as built during the initial development phase.
 * Save this for reference when the final designer assets are ready!
 */
export default function OriginalLanding() {
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <>
      <Navbar onPayNowClick={() => setPaymentOpen(true)} />
      <main>
        <HeroSection onPayNowClick={() => setPaymentOpen(true)} />
        <WhyUsSection />
        <AboutSection />
        <ServicesSection onPayNowClick={() => setPaymentOpen(true)} />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />

      {/* Global payment modal */}
      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />
    </>
  );
}
