import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "zdmsFacture — Gestion Facturation & Devis Premium",
  description: "Solution SaaS moderne de facturation multidevise pour entreprises en Afrique.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={`${inter.variable} font-sans antialiased h-full text-slate-800 bg-[#F4F4F6]`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
