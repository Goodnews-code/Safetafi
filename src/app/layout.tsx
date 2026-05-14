import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SAFETAFI | Trusted Nigerian Transport & Logistics Solutions",
  description:
    "From Lagos to Kano, SAFETAFI bridges the gap between businesses and markets with end-to-end transport solutions designed for the modern economy. Reliable, safe, and trackable.",
  keywords: "Nigeria logistics, transport Nigeria, road haulage, vehicle hire, supply chain Nigeria, SAFETAFI",
  openGraph: {
    title: "SAFETAFI | Trusted Nigerian Transport & Logistics Solutions",
    description:
      "Redefining Nigerian logistics through transparency, technology, and trust.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload the icon font so it starts fetching immediately */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
          as="style"
        />
        {/* Material Symbols Outlined */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
          />
        </noscript>
      </head>
      <body className={`${publicSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
