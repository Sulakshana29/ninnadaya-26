"use client";

import { motion } from "framer-motion";
import { Quote, Eye, Target, BookOpen, Sparkles } from "lucide-react";
import Image from "next/image";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#020603] overflow-hidden">

      {/* ── HERO ── with school building as background */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* School building background */}
        <div className="absolute inset-0">
          <Image
            src="/images/school.jpg"
            alt="Maliyadeva Balika Vidyalaya"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Multi-layer dark overlay for premium depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#020603]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020603]/60 via-transparent to-[#020603]/60" />
          {/* Subtle emerald tint */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(6,78,59,0.35) 0%, transparent 70%)" }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 pt-24 pb-16 w-full max-w-5xl mx-auto">

          {/* Ninnadaya logo — same as home page */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="relative w-full max-w-[380px] mx-auto mb-10"
          >
            <img
              src="/images/main-logo.jpg"
              alt="Ninnadaya '26"
              className="w-full h-auto drop-shadow-2xl rounded-2xl"
            />
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-4">
              <Sparkles size={12} /> About Us
            </div>
            <p
              className="text-white/80 max-w-xl mx-auto font-medium"
              style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)", lineHeight: 1.8 }}
            >
              The Media Unit of{" "}
              <span className="text-yellow-400 font-bold">Maliyadeva Balika Vidyalaya</span>
              , Kurunegala — shaping the future of media in Sri Lanka.
            </p>
          </motion.div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020603] to-transparent pointer-events-none" />
      </section>

      {/* Rest of content — no fixed smoke bg needed, page bg handles it */}
      <div className="relative z-10">

        {/* Subtle ambient orbs */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute" style={{ width: "min(600px,90vw)", height: "min(600px,90vw)", top: "40%", right: "-20%", background: "radial-gradient(circle, rgba(234,179,8,0.05) 0%, transparent 65%)" }} />
          <div className="absolute" style={{ width: "min(500px,80vw)", height: "min(500px,80vw)", bottom: "20%", left: "-15%", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 65%)" }} />
        </div>

        {/* ── MOTTO ── */}
        <section className="py-24 px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-10">
                Our Motto
              </div>

              <div className="relative glass-card rounded-3xl p-10 md:p-16 border border-yellow-500/10">
                {/* Decorative corner quotes */}
                <Quote size={48} className="absolute top-6 left-8 text-yellow-500/20 rotate-180" />
                <Quote size={48} className="absolute bottom-6 right-8 text-yellow-500/20" />

                <blockquote
                  className="gradient-text-gold font-black italic leading-snug relative z-10"
                  style={{ fontSize: "clamp(1.2rem, 3.5vw, 2rem)" }}
                >
                  To surpass the reality of perceptive communication, overcoming the tides of orthodoxy.
                </blockquote>

                <div className="mt-8 w-20 h-px mx-auto bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-60" />
                <p className="text-muted-foreground text-sm mt-4 tracking-widest uppercase font-semibold">Ninnadaya &apos;26</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── BEYOND US ── */}
        <section className="py-20 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-800/50 bg-emerald-900/40 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-6">
                <BookOpen size={12} /> Beyond Us
              </div>
              <h2
                className="font-black text-foreground mb-8"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
              >
                The Media Unit of{" "}
                <span className="gradient-text-gold">Maliyadeva Balika Vidyalaya</span>
              </h2>
              <div className="glass-card rounded-2xl p-8 md:p-10 border border-emerald-800/30">
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.08rem)", lineHeight: 2 }}
                >
                  The Media Unit of Maliyadeva Balika Vidyalaya is a creative and communicative platform which manages the school&apos;s internal broadcasting, covers school events, deals with public relations and provides students with practical training in journalism, media production and digital broadcasting — while enabling them to explore their talents, voice out their ideas and develop the skills and courage to become innovative communicators of the future.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── VISION & MISSION ── */}
        <section className="py-20 px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-800/50 bg-emerald-900/40 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-4">
                Our Purpose
              </div>
              <h2 className="font-black text-foreground" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}>
                Vision &amp; <span className="gradient-text-gold">Mission</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card rounded-2xl p-8 border border-emerald-800/30 hover:border-yellow-500/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-900/40 border border-emerald-800/50 flex items-center justify-center text-yellow-400 mb-6 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/50 transition-all">
                  <Eye size={22} />
                </div>
                <h3 className="font-black text-xl gradient-text-gold mb-4">Vision</h3>
                <p className="text-muted-foreground" style={{ lineHeight: 1.9 }}>
                  To inspire and empower the next generation of young media makers by providing a venue in which they have an opportunity to discover their talents, express their creativity and confidence in shaping the future media.
                </p>
              </motion.div>

              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass-card rounded-2xl p-8 border border-emerald-800/30 hover:border-yellow-500/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-900/40 border border-emerald-800/50 flex items-center justify-center text-yellow-400 mb-6 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/50 transition-all">
                  <Target size={22} />
                </div>
                <h3 className="font-black text-xl gradient-text-gold mb-4">Mission</h3>
                <p className="text-muted-foreground" style={{ lineHeight: 1.9 }}>
                  To give the students opportunities to learn, develop and demonstrate their skills in media, as well as present their talents and gain experience, self-confidence, and the necessary skills to become competent and innovative communicators.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-4 text-center relative z-10">
          <motion.div {...fadeUp}>
            <h2 className="font-black gradient-text-gold mb-4" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}>
              Ready to be Part of the Story?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Register your school today and join Sri Lanka&apos;s premier all-island media competition.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black tracking-widest uppercase rounded-lg shadow-lg shadow-yellow-500/30 hover:shadow-yellow-400/40 transition-all duration-300 hover:scale-105 text-sm"
              >
                Register Your School
              </a>
              <a
                href="/competition"
                className="inline-flex items-center gap-2 px-8 py-3 border border-emerald-800/60 hover:border-yellow-500/50 text-foreground hover:text-yellow-400 rounded-lg transition-all duration-300 text-sm font-medium"
              >
                View Categories
              </a>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
