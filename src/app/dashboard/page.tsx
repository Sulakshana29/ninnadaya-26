"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, Plus, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// ── Types ───────────────────────────────────────────────────────────────
interface Contestant {
  id: string;
  full_name: string;
  date_of_birth: string;
  category: string;
  language: string | null;
  age_category: string;
  created_at: string;
}

import { CATEGORIES, LANGUAGES_BY_CATEGORY, AGE_CATEGORIES_BY_CATEGORY, EVENT_LIMITS } from "@/lib/constants";

// ── Add Contestant Dialog ────────────────────────────────────────────────
const contestantSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  category: z.string().min(1, "Please select a category"),
  language: z.string().optional(),
  age_category: z.string().optional(),
}).refine((data) => {
  const needsLang = !!LANGUAGES_BY_CATEGORY[data.category || ""];
  if (needsLang && !data.language) return false;
  return true;
}, {
  message: "Language is required",
  path: ["language"]
}).refine((data) => {
  const needsAge = !!AGE_CATEGORIES_BY_CATEGORY[data.category || ""];
  if (needsAge && !data.age_category) return false;
  return true;
}, {
  message: "Age category is required",
  path: ["age_category"]
});

type ContestantFormValues = z.infer<typeof contestantSchema>;

function AddContestantDialog({ schoolId, onAdd, contestants }: { schoolId: string, onAdd: (c: Contestant) => void, contestants: Contestant[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<ContestantFormValues>({
    resolver: zodResolver(contestantSchema),
    defaultValues: { full_name: "", date_of_birth: "", category: "", language: "", age_category: "" }
  });

  const selectedCategory = watch("category");
  const needsLanguage = !!LANGUAGES_BY_CATEGORY[selectedCategory];
  const needsAge = !!AGE_CATEGORIES_BY_CATEGORY[selectedCategory];
  const availableLanguages = LANGUAGES_BY_CATEGORY[selectedCategory] ?? [];
  const availableAges = AGE_CATEGORIES_BY_CATEGORY[selectedCategory] ?? [];

  // Reset dependent fields when category changes
  useEffect(() => {
    // We can't easily reset specific fields on change without overriding others, 
    // but the schema validation handles rejecting mismatched data.
  }, [selectedCategory]);

  const onSubmit = async (data: ContestantFormValues) => {
    const ageCategoryToSave = needsAge && data.age_category ? data.age_category : "Open";
    const languageToSave = needsLanguage && data.language ? data.language : null;

    // --- CHECK 1: School Quota Limit (Sub-Category Level) ---
    const sameSubCategoryCount = contestants.filter(c => 
      c.category === data.category && 
      (c.language === languageToSave || (!c.language && !languageToSave)) &&
      c.age_category === ageCategoryToSave
    ).length;

    // Rule: A school can only send 1 contestant per regular category combination.
    if (data.category !== "Special Event" && sameSubCategoryCount >= 1) {
      const details = [languageToSave, ageCategoryToSave !== "Open" ? ageCategoryToSave : ""].filter(Boolean).join(" ");
      toast.error(`Your school has already registered a contestant for ${data.category} ${details ? `(${details})` : ""}. You can only send 1 person per category.`);
      return;
    }

    // --- CHECK 2: Individual Participation Limit ---
    const samePersonEntries = contestants.filter(c => 
      c.full_name.trim().toLowerCase() === data.full_name.trim().toLowerCase() && 
      c.date_of_birth === data.date_of_birth
    );

    const hasRegularEvent = samePersonEntries.some(c => c.category !== "Special Event");
    const hasSpecialEvent = samePersonEntries.some(c => c.category === "Special Event");
    const isAddingSpecialEvent = data.category === "Special Event";

    if (isAddingSpecialEvent && hasSpecialEvent) {
      toast.error(`${data.full_name} is already registered in a Special Event.`);
      return;
    }
    if (!isAddingSpecialEvent && hasRegularEvent) {
      toast.error(`${data.full_name} is already registered in a regular event. They can only enter 1 regular event and 1 Special Event.`);
      return;
    }

    // --- CHECK 3: Global Capacity Limit (API Call) ---
    setLoading(true);
    
    try {
      const limitCheckRes = await fetch("/api/check-global-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: data.category,
          language: languageToSave,
          age_group: ageCategoryToSave,
        }),
      });

      const limitCheckData = await limitCheckRes.json();

      if (!limitCheckRes.ok) {
        toast.error(limitCheckData.error || "Failed to check event capacity.");
        setLoading(false);
        return;
      }
    } catch (err) {
      toast.error("Network error while checking event capacity.");
      setLoading(false);
      return;
    }

    // Passed all checks, proceed to save
    const supabase = createClient();

    const { data: dbData, error } = await supabase
      .from("contestants")
      .insert({
        school_id: schoolId,
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        category: data.category,
        language: data.language || null,
        age_group: ageCategoryToSave,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add contestant: " + error.message);
      setLoading(false);
      return;
    }

    const newContestant: Contestant = {
      id: dbData.id,
      full_name: dbData.full_name,
      date_of_birth: dbData.date_of_birth,
      category: dbData.category,
      language: dbData.language,
      age_category: dbData.age_group,
      created_at: dbData.created_at,
    };

    onAdd(newContestant);
    reset();
    setOpen(false);
    toast.success("Contestant added successfully!");
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold tracking-wide shadow-md shadow-yellow-500/25 transition-all hover:scale-105">
            <Plus size={16} className="mr-2" /> Add Contestant
          </Button>
        }
      />
      <DialogContent className="glass-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black gradient-text-green text-xl">Add Contestant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2" noValidate>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
            <Input
              {...register("full_name")}
              placeholder="Contestant full name"
              className={`bg-black/40 border-border focus:border-yellow-500/60 h-11 ${errors.full_name ? "border-red-500" : ""}`}
            />
            {errors.full_name && <p className="text-red-400 text-xs">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
            <Input
              type="date"
              {...register("date_of_birth")}
              className={`bg-black/40 border-border focus:border-yellow-500/60 h-11 ${errors.date_of_birth ? "border-red-500" : ""}`}
            />
            {errors.date_of_birth && <p className="text-red-400 text-xs">{errors.date_of_birth.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
            <div className="relative">
              <select
                {...register("category")}
                className={`w-full h-11 px-3 bg-black/40 border border-border rounded-md text-sm text-foreground focus:border-yellow-500/60 focus:outline-none appearance-none cursor-pointer ${errors.category ? "border-red-500" : ""}`}
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            {errors.category && <p className="text-red-400 text-xs">{errors.category.message}</p>}
          </div>

          {needsLanguage && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Language</Label>
              <div className="relative">
                <select
                  {...register("language")}
                  className={`w-full h-11 px-3 bg-black/40 border border-border rounded-md text-sm text-foreground focus:border-yellow-500/60 focus:outline-none appearance-none cursor-pointer ${errors.language ? "border-red-500" : ""}`}
                >
                  <option value="" disabled>Select language</option>
                  {availableLanguages.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              {errors.language && <p className="text-red-400 text-xs">{errors.language.message}</p>}
            </div>
          )}

          {needsAge && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age Category</Label>
              <div className="relative">
                <select
                  {...register("age_category")}
                  className={`w-full h-11 px-3 bg-black/40 border border-border rounded-md text-sm text-foreground focus:border-yellow-500/60 focus:outline-none appearance-none cursor-pointer ${errors.age_category ? "border-red-500" : ""}`}
                >
                  <option value="" disabled>Select age category</option>
                  {availableAges.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              {errors.age_category && <p className="text-red-400 text-xs">{errors.age_category.message}</p>}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-yellow-500 hover:bg-yellow-400 text-black font-black tracking-wide mt-2 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Adding…
              </span>
            ) : "Add Contestant"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<{ id: string; name: string; coordinator: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch school details for this user
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (schoolError || !schoolData) {
        toast.error("Registration incomplete. Missing school data. Please contact support.");
        await supabase.auth.signOut();
        router.push("/register");
        return;
      }

      setSchool({
        id: schoolData.id,
        name: schoolData.school_name,
        coordinator: schoolData.coordinator_name,
      });

      // Fetch contestants for this school
      const { data: contestantsData, error: contestantsError } = await supabase
        .from("contestants")
        .select("*")
        .eq("school_id", schoolData.id)
        .order("created_at", { ascending: false });

      if (contestantsError) {
        toast.error("Could not load contestants.");
      } else if (contestantsData) {
        setContestants(
          contestantsData.map(c => ({
            id: c.id,
            full_name: c.full_name,
            date_of_birth: c.date_of_birth,
            category: c.category,
            language: c.language,
            age_category: c.age_group,
            created_at: c.created_at
          }))
        );
      }
      
      setLoading(false);
    }

    loadData();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };
  const handleAdd = (c: Contestant) => setContestants((prev) => [c, ...prev]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contestant? This action cannot be undone.")) return;
    
    setContestants(prev => prev.filter(c => c.id !== id));
    
    const supabase = createClient();
    const { error } = await supabase.from("contestants").delete().eq("id", id);
    
    if (error) {
      toast.error("Failed to delete contestant.");
      // Rollback optimistic update
      router.refresh();
    } else {
      toast.success("Contestant deleted successfully.");
    }
  };

  const categoryCount = new Set(contestants.map((c) => c.category)).size;

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 overflow-hidden">
      {/* Background */}
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

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ── GATEWAY BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Hero heading */}
          <div className="glass-card rounded-2xl px-8 py-10 mb-4 border border-emerald-800/30 relative overflow-hidden">
            {/* Subtle background orb */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(234,179,8,0.07) 0%, transparent 65%)" }} />
            <div className="relative z-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-400/70 mb-2">Coordinator Dashboard</p>
                <h1
                  className="font-black gradient-text-gold"
                  style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", lineHeight: 1.1 }}
                >
                  Ninnadaya Gateway
                </h1>
                <p className="text-muted-foreground text-sm mt-2">Contest management panel</p>
              </div>
            </div>
          </div>

          {/* Info cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "School Registered", value: school?.name ?? "Loading…" },
              { label: "Coordinator Name", value: school?.coordinator ?? "Loading…" },
              { label: "Registration Status", value: "Active ✓" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                className="glass-card rounded-xl px-5 py-4 border border-border/40"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-400/70 mb-1">{item.label}</p>
                <p className="text-foreground font-semibold text-sm">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { icon: <Users size={22} />, label: "Total Contestants", value: contestants.length, color: "emerald" },
            { icon: <Trophy size={22} />, label: "Categories Entered", value: categoryCount, color: "yellow" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card rounded-xl p-5 flex items-start gap-4"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.color === "emerald" ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/25" : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color === "emerald" ? "text-emerald-400" : "text-yellow-400"}`}>
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contestants table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* Table header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-border">
            <div>
              <h2 className="font-black text-lg text-foreground">Contestants</h2>
              <p className="text-muted-foreground text-sm">Manage your school&apos;s competition entries</p>
            </div>
            {school && <AddContestantDialog schoolId={school.id} onAdd={handleAdd} contestants={contestants} />}
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg bg-white/5" />)}
            </div>
          ) : contestants.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-5xl mb-4">🎬</div>
              <p className="font-bold text-foreground mb-2">No contestants yet</p>
              <p className="text-muted-foreground text-sm mb-6">Start adding your school&apos;s contestants for Ninnadaya &apos;26</p>
              {school && <AddContestantDialog schoolId={school.id} onAdd={handleAdd} contestants={contestants} />}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">#</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Name</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">DOB</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Category</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Language</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Age Group</TableHead>
                    <TableHead className="text-right text-muted-foreground text-xs font-bold uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contestants.map((c, i) => (
                    <TableRow key={c.id} className="border-border hover:bg-white/3 transition-colors">
                      <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                      <TableCell className="font-semibold text-foreground text-sm whitespace-nowrap">{c.full_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(c.date_of_birth).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-medium"
                        >
                          {c.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {c.language ?? <span className="text-muted-foreground/40">—</span>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                          {c.age_category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          aria-label="Delete contestant"
                        >
                          <Trash2 size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground/50 text-center mt-6"
        >
          Manage your school's entries carefully. Contact the Organizing Committee for major modifications.
        </motion.p>
      </div>
    </div>
  );
}
