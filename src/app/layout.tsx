import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { PublicShell } from "@/components/layout/public-shell";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ninnadaya | Maliyadeva Balika Vidyalaya",
  description:
    "Ninnadaya — the premier all-island media competition organized by Maliyadeva Balika Vidyalaya, Kurunegala. Register your school, add contestants, and compete across 9 categories.",
  keywords: ["Ninnadaya", "Maliyadeva Balika", "media competition", "Sri Lanka", "school competition"],
  openGraph: {
    title: "Ninnadaya | Maliyadeva Balika Vidyalaya",
    description: "Sri Lanka's premier school media competition — Ninnadaya by Maliyadeva Balika Vidyalaya.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} dark`}>
      <body className="min-h-screen flex flex-col bg-[#020603] text-foreground antialiased">
        <PublicShell>{children}</PublicShell>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
