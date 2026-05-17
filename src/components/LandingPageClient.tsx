"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyUsSection from "@/components/WhyUsSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";

const PaymentModal = dynamic(() => import("@/components/PaymentModal"), { ssr: false });

export default function LandingPageClient() {
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <div className="relative overflow-x-hidden flex flex-col font-sans w-full min-h-screen">
      <Navbar onPayNowClick={() => setPaymentOpen(true)} />
      <main className="flex-1">
        <HeroSection onPayNowClick={() => setPaymentOpen(true)} />
        <WhyUsSection />
        <AboutSection />
        <ServicesSection onPayNowClick={() => setPaymentOpen(true)} />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />
    </div>
  );
}
