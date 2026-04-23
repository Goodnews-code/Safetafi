"use client";

import dynamic from "next/dynamic";

const DynamicCheckoutPortal = dynamic(() => import("@/components/CheckoutPortal"), {
  ssr: false,
  loading: () => <div className="w-full max-w-xl h-[600px] bg-white/80 rounded-[3rem] mx-auto" />,
});

export default DynamicCheckoutPortal;
