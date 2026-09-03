"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Rising light particles (like stage bokeh / camera flash embers)
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1,
    color: i % 4 === 0 ? "#fde047" : i % 4 === 1 ? "#4ade80" : "#86efac",
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -800],
            x: [0, (Math.random() - 0.5) * 80],
            opacity: [0, p.opacity, p.opacity * 0.5, 0],
            scale: [0.5, 1.2, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

interface SmokyBackgroundProps {
  /** Set to true on pages where the background should cover the full fixed viewport (e.g. hero).
   *  Set to false for inner-page scrollable sections where absolute positioning is fine.  */
  fixed?: boolean;
  /** Extra dark overlay opacity — useful on form pages where you need high readability */
  darknessLevel?: "light" | "medium" | "heavy";
}

export function SmokyBackground({
  fixed = false,
  darknessLevel = "medium",
}: SmokyBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const darknessMap = {
    light: "bg-black/20",
    medium: "bg-black/55",
    heavy: "bg-black/75",
  };

  const positionClass = fixed ? "fixed" : "absolute";

  return (
    <div className={`${positionClass} inset-0 pointer-events-none z-0 overflow-hidden bg-[#020603]`}>

      {/* ── Layer 1: SVG Turbulence Smoke ── */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full opacity-80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="smoke-filter" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            {/* Organic fractal noise to simulate smoke */}
            <feTurbulence
              id="smoke-turbulence"
              type="fractalNoise"
              baseFrequency="0.012 0.010"
              numOctaves="5"
              seed="8"
              stitchTiles="stitch"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.012 0.010;0.015 0.013;0.010 0.008;0.012 0.010"
                dur="25s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="seed"
                values="8;15;3;20;8"
                dur="40s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            {/* Map the noise to deep green smoke colours */}
            <feColorMatrix
              type="matrix"
              in="noise"
              values="0 0 0 0 0.02
                      0 0 0 0 0.18
                      0 0 0 0 0.05
                      0 0 0 18 -7"
              result="greenSmoke"
            />
            {/* Soften the edges */}
            <feGaussianBlur in="greenSmoke" stdDeviation="2" result="softSmoke" />
          </filter>

          {/* Vignette gradient */}
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
          </radialGradient>
        </defs>

        {/* Smoke rectangle — full viewport */}
        <rect width="100%" height="100%" filter="url(#smoke-filter)" />

        {/* Vignette overlay to darken edges */}
        <rect width="100%" height="100%" fill="url(#vignette)" />
      </svg>

      {/* ── Layer 2: Animated Glowing Orbs for Depth ── */}
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 20, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[65vw] h-[65vw] rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 40%, rgba(34,197,94,0.22) 0%, rgba(22,101,52,0.10) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -50, 40, 0], y: [0, 50, -30, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] -right-[15%] w-[55vw] h-[55vw] rounded-full"
        style={{
          background: "radial-gradient(circle at 60% 50%, rgba(20,83,45,0.25) 0%, rgba(34,197,94,0.08) 45%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -50, 30, 0], scale: [1.1, 1, 1.15, 1.1] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[20%] left-[10%] w-[80vw] h-[60vw] rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 60%, rgba(21,128,61,0.15) 0%, rgba(2,6,3,0.05) 55%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      {/* Subtle gold highlight — adds the warm "stage light" effect */}
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -20, 10, 0], opacity: [0.15, 0.22, 0.12, 0.15] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[35%] w-[30vw] h-[30vw] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(253,224,71,0.18) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      {/* ── Layer 3: Rising Light Particles ── */}
      <Particles />

      {/* ── Layer 4: Film Grain Texture (Cinematic Feel) ── */}
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* ── Layer 5: Darkness Overlay for readability ── */}
      <div className={`absolute inset-0 ${darknessMap[darknessLevel]}`} />
    </div>
  );
}
