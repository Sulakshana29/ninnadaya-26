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
  LayoutDashboard,
  Mic,
  Timer,
  Upload,
  Plus,
  Trash2,
  Save,
  Lock,
  Unlock,
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
              [field]: field === "max" ? Math.max(1, Number(value) || 0) : String(value),
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
      {/* Format & Submission Mode */}
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
            <option value="file">Direct File Upload Only (Images / PDF / ZIP &lt;50MB)</option>
            <option value="link">External Video / Drive Link Only (YouTube / Google Drive)</option>
            <option value="both">Both Direct File Upload OR Video/Drive Link</option>
          </select>
        </div>
      </div>

      {/* Time Window & Brief (for Timed / Submission or Live Script) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {format === "timed" ? "Task Unlock / Start Time" : "Window Opens At (Optional)"}
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
            {format === "timed" ? "Hard Stop / Timer End" : "Submission Deadline (Optional)"}
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
            For Editing, Dubbing, or Graphic Design: link to the raw assets pack. Hidden until the timer starts.
          </p>
        </div>
      </div>

      {/* Judging Rubric */}
      <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400">
              Judging Rubric Criteria
            </h4>
            <p className="text-xs text-muted-foreground">
              Total Max Score:{" "}
              <span className="font-bold text-emerald-400">{totalMaxScore} pts</span>
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
  const [activeTab, setActiveTab] = useState<"overview" | "events">("overview");
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

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

  // Merge DB event rows with CATEGORIES fallback so it works even before 002 SQL is run
  const [events, setEvents] = useState<EventCategoryConfig[]>(() => {
    const byName = new Map(initialEvents.map((e) => [e.name, e]));
    return CATEGORIES.map((name) => byName.get(name) || { name, event_format: "live", submission_mode: "none", rubric: DEFAULT_RUBRIC });
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
      toast.error(err instanceof Error ? err.message : "Could not update setting");
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Capacity Tracker ──
  const categoryCounts = contestants.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ── Search & Sort Logic ──
  const filteredContestants = contestants.filter((c) => {
    const q = search.toLowerCase();
    const nameMatch = c.full_name?.toLowerCase().includes(q);
    const schoolMatch = c.schools?.school_name?.toLowerCase().includes(q);
    const codeMatch = c.entry_code?.toLowerCase().includes(q);
    return nameMatch || schoolMatch || codeMatch;
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
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      {/* ── Top Control Bar: Tabs + Registration Status Switch ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 glass-card p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "overview"
                ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <LayoutDashboard size={16} /> Overview & Registrations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "events"
                ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Sliders size={16} /> Event & Rubric Manager
          </button>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground uppercase tracking-wider font-bold">
              Registration:
            </span>
            {settings.registration_open ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                OPEN
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border border-red-500/40">
                LOCKED
              </Badge>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={savingSettings}
            onClick={handleToggleRegistration}
            className={`text-xs font-bold border ${
              settings.registration_open
                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {settings.registration_open ? (
              <>
                <Lock size={13} className="mr-1.5" /> Close Registration
              </>
            ) : (
              <>
                <Unlock size={13} className="mr-1.5" /> Re-open Registration
              </>
            )}
          </Button>
        </div>
      </div>

      {activeTab === "events" ? (
        <div className="glass-card rounded-2xl overflow-hidden border-t border-white/5 mb-8">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-black text-xl">Competition Event & Rubric Manager</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure how each category runs (Live Stage, Timed Task, or Pre-Submission), set countdown timers & surprise prompts, and customize judging rubrics.
            </p>
          </div>
          <div className="p-6">
            <Accordion className="w-full space-y-4">
              {events.map((ev) => {
                const formatBadge =
                  ev.event_format === "timed"
                    ? { label: "Timed Task", cls: "border-amber-500/30 text-amber-400 bg-amber-500/10" }
                    : ev.event_format === "submission"
                    ? { label: "Submission", cls: "border-blue-500/30 text-blue-400 bg-blue-500/10" }
                    : { label: "Live Stage", cls: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" };

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
                          <h3 className="font-bold text-lg text-foreground">{ev.name}</h3>
                        </div>
                        <Badge variant="outline" className={`text-xs ${formatBadge.cls}`}>
                          {formatBadge.label}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <EventEditorCard
                        event={ev}
                        onSaved={(updated) =>
                          setEvents((prev) =>
                            prev.map((item) => (item.name === updated.name ? updated : item))
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
      ) : (
        <>
          {/* ── Stats Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6 rounded-2xl border-t border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <School size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  Total Schools
                </p>
                <p className="text-3xl font-black">{schools.length}</p>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl border-t border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  Total Contestants
                </p>
                <p className="text-3xl font-black">{contestants.length}</p>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl border-t border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  Active Categories
                </p>
                <p className="text-3xl font-black">{Object.keys(categoryCounts).length}</p>
              </div>
            </div>
          </div>

          {/* ── Registration Counter ── */}
          <div className="glass-card rounded-2xl overflow-hidden border-t border-white/5 mb-8">
            <div className="p-6 border-b border-border/50">
              <h2 className="font-black text-xl">Registration Stats</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Live count of registrations across all specific sub-categories (Language & Age)
              </p>
            </div>
            <div className="p-6">
              <Accordion className="w-full space-y-4">
                {CATEGORIES.map((category) => {
                  const langs = LANGUAGES_BY_CATEGORY[category] || [null];
                  const ages = AGE_CATEGORIES_BY_CATEGORY[category] || ["Open"];

                  return (
                    <AccordionItem
                      key={category}
                      value={category}
                      className="bg-black/20 rounded-xl border border-white/5 px-4 overflow-hidden border-b-0"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full pr-4">
                          <h3 className="font-bold text-lg text-foreground">{category}</h3>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-6 space-y-6">
                        {langs.map((lang, index) => (
                          <div key={lang || `all-${index}`} className="space-y-4">
                            {lang && (
                              <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-widest border-b border-white/5 pb-2">
                                {lang}
                              </h4>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {ages.map((age) => {
                                const count = contestants.filter((c) => {
                                  if (c.category !== category) return false;
                                  if (lang && c.language !== lang) return false;
                                  if (!lang && c.language) return false;
                                  const cAge = c.age_group || "Open";
                                  if (cAge !== age) return false;
                                  return true;
                                }).length;

                                return (
                                  <div
                                    key={age}
                                    className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between"
                                  >
                                    <h5 className="font-semibold text-sm text-foreground">{age}</h5>
                                    <div className="text-right">
                                      <span className="text-2xl font-black text-emerald-400">
                                        {count}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest block -mt-1">
                                        Registered
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </div>

          {/* ── Tables Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contestants Table */}
            <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden border-t border-white/5">
              <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h2 className="font-black text-xl">All Contestants</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Search by student name, school, or anonymous Entry Code
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    placeholder="Search code, name, school..."
                    className="pl-9 bg-black/40 border-white/10 focus:border-yellow-500/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-black/20">
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead
                        className="font-bold text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                        onClick={() => handleSort("entry_code")}
                      >
                        Code <ArrowUpDown className="inline ml-1 size-3" />
                      </TableHead>
                      <TableHead
                        className="font-bold text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                        onClick={() => handleSort("full_name")}
                      >
                        Name <ArrowUpDown className="inline ml-1 size-3" />
                      </TableHead>
                      <TableHead
                        className="font-bold text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                        onClick={() => handleSort("school_name")}
                      >
                        School <ArrowUpDown className="inline ml-1 size-3" />
                      </TableHead>
                      <TableHead
                        className="font-bold text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                        onClick={() => handleSort("category")}
                      >
                        Category <ArrowUpDown className="inline ml-1 size-3" />
                      </TableHead>
                      <TableHead
                        className="font-bold text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                        onClick={() => handleSort("language")}
                      >
                        Language <ArrowUpDown className="inline ml-1 size-3" />
                      </TableHead>
                      <TableHead
                        className="font-bold text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors"
                        onClick={() => handleSort("age_group")}
                      >
                        Age <ArrowUpDown className="inline ml-1 size-3" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedContestants.length === 0 ? (
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No contestants found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedContestants.map((c: any) => (
                        <TableRow
                          key={c.id}
                          className="border-border/50 hover:bg-white/5 transition-colors"
                        >
                          <TableCell className="whitespace-nowrap">
                            <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                              {c.entry_code || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            {c.full_name}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {c.schools?.school_name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className="border-white/10 bg-white/5 text-foreground"
                            >
                              {c.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {c.language ?? <span className="text-muted-foreground/30">—</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {c.age_group}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Schools Summary */}
            <div className="glass-card rounded-2xl overflow-hidden border-t border-white/5 h-fit">
              <div className="p-6 border-b border-border/50">
                <h2 className="font-black text-xl">Registered Schools</h2>
              </div>
              <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
                {schools.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No schools registered.
                  </div>
                ) : (
                  schools.map((s: any) => (
                    <div key={s.id} className="p-4 hover:bg-white/5 transition-colors">
                      <h3 className="font-bold text-sm mb-1">{s.school_name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {s.coordinator_name} ({s.coordinator_phone})
                      </p>
                      {s.requires_invitation && (
                        <Badge
                          variant="outline"
                          className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10 text-[10px] px-1.5"
                        >
                          Needs Invitation
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
    </>
  );
}
