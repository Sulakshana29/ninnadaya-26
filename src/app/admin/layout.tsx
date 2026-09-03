import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Admin | Ninnadaya '26",
  description: "Master Admin Portal — Ninnadaya '26",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#020603] text-foreground antialiased">
      {children}
      <Toaster richColors position="top-right" />
    </div>
  );
}
