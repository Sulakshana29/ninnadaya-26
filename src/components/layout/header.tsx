"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Competition", href: "/competition" },
  { label: "Register", href: "/register" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-widest uppercase gradient-text-gold">
            Ninnadaya
          </span>
          <span className="hidden sm:block text-xs text-muted-foreground font-medium tracking-wide mt-0.5">
            &apos;26
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === link.href
                  ? "text-yellow-400 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="ml-3 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/70 hover:text-yellow-300 transition-all duration-200"
            >
              Coordinator Login
            </Button>
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-border",
          mobileOpen ? "max-h-64 bg-background/95 backdrop-blur-xl" : "max-h-0"
        )}
      >
        <nav className="px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-yellow-400 font-bold bg-yellow-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setMobileOpen(false)}>
            <Button
              variant="outline"
              className="mt-2 w-full border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/70"
              onClick={() => setMobileOpen(false)}
            >
              Coordinator Login
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
