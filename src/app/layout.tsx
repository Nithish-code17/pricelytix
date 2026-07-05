import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pricelytix - Enterprise Price Intelligence & Tracking",
  description: "Automated e-commerce price monitoring, real-time target alerts, and price history analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#000000] text-white font-sans selection:bg-[#2563eb] selection:text-white">
        {children}
      </body>
    </html>
  );
}
