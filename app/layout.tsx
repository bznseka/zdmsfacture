import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "zdmsFacture — Gestion Facturation & Devis Premium",
  description: "Solution SaaS moderne de facturation multidevise pour entreprises en Afrique.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "zdmsFacture",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "zdmsFacture",
    title: "zdmsFacture — Gestion Facturation & Devis Premium",
    description: "Solution SaaS moderne de facturation multidevise pour entreprises en Afrique.",
  },
  twitter: {
    card: "summary",
    title: "zdmsFacture — Gestion Facturation & Devis Premium",
    description: "Solution SaaS moderne de facturation multidevise pour entreprises en Afrique.",
  },
};

export const viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full scroll-smooth">
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased h-full text-slate-800 bg-[#F4F4F6]`}
      >
        <SessionProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
