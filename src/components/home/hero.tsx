"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!orbRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      orbRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020603]">

      {/* ── BACKGROUND IMAGE WITH SUBTLE BREATHING ANIMATION ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[-5%] bg-[#020603]"
          style={{
            backgroundImage: 'url("/images/bg-smoke.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
      </div>

      {/* Content */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
        
        {/* Official Logo Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="relative w-full max-w-[450px] mx-auto mb-10"
        >
          <img 
            src="/images/main-logo.jpg" 
            alt="Ninnadaya '26 - Media Unit of Maliyadeva Balika Vidyalaya Proudly Presents" 
            className="w-full h-auto drop-shadow-2xl rounded-2xl"
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/register">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold tracking-wide px-8 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-400/40 transition-all duration-300 hover:scale-105"
            >
              Register School
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
          <Link href="/competition">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-emerald-800/60 bg-emerald-900/10 hover:border-emerald-700/80 text-foreground hover:text-yellow-400 hover:bg-emerald-900/30 tracking-wide px-8 transition-all duration-300"
            >
              Explore Competition
            </Button>
          </Link>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="grid grid-cols-3 gap-4 mt-16 max-w-md mx-auto"
        >
          {[
            { icon: <Trophy size={18} />, value: "9", label: "Categories" },
            { icon: <Users size={18} />, value: "3", label: "Languages" },
            { icon: <Star size={18} />, value: "#1", label: "Competition" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl p-4 flex flex-col items-center gap-1"
            >
              <div className="text-green-400">{stat.icon}</div>
              <span className="text-xl font-black gradient-text-green">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
