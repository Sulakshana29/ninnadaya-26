import Link from "next/link";

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/maliyadevabalika_mediaunit?utm_source=qr&igsi=MWlpaDJuMWRibXdtZA==",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp Channel",
    href: "https://whatsapp.com/channel/0029VazvGtu4dTnBct7w0L15",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.011 11.966.011c3.182.001 6.176 1.24 8.428 3.496 2.253 2.255 3.491 5.252 3.49 8.433-.004 6.557-5.341 11.894-11.91 11.894-2.008-.002-3.98-.51-5.733-1.474L0 24zm6.59-3.807c1.677.995 3.4 1.52 5.309 1.52 5.56 0 10.083-4.524 10.086-10.086.002-2.695-1.047-5.23-2.956-7.14C17.177 2.578 14.646 1.526 11.96 1.526c-5.57 0-10.096 4.525-10.099 10.087-.001 1.92.502 3.794 1.458 5.405L1.758 22.37l5.441-1.427c1.628.887 3.36 1.353 4.908 1.353h.003L12.11 22.25zm8.016-6.666c-.195-.097-1.15-.567-1.329-.631-.177-.065-.307-.097-.436.097-.129.194-.5.63-.613.76-.113.129-.226.146-.42.049-.194-.097-.82-.302-1.562-.965-.577-.515-.967-1.15-1.08-1.343-.113-.194-.012-.299.085-.395.087-.087.194-.226.29-.339.097-.113.129-.194.194-.323.065-.129.032-.242-.016-.339-.049-.097-.436-1.05-.597-1.436-.157-.378-.313-.327-.436-.333-.113-.005-.242-.006-.371-.006-.129 0-.339.049-.516.242-.177.194-.678.663-.678 1.616 0 .953.694 1.874.79 2.003.097.129 1.365 2.085 3.307 2.92.462.199.823.318 1.105.408.464.147.886.126 1.22.076.372-.056 1.15-.47 1.31-.924.16-.454.16-.843.113-.924-.048-.08-.177-.129-.371-.226z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.482 20.455 12 20.455 12 20.455s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-6">
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-2xl font-black tracking-widest uppercase gradient-text-gold">
                Ninnadaya
              </span>
              <span className="text-sm text-muted-foreground font-medium tracking-wide mt-1">
                &apos;26
              </span>
            </Link>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground border border-border hover:border-emerald-800/60 hover:text-yellow-400 hover:bg-emerald-900/30 transition-all duration-200"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            <Link href="/competition" className="hover:text-yellow-400 transition-colors">Competition</Link>
            <Link href="/register" className="hover:text-yellow-400 transition-colors">Register</Link>
            <Link href="/login" className="hover:text-yellow-400 transition-colors">Login</Link>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs font-medium text-foreground w-full pt-4">
            <p>&copy; 2026 media unit of Maliyadeva Balika Vidyalaya, Kurunegala</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
