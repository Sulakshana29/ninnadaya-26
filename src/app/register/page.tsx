"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invitation, setInvitation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
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
    const form = e.currentTarget;
    const data = new FormData(form);

    const password = data.get("password") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!invitation) {
      setError("Please indicate whether you require an invitation letter.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const email = data.get("coordinatorEmail") as string;

    // 1. Create the auth account
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          school_name: data.get("schoolName"),
          coordinator_name: data.get("coordinatorName"),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Save school details via secure API route (bypasses RLS during signup)
    if (authData.user) {
      const payload = {
        user_id: authData.user.id,
        school_name: data.get("schoolName"),
        school_address: data.get("schoolAddress"),
        teacher_name: data.get("ticName"),
        teacher_phone: data.get("ticPhone"),
        coordinator_name: data.get("coordinatorName"),
        coordinator_email: email,
        coordinator_phone: data.get("coordinatorPhone"),
        requires_invitation: invitation === "Yes",
      };

      const res = await fetch("/api/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        toast.warning("Account created but school details could not be saved. Please contact support.");
        console.error("DB insert error:", errData.error);
      }
    }

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 bg-[#020603] relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 pointer-events-none z-0">
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
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="glass-card rounded-2xl p-10 max-w-md w-full text-center z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-emerald-900/40 border-2 border-emerald-800/50 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="text-yellow-400" size={40} />
          </motion.div>
          <h2 className="font-black text-2xl gradient-text-green mb-3">Registration Successful!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Your school coordinator account has been created. Please save your login credentials and proceed to the dashboard.
          </p>
          <Link href="/login">
            <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold tracking-wide shadow-lg shadow-yellow-500/30">
              Go to Coordinator Login
            </Button>
          </Link>
          <Link href="/competition" className="block mt-4 text-muted-foreground text-sm hover:text-yellow-400 transition-colors">
            ← Back to Competition
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 overflow-hidden bg-[#020603]">
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
        <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <Link href="/competition" className="inline-flex items-center gap-2 text-muted-foreground hover:text-yellow-400 transition-colors text-sm mb-8">
          <ArrowLeft size={16} /> Back to Competition
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1
            className="font-black tracking-tight gradient-text-gold mb-3"
            style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)" }}
          >
            School Registration
          </h1>
          <p className="text-muted-foreground text-sm">
            Establish your school&apos;s coordination portal for{" "}
            <span className="text-yellow-400 font-semibold">Ninnadaya &apos;26</span>
          </p>
          <div className="mt-4 w-20 h-px mx-auto bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-60" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass-card rounded-2xl px-6 sm:px-10 py-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-4">
              <p className="text-xs font-bold tracking-widest uppercase text-yellow-400">School Information</p>
              <div className="space-y-1.5">
                <Label htmlFor="schoolName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School Name</Label>
                <Input id="schoolName" name="schoolName" placeholder="Enter the full school name" required className="bg-black/40 border-border focus:border-yellow-500/60 h-12" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schoolAddress" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School Address</Label>
                <Input id="schoolAddress" name="schoolAddress" placeholder="Enter school physical address" required className="bg-black/40 border-border focus:border-yellow-500/60 h-12" />
              </div>
            </div>

            <Separator className="opacity-20" />

            <div className="space-y-4">
              <p className="text-xs font-bold tracking-widest uppercase text-yellow-400">Teacher-in-Charge</p>
              <div className="space-y-1.5">
                <Label htmlFor="ticName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input id="ticName" name="ticName" placeholder="Teacher-in-Charge full name" required className="bg-black/40 border-border focus:border-yellow-500/60 h-12" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ticPhone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                <Input id="ticPhone" name="ticPhone" type="tel" placeholder="e.g. +94 7X XXX XXXX" required className="bg-black/40 border-border focus:border-yellow-500/60 h-12" />
              </div>
            </div>

            <Separator className="opacity-20" />

            <div className="space-y-4">
              <p className="text-xs font-bold tracking-widest uppercase text-yellow-400">Coordinator Account</p>
              <div className="space-y-1.5">
                <Label htmlFor="coordinatorName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input id="coordinatorName" name="coordinatorName" placeholder="Coordinator full name" required className="bg-black/40 border-border focus:border-yellow-500/60 h-12" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coordinatorEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input id="coordinatorEmail" name="coordinatorEmail" type="email" placeholder="coordinator@school.lk" required className="bg-black/40 border-border focus:border-yellow-500/60 h-12" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coordinatorPhone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                <Input id="coordinatorPhone" name="coordinatorPhone" type="tel" placeholder="e.g. +94 7X XXX XXXX" required className="bg-black/40 border-border focus:border-yellow-500/60 h-12" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    required
                    className="bg-black/40 border-border focus:border-yellow-500/60 h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password to confirm"
                    required
                    className="bg-black/40 border-border focus:border-yellow-500/60 h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <Separator className="opacity-20" />

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Do you require a printed copy of the Ninnadaya &apos;26 Invitation Letter?
              </p>
              <div className="flex gap-6">
                {["Yes", "No"].map((val) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="requiresInvitation"
                      value={val}
                      onChange={() => setInvitation(val)}
                      className="accent-yellow-400 w-4 h-4"
                      required
                    />
                    <span className={`text-sm transition-colors ${invitation === val ? "text-yellow-400 font-semibold" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {val}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="glass-card-gold rounded-xl p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-400">For Any Inquiries, Please Contact:</p>
              {[
                { name: "Mr. Jayarathna Bandara", role: "Teacher-in-Charge", phone: "0777287130" },
                { name: "Anuja Jayaweera", role: "President", phone: "0718159221" },
              ].map((c) => (
                <div key={c.name} className="border-t border-yellow-500/10 pt-3 first:border-0 first:pt-0">
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role}</p>
                  <a href={`tel:${c.phone}`} className="text-xs text-yellow-400 font-bold hover:text-yellow-300 transition-colors">📞 {c.phone}</a>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-black tracking-widest uppercase shadow-lg shadow-yellow-500/30 hover:shadow-yellow-400/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Registering…
                </span>
              ) : "Register School"}
            </Button>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-muted-foreground text-sm"
        >
          Already registered?{" "}
          <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
            Sign in to your dashboard →
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
