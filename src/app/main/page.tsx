import type { Metadata } from "next";
import LandingPageClient from "@/components/LandingPageClient";

export const metadata: Metadata = {
  title: "SAFETAFI | Full Landing Page",
  description: "Discover our full range of logistics and transport solutions.",
};

export default function MainPage() {
  return <LandingPageClient />;
}
