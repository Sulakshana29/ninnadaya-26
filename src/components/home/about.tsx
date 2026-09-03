"use client";

import { motion } from "framer-motion";
import { Mic, Camera, Film, Pen } from "lucide-react";

const features = [
  {
    icon: <Mic size={28} />,
    title: "Creative Skills",
    desc: "Discover and nurture hidden creative talents through a wide variety of challenging media activities and competitions.",
  },
  {
    icon: <Camera size={28} />,
    title: "Communicative Skills",
    desc: "Build confidence and become the creative communicators of the future through announcing, journalism, and presenting.",
  },
  {
    icon: <Film size={28} />,
    title: "Technical Skills",
    desc: "Develop cutting-edge technical skills through videography, AI short films, graphic design, and digital media production.",
  },
  {
    icon: <Pen size={28} />,
    title: "Artistic Skills",
    desc: "Express artistic vision through photography, cartoon drawing, dubbing, and other creative visual art forms.",
  },
];

function FeatureCard({
  icon,
  title,
  desc,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl p-6 flex flex-col gap-4 group cursor-default"
    >
      <div className="w-12 h-12 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-400 group-hover:bg-green-500/25 group-hover:border-green-500/50 transition-all duration-300">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-foreground mb-2 group-hover:text-green-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export function AboutSection() {
  return (
    <section className="section-pad relative overflow-hidden">
      {/* Background accent */}
      <div
        className="orb absolute"
        style={{
          width: "min(500px, 80vw)",
          height: "min(500px, 80vw)",
          top: "50%",
          right: "-15%",
          transform: "translateY(-50%)",
          background: "radial-gradient(circle, rgba(234,179,8,0.08) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-4">
            About Ninnadaya &apos;26
          </div>
          <h2
            className="font-black text-foreground mb-5"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.15 }}
          >
            Discover. Create.{" "}
            <span className="gradient-text-brand">Shine.</span>
          </h2>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed" style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)" }}>
              <span className="text-foreground font-semibold">NINNADAYA &apos;26</span> is an annual inter-school media competition organized by the{" "}
              <span className="text-green-400 font-semibold">Media Unit of Maliyadeva Balika Vidyalaya</span>. The project provides a platform to discover and nurture the hidden talents of young students and develop their creative, communicative, technical and artistic skills.
            </p>
            <p className="text-muted-foreground leading-relaxed" style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)" }}>
              With a variety of challenging activities related to media, NINNADAYA &apos;26 brings out the creative minds among the students, enabling them to showcase their talents and turn their ideas into reality. The project motivates young minds to venture into the world of media, build self-confidence and become the{" "}
              <span className="gradient-text-gold font-semibold">creative communicators of the future</span>.
            </p>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>

        {/* Award highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-14 glass-card-gold rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="text-5xl">🏆</div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-yellow-400 mb-1">
              Most Prestigious Award
            </p>
            <h3 className="text-xl font-black text-foreground mb-2">
              Ninnadaya Championship Trophy
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The Overall Champions of Ninnadaya receive the prestigious Championship Trophy,
              while the Best School Student Media Personality is awarded the coveted
              <strong className="text-yellow-400"> Ninnadaya Media Personality Shield</strong>.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
