"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function UserAvatar() {
  const [coordinator, setCoordinator] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase
        .from("schools")
        .select("coordinator_name, school_name")
        .eq("user_id", session.user.id)
        .single();
      if (data) {
        setCoordinator(data.coordinator_name);
        setSchoolName(data.school_name);
      } else {
        // Ghost account detected (Auth exists but no school record)
        // Force sign out so they aren't stuck without a logout button
        await supabase.auth.signOut();
        router.push("/register");
        router.refresh();
      }
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initial = coordinator ? coordinator.trim()[0]?.toUpperCase() : "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm flex items-center justify-center shadow-lg shadow-yellow-500/30 transition-all duration-200 hover:scale-105"
        aria-label="Profile menu"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-56 glass-card rounded-xl border border-border/60 shadow-xl shadow-black/40 overflow-hidden z-50">
          {/* Profile info */}
          <div className="px-4 py-4 border-b border-border/40">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-yellow-500 text-black font-black text-sm flex items-center justify-center flex-shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-foreground text-xs font-bold truncate">{coordinator}</p>
                <p className="text-muted-foreground text-xs truncate">{schoolName}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => { router.push("/dashboard"); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <User size={14} />
              Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
