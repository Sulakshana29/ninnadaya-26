"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("loginPassword") as HTMLInputElement).value;

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message === "Invalid login credentials"
        ? "Incorrect email or password. Please try again."
        : signInError.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
      {/* Orb background effect */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-yellow-400 transition-colors text-sm mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="text-3xl font-black tracking-widest uppercase gradient-text-gold">Ninnadaya</span>
          <p className="text-muted-foreground text-sm mt-2">Coordinator Portal</p>
          <div className="mt-4 w-16 h-px mx-auto bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-60" />
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass-card rounded-2xl px-8 py-8"
        >
          <h1 className="text-xl font-black text-foreground mb-1">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mb-6">Sign in to manage your school&apos;s contestants</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="coordinator@school.lk"
                required
                className="bg-black/40 border-border focus:border-yellow-500/60 h-12"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="loginPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                <Link href="/forgot-password" className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="bg-black/40 border-border focus:border-yellow-500/60 h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-black tracking-widest uppercase shadow-lg shadow-yellow-500/30 hover:shadow-yellow-400/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in…
                </span>
              ) : "Sign In"}
            </Button>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-muted-foreground text-sm"
        >
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
            Register your school →
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
