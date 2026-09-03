"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Newspaper, Tv, Activity, Voicemail, Pencil, Camera, Video, Palette, Cpu, Film, Bot, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ── Stats ──────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, 1800, inView);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl flex flex-col items-center justify-center p-8 gap-2"
      style={{ width: "clamp(140px, 35vw, 220px)", height: "clamp(140px, 35vw, 220px)" }}
    >
      <span className="gradient-text-brand font-black text-glow-green" style={{ fontSize: "clamp(2.5rem, 7vw, 4rem)" }}>
        {count}{suffix}
      </span>
      <span className="text-muted-foreground text-sm text-center tracking-wide">{label}</span>
    </motion.div>
  );
}

// ── Categories ─────────────────────────────────────────────────────────────
const categories = [
  { icon: <Mic size={24} />, name: "Announcing", langs: "Sin · Eng · Tam", ages: "Junior · Intermediate · Senior" },
  { icon: <Newspaper size={24} />, name: "News Reporting", langs: "Sin · Eng · Tam", ages: "Junior · Intermediate · Senior" },
  { icon: <Tv size={24} />, name: "Program Presenting", langs: "Sin · Eng · Tam", ages: "Junior · Senior" },
  { icon: <Activity size={24} />, name: "Sports Commentary", langs: "Sin · Eng · Tam", ages: "Junior · Senior" },
  { icon: <Voicemail size={24} />, name: "Dubbing", langs: "Sin · Eng · Tam", ages: "Varies by language" },
  { icon: <Pencil size={24} />, name: "Cartoon Drawing", langs: "N/A", ages: "Open" },
  { icon: <Camera size={24} />, name: "Photography", langs: "N/A", ages: "Open" },
  { icon: <Video size={24} />, name: "Videography", langs: "N/A", ages: "Open" },
  { icon: <Palette size={24} />, name: "Graphic Designing", langs: "N/A", ages: "Open" },
  { icon: <Cpu size={24} />, name: "Technical", langs: "Sin · Eng", ages: "Open" },
  { icon: <Film size={24} />, name: "Short Film", langs: "Sin · Eng · Tam", ages: "Open" },
  { icon: <Bot size={24} />, name: "AI Short Film", langs: "Sin · Eng · Tam", ages: "Open" },
];

function CategoryCard({ icon, name, langs, ages, index }: { icon: React.ReactNode; name: string; langs: string; ages: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-3 group cursor-default transition-all duration-300 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10"
    >
      <div className="w-11 h-11 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500/25 group-hover:border-green-500/50 transition-all duration-300">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-foreground text-sm mb-1 group-hover:text-green-400 transition-colors">{name}</h3>
        <p className="text-muted-foreground text-xs">{langs}</p>
        <p className="text-muted-foreground/70 text-xs mt-0.5">{ages}</p>
      </div>
    </motion.div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Who is eligible to participate in Ninnadaya?",
    a: "Young media enthusiasts from schools across Sri Lanka born after 31.01.2009 are eligible to participate in Ninnadaya. Each school must register as a coordinator before adding contestants.",
  },
  {
    q: "How does school registration work?",
    a: "A school coordinator fills in the registration form with school details, teacher-in-charge info, and coordinator credentials. After successful registration, you can login to the Coordinator Dashboard to add and manage contestants.",
  },
  {
    q: "Can contestants enter multiple categories?",
    a: "Yes! A contestant can be entered into multiple categories. Simply add them separately with the appropriate category and language selection in the Coordinator Dashboard.",
  },
  {
    q: "What are the Photography, Graphic Design, and Short Film submission timelines?",
    a: "These categories do not require on-site attendance on competition day. Contestants receive a 7-day submission period from the start of the competition. Specific deadline dates will be announced closer to the event.",
  },
  {
    q: "How will results be announced?",
    a: "The Top 5 contestants of each category will be published on our social media channels approximately 2–3 weeks after the competition and communicated to respective school coordinators before the Ninnadaya Media Day ceremony.",
  },
  {
    q: "Can I modify or delete a contestant entry after submission?",
    a: "Contestant entries cannot be deleted once submitted. For any modifications or deletions, please contact the Organizing Committee directly through the contact details provided on the registration page.",
  },
];

// ── Main Page Component ────────────────────────────────────────────────────
export default function CompetitionPage() {
  return (
    <div className="relative overflow-hidden bg-[#020603]">
      {/* Background Image */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            backgroundImage: 'url("/images/bg-smoke.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-black/70 mix-blend-multiply" />
      </div>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-20">

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-6"
          >
            ✦ Ninnadaya &apos;26 ✦
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-black tracking-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 10vw, 7rem)", lineHeight: 1.05 }}
          >
            <span className="gradient-text-brand text-glow-green">THE</span>
            <br />
            <span className="text-foreground">COMPETITION</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-muted-foreground max-w-2xl mx-auto mb-10"
            style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)", lineHeight: 1.8 }}
          >
            The most prestigious all-island school media competition in Sri Lanka — 12 categories, 3 languages,
            judged by Sri Lanka&apos;s finest media personalities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-400 text-black font-bold tracking-wide px-8 shadow-lg shadow-green-500/30 hover:shadow-green-400/40 transition-all duration-300 hover:scale-105"
              >
                Register Now <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <a href="#categories">
              <Button size="lg" variant="outline" className="border-border hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5 tracking-wide px-8 transition-all">
                View Categories <ChevronDown size={18} className="ml-2" />
              </Button>
            </a>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/40">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section-pad relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-black text-3xl md:text-4xl text-foreground mb-3">By The Numbers</h2>
            <p className="text-muted-foreground">The scale of Sri Lanka&apos;s premier school media competition</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <StatCard value={50} label="Schools Registered" suffix="+" />
            <StatCard value={500} label="Contestants" suffix="+" />
            <StatCard value={12} label="Categories" />
            <StatCard value={3} label="Languages" />
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="section-pad relative">
        <div
          className="orb absolute"
          style={{ width: "min(600px,80vw)", height: "min(600px,80vw)", top: "20%", left: "-15%", background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 65%)" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-semibold tracking-widest uppercase mb-4">
              Contestant Categories
            </div>
            <h2
              className="font-black text-foreground mb-4"
              style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
            >
              12 Ways to <span className="gradient-text-brand">Shine</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              From announcing to AI filmmaking — compete in the category that matches your passion
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.name} {...cat} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-10"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-400 text-black font-bold tracking-wide px-8 shadow-lg shadow-green-500/30 hover:shadow-green-400/40 transition-all duration-300 hover:scale-105"
              >
                Register Contestants <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-pad relative">
        <div
          className="orb absolute"
          style={{ width: "min(500px,80vw)", height: "min(500px,80vw)", top: "50%", right: "-15%", transform: "translateY(-50%)", background: "radial-gradient(circle, rgba(234,179,8,0.07) 0%, transparent 65%)" }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-4">
              FAQ
            </div>
            <h2 className="font-black text-3xl md:text-4xl text-foreground mb-3">
              Everything You Need to Know
            </h2>
            <p className="text-muted-foreground text-sm">Quick answers to common questions about Ninnadaya</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <Accordion type="single" collapsible="true" className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="glass-card rounded-xl border-0 px-5 overflow-hidden"
                >
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-green-400 hover:no-underline py-4 transition-colors">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="section-pad relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-yellow-500/10" />
          <div className="orb absolute inset-0 m-auto" style={{ width: "min(600px,90vw)", height: "min(600px,90vw)", background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 60%)" }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-black mb-4 gradient-text-brand" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
              Ready to Compete?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Register your school today and start adding your contestants for Ninnadaya &apos;26.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-400 text-black font-black tracking-widest uppercase px-12 py-6 text-base shadow-xl shadow-green-500/40 hover:shadow-green-400/50 transition-all duration-300 hover:scale-105"
              >
                Register Your School
                <ArrowRight size={20} className="ml-3" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
