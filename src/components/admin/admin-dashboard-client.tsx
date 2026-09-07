"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Search, ArrowUpDown, School, Users, Trophy } from "lucide-react";
import { CATEGORIES, LANGUAGES_BY_CATEGORY, AGE_CATEGORIES_BY_CATEGORY } from "@/lib/constants";
import { motion } from "framer-motion";

export function AdminDashboardClient({ schools, contestants }: { schools: any[], contestants: any[] }) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  // ── Capacity Tracker ──
  const categoryCounts = contestants.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ── Search & Sort Logic ──
  const filteredContestants = contestants.filter(c => {
    const q = search.toLowerCase();
    const nameMatch = c.full_name?.toLowerCase().includes(q);
    const schoolMatch = c.schools?.school_name?.toLowerCase().includes(q);
    return nameMatch || schoolMatch;
  });

  const sortedContestants = [...filteredContestants].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    // Handle nested school name
    if (sortConfig.key === "school_name") {
      aVal = a.schools?.school_name || "";
      bVal = b.schools?.school_name || "";
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      {/* ── Stats Row ── */}
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

      {/* ── Registration Counter ── */}
      <div className="glass-card rounded-2xl overflow-hidden border-t border-white/5 mb-8">
        <div className="p-6 border-b border-border/50">
          <h2 className="font-black text-xl">Registration Stats</h2>
          <p className="text-sm text-muted-foreground mt-1">Live count of registrations across all specific sub-categories (Language & Age)</p>
        </div>
        <div className="p-6">
          <Accordion className="w-full space-y-4">
            {CATEGORIES.map(category => {
              const langs = LANGUAGES_BY_CATEGORY[category] || [null];
              const ages = AGE_CATEGORIES_BY_CATEGORY[category] || ["Open"];

              return (
                <AccordionItem key={category} value={category} className="bg-black/20 rounded-xl border border-white/5 px-4 overflow-hidden border-b-0">
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
                          {ages.map(age => {
                            // Calculate exact count for this sub-category
                            const count = contestants.filter(c => {
                              if (c.category !== category) return false;
                              if (lang && c.language !== lang) return false;
                              if (!lang && c.language) return false;
                              const cAge = c.age_group || "Open";
                              if (cAge !== age) return false;
                              return true;
                            }).length;

                            return (
                              <div key={age} className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                <h5 className="font-semibold text-sm text-foreground">{age}</h5>
                                <div className="text-right">
                                  <span className="text-2xl font-black text-emerald-400">{count}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest block -mt-1">Registered</span>
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
              <p className="text-sm text-muted-foreground mt-1">Live feed of all registrations across the country</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input 
                placeholder="Search name or school..." 
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
                  <TableHead className="font-bold text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors" onClick={() => handleSort('full_name')}>
                    Name <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                  <TableHead className="font-bold text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors" onClick={() => handleSort('school_name')}>
                    School <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                  <TableHead className="font-bold text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors" onClick={() => handleSort('category')}>
                    Category <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                  <TableHead className="font-bold text-muted-foreground cursor-pointer hover:text-yellow-400 transition-colors" onClick={() => handleSort('age_group')}>
                    Age <ArrowUpDown className="inline ml-1 size-3" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContestants.length === 0 ? (
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No contestants found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedContestants.map((c: any) => (
                    <TableRow key={c.id} className="border-border/50 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium whitespace-nowrap">{c.full_name}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{c.schools?.school_name}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="border-white/10 bg-white/5 text-foreground">
                          {c.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{c.age_group}</TableCell>
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
              <div className="p-8 text-center text-muted-foreground">No schools registered.</div>
            ) : (
              schools.map((s: any) => (
                <div key={s.id} className="p-4 hover:bg-white/5 transition-colors">
                  <h3 className="font-bold text-sm mb-1">{s.school_name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{s.coordinator_name} ({s.coordinator_phone})</p>
                  {s.requires_invitation && (
                    <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10 text-[10px] px-1.5">
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
  );
}
