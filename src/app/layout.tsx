import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LeadProvider } from "@/context/LeadContext";
import { Toaster } from "@/components/ui/sonner";
import { TrackingScripts } from "@/components/layout/TrackingScripts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Trade Asian | Supply Chain Intelligence & B2B Sourcing Tools",
  description:
    "Herramientas algorítmicas de sourcing internacional: Calculadora de Landed Cost, Estimador de ROI, Risk Assessment y KPIs logísticos para la cadena de suministro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LeadProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster position="top-right" richColors />
          <TrackingScripts />
        </LeadProvider>
      </body>
    </html>
  );
}
