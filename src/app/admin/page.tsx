import { createAdminClient } from "@/lib/supabase/admin";
import { ExportButton } from "@/components/admin/export-button";
import { Users, School, Trophy, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let schools = [];
  let contestants = [];
  let error = null;

  try {
    const supabase = createAdminClient();

    // Fetch all schools
    const { data: schoolsData, error: schoolsError } = await supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (schoolsError) throw schoolsError;
    schools = schoolsData || [];

    // Fetch all contestants
    const { data: contestantsData, error: contestantsError } = await supabase
      .from("contestants")
      .select(`
        *,
        schools (
          school_name
        )
      `)
      .order("created_at", { ascending: false });

    if (contestantsError) throw contestantsError;
    contestants = contestantsData || [];

  } catch (err: any) {
    console.error("Admin fetch error:", err);
    error = err.message || "Failed to load data. Did you add the SUPABASE_SERVICE_ROLE_KEY to .env.local?";
  }

  // Format data for export
  const exportData = contestants.map(c => ({
    "Contestant Name": c.full_name,
    "Date of Birth": c.date_of_birth,
    "School": c.schools?.school_name || "Unknown",
    "Category": c.category,
    "Age Group": c.age_group,
    "Language": c.language || "N/A",
    "Registered Date": new Date(c.created_at).toLocaleDateString(),
  }));

  const categoryCounts = contestants.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-border/50 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Master Admin Portal</p>
            <h1 className="text-3xl font-black text-foreground">Ninnadaya '26 Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <ExportButton data={exportData} />
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-medium"
            >
              <LogOut size={14} /> Exit Admin
            </Link>
          </div>
        </div>

        {error ? (
          <div className="glass-card p-6 border-red-500/50 text-red-400 mb-8 rounded-xl text-center">
            <h3 className="font-bold mb-2">Error Loading Data</h3>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : (
          <AdminDashboardClient schools={schools} contestants={contestants} />
        )}
      </div>
    </div>
  );
}
