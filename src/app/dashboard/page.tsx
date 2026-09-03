"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, LogOut, Plus, ChevronDown } from "lucide-react";
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

// ── Constants ────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Announcing",
  "News Reporting",
  "Program Presenting",
  "Sports Commentary",
  "Dubbing",
  "Cartoon Drawing",
  "Photography",
  "Videography",
  "Graphic Designing",
  "Technical",
  "Short Film",
  "AI Short Film",
];

const LANGUAGES_BY_CATEGORY: Record<string, string[]> = {
  "Announcing": ["Sinhala", "English", "Tamil"],
  "News Reporting": ["Sinhala", "English", "Tamil"],
  "Program Presenting": ["Sinhala", "English", "Tamil"],
  "Sports Commentary": ["Sinhala", "English", "Tamil"],
  "Dubbing": ["Sinhala", "English", "Tamil"],
  "Technical": ["Sinhala", "English"],
  "Short Film": ["Sinhala", "English", "Tamil"],
  "AI Short Film": ["Sinhala", "English", "Tamil"],
};

const AGE_CATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  "Announcing": ["Junior", "Intermediate", "Senior"],
  "News Reporting": ["Junior", "Intermediate", "Senior"],
  "Program Presenting": ["Junior", "Senior"],
  "Sports Commentary": ["Junior", "Senior"],
  "Dubbing": ["Junior", "Senior"],
};

// ── Add Contestant Dialog ────────────────────────────────────────────────
function AddContestantDialog({ schoolId, onAdd }: { schoolId: string, onAdd: (c: Contestant) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", date_of_birth: "", category: "", language: "", age_category: "" });

  const selectedCategory = form.category;
  const needsLanguage = !!LANGUAGES_BY_CATEGORY[selectedCategory];
  const needsAge = !!AGE_CATEGORIES_BY_CATEGORY[selectedCategory];
  const availableLanguages = LANGUAGES_BY_CATEGORY[selectedCategory] ?? [];
  const availableAges = AGE_CATEGORIES_BY_CATEGORY[selectedCategory] ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    
    // Default age category to "Open" if the selected category doesn't require one
    const ageCategoryToSave = needsAge ? form.age_category : "Open";

    const { data, error } = await supabase
      .from("contestants")
      .insert({
        school_id: schoolId,
        full_name: form.full_name,
        date_of_birth: form.date_of_birth,
        category: form.category,
        language: form.language || null,
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
      id: data.id,
      full_name: data.full_name,
      date_of_birth: data.date_of_birth,
      category: data.category,
      language: data.language,
      age_category: data.age_group,
      created_at: data.created_at,
    };

    onAdd(newContestant);
    setForm({ full_name: "", date_of_birth: "", category: "", language: "", age_category: "" });
    setOpen(false);
    toast.success("Contestant added successfully!");
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="bg-green-500 hover:bg-green-400 text-black font-bold tracking-wide shadow-md shadow-green-500/25 transition-all hover:scale-105">
            <Plus size={16} className="mr-2" /> Add Contestant
          </Button>
        }
      />
      <DialogContent className="glass-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black gradient-text-green text-xl">Add Contestant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Contestant full name"
              required
              className="bg-black/40 border-border focus:border-green-500/60 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
            <Input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              required
              className="bg-black/40 border-border focus:border-green-500/60 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value, language: "", age_category: "" })}
                required
                className="w-full h-11 px-3 bg-black/40 border border-border rounded-md text-sm text-foreground focus:border-green-500/60 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {needsLanguage && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Language</Label>
              <div className="relative">
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  required
                  className="w-full h-11 px-3 bg-black/40 border border-border rounded-md text-sm text-foreground focus:border-green-500/60 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select language</option>
                  {availableLanguages.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {needsAge && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age Category</Label>
              <div className="relative">
                <select
                  value={form.age_category}
                  onChange={(e) => setForm({ ...form, age_category: e.target.value })}
                  required
                  className="w-full h-11 px-3 bg-black/40 border border-border rounded-md text-sm text-foreground focus:border-green-500/60 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select age category</option>
                  {availableAges.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-green-500 hover:bg-green-400 text-black font-black tracking-wide mt-2 transition-all"
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
        toast.error("Could not load school data.");
        setLoading(false);
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

  const categoryCount = new Set(contestants.map((c) => c.category)).size;

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb" style={{ width: "min(500px,80vw)", height: "min(500px,80vw)", top: "-10%", right: "-10%", background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 65%)" }} />
        <div className="orb" style={{ width: "min(400px,70vw)", height: "min(400px,70vw)", bottom: "5%", left: "-10%", background: "radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 65%)" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-1">Coordinator Dashboard</p>
            <h1 className="text-2xl font-black text-foreground">{school ? school.name : <Skeleton className="h-8 w-64 bg-black/40" />}</h1>
            {school ? (
              <p className="text-muted-foreground text-sm mt-0.5">{school.coordinator}</p>
            ) : (
              <Skeleton className="h-4 w-40 mt-2 bg-black/40" />
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-border text-muted-foreground hover:text-red-400 hover:border-red-400/40 hover:bg-red-500/5 transition-all w-fit"
          >
            <LogOut size={14} className="mr-2" /> Sign Out
          </Button>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Users size={22} />, label: "Total Contestants", value: contestants.length, color: "green" },
            { icon: <Trophy size={22} />, label: "Categories Entered", value: categoryCount, color: "yellow" },
            { icon: <Trophy size={22} />, label: "Registration Status", value: "Active", color: "green", isText: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`glass-card rounded-xl p-5 flex items-start gap-4 ${i === 2 ? "col-span-2 lg:col-span-1" : ""}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.color === "green" ? "bg-green-500/15 text-green-400 border border-green-500/25" : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color === "green" ? "gradient-text-green" : "gradient-text-gold"}`}>
                  {stat.isText ? <span className="text-base font-bold text-green-400">{stat.value}</span> : stat.value}
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
            {school && <AddContestantDialog schoolId={school.id} onAdd={handleAdd} />}
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
              <AddContestantDialog onAdd={handleAdd} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">#</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Name</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider hidden sm:table-cell">DOB</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Category</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider hidden md:table-cell">Language</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider hidden lg:table-cell">Age Group</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contestants.map((c, i) => (
                    <TableRow key={c.id} className="border-border hover:bg-white/3 transition-colors">
                      <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">{c.full_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                        {new Date(c.date_of_birth).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs border-green-500/30 text-green-400 bg-green-500/10 font-medium"
                        >
                          {c.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                        {c.language ?? <span className="text-muted-foreground/40">—</span>}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                          {c.age_category}
                        </Badge>
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
          ⚠️ Contestant entries cannot be deleted once added. Contact the Organizing Committee for any modifications.
        </motion.p>
      </div>
    </div>
  );
}
