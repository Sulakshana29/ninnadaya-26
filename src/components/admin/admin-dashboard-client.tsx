"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  ArrowUpDown,
  School,
  Users,
  Trophy,
  Sliders,
  BarChart3,
  Mic,
  Timer,
  Upload,
  Plus,
  Trash2,
  Save,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  X,
} from "lucide-react";
import {
  CATEGORIES,
  LANGUAGES_BY_CATEGORY,
  AGE_CATEGORIES_BY_CATEGORY,
} from "@/lib/constants";
import { toast } from "sonner";

export interface RubricCriterion {
  id: string;
  label: string;
  max: number;
}

export interface EventCategoryConfig {
  name: string;
  code_prefix?: string;
  languages?: string[];
  age_groups?: string[];
  max_per_school?: number;
  is_special?: boolean;
  sort_order?: number;
  event_format?: "live" | "timed" | "submission";
  submission_mode?: "none" | "file" | "link" | "both";
  task_brief?: string | null;
  resource_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  rubric?: RubricCriterion[];
}

export interface AppSettings {
  registration_open: boolean;
  registration_deadline: string | null;
  results_published?: boolean;
  points_first?: number;
  points_second?: number;
  points_third?: number;
}

const DEFAULT_RUBRIC: RubricCriterion[] = [
  { id: "c1", label: "Technical Skill & Execution", max: 30 },
  { id: "c2", label: "Creativity & Originality", max: 30 },
  { id: "c3", label: "Presentation & Impact", max: 20 },
  { id: "c4", label: "Adherence to Theme / Brief", max: 20 },
];

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function EventEditorCard({
  event,
  onSaved,
}: {
  event: EventCategoryConfig;
  onSaved: (updated: EventCategoryConfig) => void;
}) {
  const [format, setFormat] = useState<"live" | "timed" | "submission">(
    event.event_format || "live"
  );
  const [subMode, setSubMode] = useState<"none" | "file" | "link" | "both">(
    event.submission_mode || (format === "live" ? "none" : "both")
  );
  const [brief, setBrief] = useState(event.task_brief || "");
  const [resourceUrl, setResourceUrl] = useState(event.resource_url || "");
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(event.starts_at));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(event.ends_at));
  const [rubric, setRubric] = useState<RubricCriterion[]>(
    Array.isArray(event.rubric) && event.rubric.length > 0
      ? event.rubric
      : DEFAULT_RUBRIC
  );
  const [saving, setSaving] = useState(false);

  const totalMaxScore = rubric.reduce((sum, r) => sum + (Number(r.max) || 0), 0);

  const handleFormatChange = (next: "live" | "timed" | "submission") => {
    setFormat(next);
    if (next === "live") setSubMode("none");
    else if (subMode === "none") setSubMode("both");
  };

  const updateCriterion = (
    idx: number,
    field: "label" | "max",
    value: string | number
  ) => {
    setRubric((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]:
                field === "max" ? Math.max(1, Number(value) || 0) : String(value),
            }
          : item
      )
    );
  };

  const addCriterion = () => {
    if (rubric.length >= 8) {
      toast.error("Maximum 8 rubric criteria per category.");
      return;
    }
    setRubric((prev) => [
      ...prev,
      { id: `c_${Date.now()}`, label: "New Criterion", max: 10 },
    ]);
  };

  const removeCriterion = (idx: number) => {
    if (rubric.length <= 1) {
      toast.error("At least 1 rubric criterion is required.");
      return;
    }
    setRubric((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: event.name,
        event_format: format,
        submission_mode: format === "live" ? "none" : subMode,
        task_brief: brief.trim() || null,
        resource_url: resourceUrl.trim() || null,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        rubric,
      };

      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save event");

      onSaved(data.event);
      toast.success(`${event.name} configuration saved!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pt-2 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Competition Format
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "live", label: "Live Stage", icon: <Mic size={14} /> },
              { id: "timed", label: "Timed Task", icon: <Timer size={14} /> },
              { id: "submission", label: "Submission", icon: <Upload size={14} /> },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  handleFormatChange(opt.id as "live" | "timed" | "submission")
                }
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                  format === opt.id
                    ? "border-yellow-500/60 bg-yellow-500/15 text-yellow-400"
                    : "border-white/10 bg-black/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {format === "live" &&
              "Performed live on stage. Judges score anonymous Entry Codes on their devices."}
            {format === "timed" &&
              "Brief & raw assets stay locked until Start Time. Contestants upload before End Time."}
            {format === "submission" &&
              "Open upload window for pre-created work (e.g. Short Film, Photography) until deadline."}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Accepted Upload Mode
          </Label>
          <select
            value={format === "live" ? "none" : subMode}
            disabled={format === "live"}
            onChange={(e) =>
              setSubMode(e.target.value as "none" | "file" | "link" | "both")
            }
            className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-foreground focus:border-yellow-500/60 focus:outline-none disabled:opacity-40"
          >
            <option value="none">No Upload Needed (Live Stage)</option>
            <option value="file">
              Direct File Upload Only (Images / PDF / ZIP &lt;50MB)
            </option>
            <option value="link">
              External Video / Drive Link Only (YouTube / Google Drive)
            </option>
            <option value="both">
              Both Direct File Upload OR Video/Drive Link
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {format === "timed"
              ? "Task Unlock / Start Time"
              : "Window Opens At (Optional)"}
          </Label>
          <Input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="bg-black/40 border-white/10 h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {format === "timed"
              ? "Hard Stop / Timer End"
              : "Submission Deadline (Optional)"}
          </Label>
          <Input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="bg-black/40 border-white/10 h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Task Brief / Topic / Instructions{" "}
            {format === "timed" && (
              <span className="text-yellow-400">(Hidden until Start Time)</span>
            )}
          </Label>
          <textarea
            rows={3}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Enter the topic, rules, or surprise prompt for contestants..."
            className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-sm text-foreground focus:border-yellow-500/60 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resource / Raw Footage Pack Link (Optional)
          </Label>
          <Input
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
            placeholder="https://drive.google.com/... (raw footage, audio clip, etc.)"
            className="bg-black/40 border-white/10 h-10"
          />
          <p className="text-[11px] text-muted-foreground">
            For Editing, Dubbing, or Graphic Design: link to the raw assets pack.
            Hidden until the timer starts.
          </p>
        </div>
      </div>

      <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400">
              Judging Rubric Criteria
            </h4>
            <p className="text-xs text-muted-foreground">
              Total Max Score:{" "}
              <span className="font-bold text-emerald-400">
                {totalMaxScore} pts
              </span>
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCriterion}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-xs h-8"
          >
            <Plus size={13} className="mr-1" /> Add Criterion
          </Button>
        </div>

        <div className="space-y-2">
          {rubric.map((crit, idx) => (
            <div key={crit.id || idx} className="flex items-center gap-2">
              <Input
                value={crit.label}
                onChange={(e) => updateCriterion(idx, "label", e.target.value)}
                placeholder="Criterion name (e.g. Voice Modulation)"
                className="bg-black/40 border-white/10 h-9 text-sm flex-1"
              />
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={crit.max}
                  onChange={(e) => updateCriterion(idx, "max", e.target.value)}
                  className="bg-black/40 border-white/10 h-9 w-20 text-sm text-center font-bold"
                />
                <span className="text-xs text-muted-foreground">pts</span>
              </div>
              <button
                type="button"
                onClick={() => removeCriterion(idx)}
                className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                aria-label="Remove criterion"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs tracking-wide"
        >
          <Save size={14} className="mr-1.5" />
          {saving ? "Saving…" : `Save ${event.name}`}
        </Button>
      </div>
    </div>
  );
}

type AdminTab = "contestants" | "schools" | "categories" | "events";

export function AdminDashboardClient({
  schools,
  contestants,
  initialEvents = [],
  initialSettings,
}: {
  schools: any[];
  contestants: any[];
  initialEvents?: EventCategoryConfig[];
  initialSettings?: AppSettings;
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>("contestants");

  // Contestants filters & sorting
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [languageFilter, setLanguageFilter] = useState<string>("ALL");
  const [ageFilter, setAgeFilter] = useState<string>("ALL");
  const [schoolFilter, setSchoolFilter] = useState<string>("ALL");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Schools filters
  const [schoolSearch, setSchoolSearch] = useState("");
  const [invitationOnly, setInvitationOnly] = useState(false);

  const [settings, setSettings] = useState<AppSettings>(
    initialSettings || {
      registration_open: true,
      registration_deadline: null,
      results_published: false,
      points_first: 5,
      points_second: 3,
      points_third: 1,
    }
  );
  const [savingSettings, setSavingSettings] = useState(false);

  const [events, setEvents] = useState<EventCategoryConfig[]>(() => {
    const byName = new Map(initialEvents.map((e) => [e.name, e]));
    return CATEGORIES.map(
      (name) =>
        byName.get(name) || {
          name,
          event_format: "live",
          submission_mode: "none",
          rubric: DEFAULT_RUBRIC,
        }
    );
  });

  const handleToggleRegistration = async () => {
    setSavingSettings(true);
    const nextOpen = !settings.registration_open;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_open: nextOpen }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");
      setSettings((prev) => ({ ...prev, registration_open: nextOpen }));
      toast.success(
        nextOpen
          ? "School & contestant registration is now OPEN."
          : "Registration is now CLOSED. Coordinators can no longer add/remove contestants."
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Could not update setting"
      );
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Counts & Aggregations ──
  const categoryCounts = contestants.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const contestantsPerSchool = contestants.reduce((acc, curr) => {
    const sId = curr.school_id;
    if (sId) acc[sId] = (acc[sId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const invitationCount = schools.filter((s) => s.requires_invitation).length;

  // ── Contestants Filtering & Sorting ──
  const filteredContestants = contestants.filter((c) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const nameMatch = c.full_name?.toLowerCase().includes(q);
      const schoolMatch = c.schools?.school_name?.toLowerCase().includes(q);
      const codeMatch = c.entry_code?.toLowerCase().includes(q);
      if (!nameMatch && !schoolMatch && !codeMatch) return false;
    }
    if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false;
    if (languageFilter !== "ALL") {
      if (languageFilter === "NONE" && c.language) return false;
      if (languageFilter !== "NONE" && c.language !== languageFilter)
        return false;
    }
    if (ageFilter !== "ALL" && (c.age_group || "Open") !== ageFilter)
      return false;
    if (schoolFilter !== "ALL" && c.schools?.school_name !== schoolFilter)
      return false;
    return true;
  });

  const sortedContestants = [...filteredContestants].sort((a, b) => {
    if (!sortConfig) return 0;

    let aVal = a[sortConfig.key] ?? "";
    let bVal = b[sortConfig.key] ?? "";

    if (sortConfig.key === "school_name") {
      aVal = a.schools?.school_name || "";
      bVal = b.schools?.school_name || "";
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const hasActiveFilters =
    search !== "" ||
    categoryFilter !== "ALL" ||
    languageFilter !== "ALL" ||
    ageFilter !== "ALL" ||
    schoolFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
    setLanguageFilter("ALL");
    setAgeFilter("ALL");
    setSchoolFilter("ALL");
  };

  // ── Schools Filtering ──
  const filteredSchools = schools.filter((s) => {
    if (invitationOnly && !s.requires_invitation) return false;
    const q = schoolSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      s.school_name?.toLowerCase().includes(q) ||
      s.coordinator_name?.toLowerCase().includes(q) ||
      s.coordinator_email?.toLowerCase().includes(q) ||
      s.teacher_name?.toLowerCase().includes(q) ||
      s.school_address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── KPI Summary Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("contestants")}
          className="glass-card p-5 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all text-left flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              Contestants
            </p>
            <p className="text-2xl font-black text-foreground">
              {contestants.length}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schools")}
          className="glass-card p-5 rounded-2xl border border-white/10 hover:border-blue-500/40 transition-all text-left flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <School size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              Registered Schools
            </p>
            <p className="text-2xl font-black text-foreground">
              {schools.length}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className="glass-card p-5 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all text-left flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              Active Categories
            </p>
            <p className="text-2xl font-black text-foreground">
              {Object.keys(categoryCounts).length}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {CATEGORIES.length}
              </span>
            </p>
          </div>
        </button>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">
              Portal Registration
            </p>
            <div className="flex items-center gap-2">
              {settings.registration_open ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs">
                  OPEN
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs">
                  LOCKED
                </Badge>
              )}
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={savingSettings}
            onClick={handleToggleRegistration}
            className={`text-xs font-bold border shrink-0 ${
              settings.registration_open
                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {settings.registration_open ? (
              <>
                <Lock size={13} className="mr-1.5" /> Lock
              </>
            ) : (
              <>
                <Unlock size={13} className="mr-1.5" /> Unlock
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Navigation Bar ── */}
      <div className="flex flex-wrap items-center gap-2 glass-card p-2 rounded-2xl border border-white/10">
        {[
          {
            id: "contestants",
            label: "Contestants",
            count: contestants.length,
            icon: <Users size={15} />,
          },
          {
            id: "schools",
            label: "Registered Schools",
            count: schools.length,
            icon: <School size={15} />,
          },
          {
            id: "categories",
            label: "Category Breakdown",
            count: CATEGORIES.length,
            icon: <BarChart3 size={15} />,
          },
          {
            id: "events",
            label: "Event & Rubric Manager",
            count: null,
            icon: <Sliders size={15} />,
          },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                active
                  ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                    active
                      ? "bg-black/20 text-black"
                      : "bg-white/10 text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: CONTESTANTS (Full-Width Table + Multi-Filter Bar) ── */}
      {activeTab === "contestants" && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          {/* Header & Filters */}
          <div className="p-6 border-b border-border/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-black text-xl text-foreground">
                  Contestants Directory
                </h2>
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="text-foreground font-bold">
                    {sortedContestants.length}
                  </span>{" "}
                  of {contestants.length} registered contestants
                </p>
              </div>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-xs self-start sm:self-auto"
                >
                  <X size={13} className="mr-1" /> Clear Filters
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search Entry Code, student name, or school..."
                  className="pl-9 bg-black/40 border-white/10 focus:border-yellow-500/50 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-foreground focus:border-yellow-500/50 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c} ({categoryCounts[c] || 0})
                  </option>
                ))}
              </select>

              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-foreground focus:border-yellow-500/50 focus:outline-none"
              >
                <option value="ALL">All Languages</option>
                <option value="Sinhala">Sinhala</option>
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="NONE">No Language (Open)</option>
              </select>

              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-foreground focus:border-yellow-500/50 focus:outline-none"
              >
                <option value="ALL">All Age Groups</option>
                <option value="Junior">Junior</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Senior">Senior</option>
                <option value="Open">Open</option>
              </select>
            </div>
          </div>

          {/* Full-width aligned table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/30">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead
                    className="w-36 font-bold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                    onClick={() => handleSort("entry_code")}
                  >
                    Entry Code <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                  <TableHead
                    className="font-bold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                    onClick={() => handleSort("full_name")}
                  >
                    Student Name <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                  <TableHead
                    className="font-bold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                    onClick={() => handleSort("school_name")}
                  >
                    School <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                  <TableHead
                    className="font-bold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                    onClick={() => handleSort("category")}
                  >
                    Category <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                  <TableHead
                    className="w-28 font-bold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                    onClick={() => handleSort("language")}
                  >
                    Language <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                  <TableHead
                    className="w-32 font-bold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                    onClick={() => handleSort("age_group")}
                  >
                    Age Group <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                  <TableHead
                    className="w-32 font-bold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                    onClick={() => handleSort("date_of_birth")}
                  >
                    DOB <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContestants.length === 0 ? (
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableCell
                      colSpan={7}
                      className="h-36 text-center text-muted-foreground"
                    >
                      No contestants match your current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedContestants.map((c: any) => (
                    <TableRow
                      key={c.id}
                      className="border-border/40 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="whitespace-nowrap">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                          {c.entry_code || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground whitespace-nowrap">
                        {c.full_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            setSchoolFilter(
                              schoolFilter === c.schools?.school_name
                                ? "ALL"
                                : c.schools?.school_name || "ALL"
                            )
                          }
                          className="hover:text-yellow-400 transition-colors text-left"
                          title="Click to filter by this school"
                        >
                          {c.schools?.school_name || "Unknown"}
                        </button>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium"
                        >
                          {c.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {c.language ?? (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="border-white/15 bg-white/5 text-foreground text-xs"
                        >
                          {c.age_group || "Open"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap font-mono">
                        {c.date_of_birth}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── TAB 2: REGISTERED SCHOOLS (Full-Width Aligned Directory) ── */}
      {activeTab === "schools" && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-black text-xl text-foreground">
                Registered Schools Directory
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredSchools.length} of {schools.length} schools •{" "}
                <span className="text-yellow-400 font-semibold">
                  {invitationCount} requested printed invitation
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search school, coordinator, teacher..."
                  className="pl-9 bg-black/40 border-white/10 focus:border-yellow-500/50 h-10"
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setInvitationOnly((v) => !v)}
                className={`h-10 px-3.5 rounded-lg border text-xs font-bold transition-all ${
                  invitationOnly
                    ? "border-yellow-500/60 bg-yellow-500/15 text-yellow-400"
                    : "border-white/10 bg-black/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                Needs Invitation ({invitationCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/30">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    School &amp; Address
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Coordinator
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Teacher-in-Charge
                  </TableHead>
                  <TableHead className="w-32 text-center font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Entries
                  </TableHead>
                  <TableHead className="w-36 text-center font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Invitation
                  </TableHead>
                  <TableHead className="w-28 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Registered
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.length === 0 ? (
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="h-36 text-center text-muted-foreground"
                    >
                      No schools found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((s: any) => {
                    const entryCount = contestantsPerSchool[s.id] || 0;
                    return (
                      <TableRow
                        key={s.id}
                        className="border-border/40 hover:bg-white/5 transition-colors align-top"
                      >
                        <TableCell className="py-4">
                          <p className="font-bold text-foreground text-sm">
                            {s.school_name}
                          </p>
                          {s.school_address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin size={12} className="shrink-0" />
                              <span>{s.school_address}</span>
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="py-4 whitespace-nowrap">
                          <p className="font-semibold text-sm text-foreground">
                            {s.coordinator_name}
                          </p>
                          <div className="flex flex-col gap-0.5 mt-1 text-xs text-muted-foreground">
                            {s.coordinator_phone && (
                              <a
                                href={`tel:${s.coordinator_phone}`}
                                className="inline-flex items-center gap-1.5 hover:text-yellow-400"
                              >
                                <Phone size={11} /> {s.coordinator_phone}
                              </a>
                            )}
                            {s.coordinator_email && (
                              <a
                                href={`mailto:${s.coordinator_email}`}
                                className="inline-flex items-center gap-1.5 hover:text-yellow-400"
                              >
                                <Mail size={11} /> {s.coordinator_email}
                              </a>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-4 whitespace-nowrap">
                          <p className="font-semibold text-sm text-foreground">
                            {s.teacher_name || "—"}
                          </p>
                          {s.teacher_phone && (
                            <a
                              href={`tel:${s.teacher_phone}`}
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-yellow-400 mt-1"
                            >
                              <Phone size={11} /> {s.teacher_phone}
                            </a>
                          )}
                        </TableCell>

                        <TableCell className="py-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSchoolFilter(s.school_name);
                              setActiveTab("contestants");
                            }}
                            className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                            title="View this school's contestants"
                          >
                            {entryCount} students
                          </button>
                        </TableCell>

                        <TableCell className="py-4 text-center">
                          {s.requires_invitation ? (
                            <Badge
                              variant="outline"
                              className="border-yellow-500/40 text-yellow-400 bg-yellow-500/10 text-xs"
                            >
                              Printed Copy
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              Not Needed
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="py-4 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(s.created_at).toLocaleDateString("en-GB")}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── TAB 3: CATEGORY BREAKDOWN ── */}
      {activeTab === "categories" && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-black text-xl">Category &amp; Sub-Category Breakdown</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click any sub-category card to jump directly to those contestants
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {CATEGORIES.map((category) => {
              const langs = LANGUAGES_BY_CATEGORY[category] || [null];
              const ages = AGE_CATEGORIES_BY_CATEGORY[category] || ["Open"];
              const totalInCategory = categoryCounts[category] || 0;

              return (
                <div
                  key={category}
                  className="bg-black/30 rounded-2xl border border-white/10 p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="font-black text-base text-foreground">
                      {category}
                    </h3>
                    <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      {totalInCategory} total
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {langs.map((lang, index) => (
                      <div key={lang || `all-${index}`} className="space-y-2">
                        {lang && (
                          <p className="text-[11px] font-bold text-yellow-400 uppercase tracking-widest">
                            {lang}
                          </p>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ages.map((age) => {
                            const count = contestants.filter((c) => {
                              if (c.category !== category) return false;
                              if (lang && c.language !== lang) return false;
                              if (!lang && c.language) return false;
                              const cAge = c.age_group || "Open";
                              return cAge === age;
                            }).length;

                            return (
                              <button
                                key={age}
                                type="button"
                                onClick={() => {
                                  setCategoryFilter(category);
                                  setLanguageFilter(lang || "NONE");
                                  setAgeFilter(age);
                                  setActiveTab("contestants");
                                }}
                                className="bg-black/50 hover:bg-white/5 p-3 rounded-xl border border-white/5 hover:border-yellow-500/40 flex items-center justify-between transition-all text-left"
                              >
                                <span className="text-xs font-medium text-muted-foreground">
                                  {age}
                                </span>
                                <span className="text-lg font-black text-emerald-400">
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: EVENT & RUBRIC MANAGER ── */}
      {activeTab === "events" && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-black text-xl">
              Competition Event &amp; Rubric Manager
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure how each category runs (Live Stage, Timed Task, or
              Pre-Submission), set countdown timers &amp; surprise prompts, and
              customize judging rubrics.
            </p>
          </div>
          <div className="p-6">
            <Accordion className="w-full space-y-3">
              {events.map((ev) => {
                const formatBadge =
                  ev.event_format === "timed"
                    ? {
                        label: "Timed Task",
                        cls: "border-amber-500/30 text-amber-400 bg-amber-500/10",
                      }
                    : ev.event_format === "submission"
                    ? {
                        label: "Submission",
                        cls: "border-blue-500/30 text-blue-400 bg-blue-500/10",
                      }
                    : {
                        label: "Live Stage",
                        cls: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
                      };

                return (
                  <AccordionItem
                    key={ev.name}
                    value={ev.name}
                    className="bg-black/20 rounded-xl border border-white/5 px-4 overflow-hidden border-b-0"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          {ev.code_prefix && (
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 text-yellow-400 border border-yellow-500/20">
                              {ev.code_prefix}
                            </span>
                          )}
                          <h3 className="font-bold text-lg text-foreground">
                            {ev.name}
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${formatBadge.cls}`}
                        >
                          {formatBadge.label}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <EventEditorCard
                        event={ev}
                        onSaved={(updated) =>
                          setEvents((prev) =>
                            prev.map((item) =>
                              item.name === updated.name ? updated : item
                            )
                          )
                        }
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
}
