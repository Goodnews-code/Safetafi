"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { HERO_IMAGE } from "@/lib/constants";
import dynamic from "next/dynamic";

const CheckoutPortal = dynamic(() => import("@/components/CheckoutPortal"), {
  ssr: false,
});

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Layer 1: Animated wallpaper + blur backdrop — clicks here close modal */}
      <div
        style={{
          position: "fixed", inset: 0,
          zIndex: 2147483646,
          overflow: "hidden",
        }}
        onClick={onClose}
      >
        {/* Floating hero image wallpaper */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            opacity: 0.35,
            animation: "float 3s ease-in-out infinite",
          }}
        />
        {/* Dark gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(11,14,20,0.88) 0%, rgba(16,2,135,0.50) 100%)",
        }} />
        {/* Frosted blur layer */}
        <div style={{
          position: "absolute", inset: 0,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }} />
      </div>

      {/* Layer 2: Scrollable overlay (transparent) on top of blur */}
      <div
        style={{
          position: "fixed", inset: 0,
          zIndex: 2147483647,
          overflowY: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl">
          <CheckoutPortal onClose={onClose} />
        </div>
      </div>
    </>,
    document.body
  );
}
