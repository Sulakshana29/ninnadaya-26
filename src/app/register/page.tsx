"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z.object({
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  schoolAddress: z.string().min(5, "Address is too short"),
  ticName: z.string().min(2, "Teacher name must be at least 2 characters"),
  ticPhone: z.string().regex(/^\+?[\d\s-]{9,15}$/, "Invalid phone number"),
  coordinatorName: z.string().min(2, "Coordinator name must be at least 2 characters"),
  coordinatorEmail: z.string().email("Invalid email address"),
  coordinatorPhone: z.string().regex(/^\+?[\d\s-]{9,15}$/, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  requiresInvitation: z.enum(["Yes", "No"], {
    message: "Please select an option",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const invitation = watch("requiresInvitation");

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

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    const supabase = createClient();

    // 1. Create the auth account
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.coordinatorEmail,
      password: data.password,
      options: {
        data: {
          school_name: data.schoolName,
          coordinator_name: data.coordinatorName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // 2. Save school details via secure API route (bypasses RLS during signup)
    if (authData.user) {
      const payload = {
        user_id: authData.user.id,
        school_name: data.schoolName,
        school_address: data.schoolAddress,
        teacher_name: data.ticName,
        teacher_phone: data.ticPhone,
        coordinator_name: data.coordinatorName,
        coordinator_email: data.coordinatorEmail,
        coordinator_phone: data.coordinatorPhone,
        requires_invitation: data.requiresInvitation === "Yes",
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
    <div className="relative min-h-screen pt-24 pb-16 px-4">      <div className="relative z-10 max-w-2xl mx-auto">
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs font-bold tracking-widest uppercase text-yellow-400">School Information</p>
              <div className="space-y-1.5">
                <Label htmlFor="schoolName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School Name</Label>
                <Input id="schoolName" {...register("schoolName")} placeholder="Enter the full school name" className={`bg-black/40 border-border focus:border-yellow-500/60 h-12 ${errors.schoolName ? "border-red-500/50" : ""}`} />
                {errors.schoolName && <p className="text-red-400 text-xs mt-1">{errors.schoolName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schoolAddress" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School Address</Label>
                <Input id="schoolAddress" {...register("schoolAddress")} placeholder="Enter school physical address" className={`bg-black/40 border-border focus:border-yellow-500/60 h-12 ${errors.schoolAddress ? "border-red-500/50" : ""}`} />
                {errors.schoolAddress && <p className="text-red-400 text-xs mt-1">{errors.schoolAddress.message}</p>}
              </div>
            </div>

            <Separator className="opacity-20" />

            <div className="space-y-4">
              <p className="text-xs font-bold tracking-widest uppercase text-yellow-400">Teacher-in-Charge</p>
              <div className="space-y-1.5">
                <Label htmlFor="ticName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input id="ticName" {...register("ticName")} placeholder="Teacher-in-Charge full name" className={`bg-black/40 border-border focus:border-yellow-500/60 h-12 ${errors.ticName ? "border-red-500/50" : ""}`} />
                {errors.ticName && <p className="text-red-400 text-xs mt-1">{errors.ticName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ticPhone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                <Input id="ticPhone" {...register("ticPhone")} type="tel" placeholder="e.g. +94 7X XXX XXXX" className={`bg-black/40 border-border focus:border-yellow-500/60 h-12 ${errors.ticPhone ? "border-red-500/50" : ""}`} />
                {errors.ticPhone && <p className="text-red-400 text-xs mt-1">{errors.ticPhone.message}</p>}
              </div>
            </div>

            <Separator className="opacity-20" />

            <div className="space-y-4">
              <p className="text-xs font-bold tracking-widest uppercase text-yellow-400">Coordinator Account</p>
              <div className="space-y-1.5">
                <Label htmlFor="coordinatorName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input id="coordinatorName" {...register("coordinatorName")} placeholder="Coordinator full name" className={`bg-black/40 border-border focus:border-yellow-500/60 h-12 ${errors.coordinatorName ? "border-red-500/50" : ""}`} />
                {errors.coordinatorName && <p className="text-red-400 text-xs mt-1">{errors.coordinatorName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coordinatorEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input id="coordinatorEmail" {...register("coordinatorEmail")} type="email" placeholder="coordinator@school.lk" className={`bg-black/40 border-border focus:border-yellow-500/60 h-12 ${errors.coordinatorEmail ? "border-red-500/50" : ""}`} />
                {errors.coordinatorEmail && <p className="text-red-400 text-xs mt-1">{errors.coordinatorEmail.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coordinatorPhone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                <Input id="coordinatorPhone" {...register("coordinatorPhone")} type="tel" placeholder="e.g. +94 7X XXX XXXX" className={`bg-black/40 border-border focus:border-yellow-500/60 h-12 ${errors.coordinatorPhone ? "border-red-500/50" : ""}`} />
                {errors.coordinatorPhone && <p className="text-red-400 text-xs mt-1">{errors.coordinatorPhone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    className={`bg-black/40 border-border focus:border-yellow-500/60 h-12 pr-12 ${errors.password ? "border-red-500/50" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password to confirm"
                    className={`bg-black/40 border-border focus:border-yellow-500/60 h-12 pr-12 ${errors.confirmPassword ? "border-red-500/50" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
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
                      value={val}
                      {...register("requiresInvitation")}
                      className="accent-yellow-400 w-4 h-4"
                    />
                    <span className={`text-sm transition-colors ${invitation === val ? "text-yellow-400 font-semibold" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {val}
                    </span>
                  </label>
                ))}
              </div>
              {errors.requiresInvitation && <p className="text-red-400 text-xs mt-1">{errors.requiresInvitation.message}</p>}
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
              disabled={isSubmitting}
              className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-black tracking-widest uppercase shadow-lg shadow-yellow-500/30 hover:shadow-yellow-400/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
            >
              {isSubmitting ? (
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
