import { createAdminClient } from "@/lib/supabase/admin";
import { ExportButton } from "@/components/admin/export-button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-session";
import { AdminLogoutButton } from "@/components/admin/logout-button";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Defense in depth: verify the signed admin session here too, not only in the proxy
  const cookieStore = await cookies();
  if (!(await verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  let schools: any[] = [];
  let contestants: any[] = [];
  let eventCategories: any[] = [];
  let settings: any = {
    registration_open: true,
    registration_deadline: null,
    results_published: false,
    points_first: 5,
    points_second: 3,
    points_third: 1,
  };
  let error: string | null = null;

  try {
    const supabase = createAdminClient();

    const [schoolsRes, contestantsRes, categoriesRes, settingsRes] = await Promise.all([
      supabase.from("schools").select("*").order("created_at", { ascending: false }),
      supabase
        .from("contestants")
        .select(`*, schools ( school_name )`)
        .order("created_at", { ascending: false }),
      supabase.from("event_categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("app_settings").select("*").eq("id", true).maybeSingle(),
    ]);

    if (schoolsRes.error) throw schoolsRes.error;
    if (contestantsRes.error) throw contestantsRes.error;

    schools = schoolsRes.data || [];
    contestants = contestantsRes.data || [];
    eventCategories = categoriesRes.data || [];
    if (settingsRes.data) settings = { ...settings, ...settingsRes.data };
  } catch (err: any) {
    console.error("Admin fetch error:", err);
    error =
      err.message ||
      "Failed to load data. Did you add the SUPABASE_SERVICE_ROLE_KEY to .env.local?";
  }

  // Format data for export (now includes anonymous Entry Code)
  const exportData = contestants.map((c) => ({
    "Entry Code": c.entry_code || "Pending",
    "Contestant Name": c.full_name,
    "Date of Birth": c.date_of_birth,
    School: c.schools?.school_name || "Unknown",
    Category: c.category,
    "Age Group": c.age_group,
    Language: c.language || "N/A",
    "Registered Date": new Date(c.created_at).toLocaleDateString(),
  }));

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 overflow-hidden bg-[#020603]">
      {/* Background Image */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            backgroundImage: 'url("/images/bg-smoke.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-border/50 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">
              Master Admin Portal
            </p>
            <h1 className="text-3xl font-black text-foreground">
              Ninnadaya &apos;26 Control Center
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ExportButton data={exportData} />
            <AdminLogoutButton />
          </div>
        </div>

        {error ? (
          <div className="glass-card p-6 border-red-500/50 text-red-400 mb-8 rounded-xl text-center">
            <h3 className="font-bold mb-2">Error Loading Data</h3>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : (
          <AdminDashboardClient
            schools={schools}
            contestants={contestants}
            initialEvents={eventCategories}
            initialSettings={settings}
          />
        )}
      </div>
    </div>
  );
}
