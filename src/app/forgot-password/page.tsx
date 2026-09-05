"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setError(null);
    const supabase = createClient();
    
    // Determine the base URL for the reset link redirect
    const origin = window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      return;
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
          <h2 className="font-black text-2xl gradient-text-green mb-3">Check Your Email</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            If an account exists with that email, we have sent a password reset link. Please check your inbox and spam folder.
          </p>
          <Link href="/login">
            <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold tracking-wide shadow-lg shadow-yellow-500/30">
              Return to Login
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">

      <div className="relative z-10 w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-yellow-400 transition-colors text-sm mb-8">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="glass-card rounded-2xl px-8 py-8"
        >
          <h1 className="text-xl font-black text-foreground mb-2">Reset Password</h1>
          <p className="text-muted-foreground text-sm mb-6">Enter your registered email address and we will send you a link to reset your password.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="coordinator@school.lk"
                className={`bg-black/40 border-border focus:border-yellow-500/60 h-12 ${errors.email ? "border-red-500/50" : ""}`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-black tracking-widest uppercase shadow-lg shadow-yellow-500/30 hover:shadow-yellow-400/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Sending...
                </span>
              ) : "Send Reset Link"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
