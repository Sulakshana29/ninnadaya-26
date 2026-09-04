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
import { SmokyBackground } from "@/components/layout/smoky-background";

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
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6 rounded-2xl border-t border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <School size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Schools</p>
                  <p className="text-3xl font-black">{schools.length}</p>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl border-t border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Contestants</p>
                  <p className="text-3xl font-black">{contestants.length}</p>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl border-t border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Categories</p>
                  <p className="text-3xl font-black">{Object.keys(categoryCounts).length}</p>
                </div>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Contestants Table (Spans 2 columns) */}
              <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden border-t border-white/5">
                <div className="p-6 border-b border-border/50">
                  <h2 className="font-black text-xl">All Contestants</h2>
                  <p className="text-sm text-muted-foreground mt-1">Live feed of all registrations across the country</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-black/20">
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="font-bold text-muted-foreground">Name</TableHead>
                        <TableHead className="font-bold text-muted-foreground">School</TableHead>
                        <TableHead className="font-bold text-muted-foreground">Category</TableHead>
                        <TableHead className="font-bold text-muted-foreground">Age</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contestants.length === 0 ? (
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                            No contestants registered yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        contestants.map((c: any) => (
                          <TableRow key={c.id} className="border-border/50 hover:bg-white/5">
                            <TableCell className="font-medium">{c.full_name}</TableCell>
                            <TableCell className="text-muted-foreground">{c.schools?.school_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-white/10 bg-white/5 text-foreground">
                                {c.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{c.age_group}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Schools Summary (Spans 1 column) */}
              <div className="glass-card rounded-2xl overflow-hidden border-t border-white/5 h-fit">
                <div className="p-6 border-b border-border/50">
                  <h2 className="font-black text-xl">Registered Schools</h2>
                </div>
                <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
                  {schools.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No schools registered.</div>
                  ) : (
                    schools.map((s: any) => (
                      <div key={s.id} className="p-4 hover:bg-white/5 transition-colors">
                        <h3 className="font-bold text-sm mb-1">{s.school_name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{s.coordinator_name} ({s.coordinator_phone})</p>
                        {s.requires_invitation && (
                          <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10 text-[10px] px-1.5">
                            Needs Invitation Letter
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
