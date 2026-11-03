-- ============================================================
-- NINNADAYA '26 — Migration 002: Phase 2 Competition Engine Foundation
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ------------------------------------------------------------
-- 1. Upgrade app_settings with Competition & Points controls
-- ------------------------------------------------------------
alter table public.app_settings
  add column if not exists competition_name text not null default 'Ninnadaya ''26',
  add column if not exists results_published boolean not null default false,
  add column if not exists points_first int not null default 5,
  add column if not exists points_second int not null default 3,
  add column if not exists points_third int not null default 1;

-- ------------------------------------------------------------
-- 2. Upgrade event_categories with Format, Timers, Briefs & Rubrics
-- ------------------------------------------------------------
alter table public.event_categories
  add column if not exists code_prefix text not null default 'EVT',
  add column if not exists event_format text not null default 'live'
    check (event_format in ('live', 'timed', 'submission')),
  add column if not exists submission_mode text not null default 'none'
    check (submission_mode in ('none', 'file', 'link', 'both')),
  add column if not exists task_brief text,
  add column if not exists resource_url text,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists rubric jsonb not null default '[
    {"id": "c1", "label": "Technical Skill & Execution", "max": 30},
    {"id": "c2", "label": "Creativity & Originality", "max": 30},
    {"id": "c3", "label": "Presentation & Impact", "max": 20},
    {"id": "c4", "label": "Adherence to Theme / Brief", "max": 20}
  ]'::jsonb;

-- Seed sensible defaults for each Ninnadaya '26 category
update public.event_categories set
  code_prefix = 'ANN',
  event_format = 'live',
  submission_mode = 'none',
  rubric = '[
    {"id": "voice", "label": "Voice Modulation & Clarity", "max": 30},
    {"id": "pronunciation", "label": "Pronunciation & Language Flow", "max": 30},
    {"id": "confidence", "label": "Confidence & Stage Presence", "max": 20},
    {"id": "pacing", "label": "Time Management & Pacing", "max": 20}
  ]'::jsonb
where name = 'Announcing';

update public.event_categories set
  code_prefix = 'ANT',
  event_format = 'live',
  submission_mode = 'none',
  rubric = '[
    {"id": "voice", "label": "Voice Modulation & Clarity", "max": 30},
    {"id": "pronunciation", "label": "Pronunciation & Language Flow", "max": 30},
    {"id": "confidence", "label": "Confidence & Stage Presence", "max": 20},
    {"id": "pacing", "label": "Time Management & Pacing", "max": 20}
  ]'::jsonb
where name = 'Announcing (Tamil)';

update public.event_categories set
  code_prefix = 'SPC',
  event_format = 'live',
  submission_mode = 'none',
  rubric = '[
    {"id": "energy", "label": "Energy, Pace & Spontaneity", "max": 30},
    {"id": "accuracy", "label": "Play-by-Play Accuracy & Terminology", "max": 30},
    {"id": "voice", "label": "Voice Control & Articulation", "max": 20},
    {"id": "engagement", "label": "Audience Engagement", "max": 20}
  ]'::jsonb
where name = 'Sports Commentary';

update public.event_categories set
  code_prefix = 'DUB',
  event_format = 'live',
  submission_mode = 'none',
  rubric = '[
    {"id": "sync", "label": "Lip Sync & Timing Accuracy", "max": 35},
    {"id": "emotion", "label": "Character Voice & Emotion", "max": 35},
    {"id": "clarity", "label": "Clarity & Diction", "max": 30}
  ]'::jsonb
where name = 'Dubbing';

update public.event_categories set
  code_prefix = 'CRT',
  event_format = 'timed',
  submission_mode = 'file',
  rubric = '[
    {"id": "concept", "label": "Satire, Concept & Message", "max": 35},
    {"id": "art", "label": "Drawing Style & Line Work", "max": 35},
    {"id": "impact", "label": "Visual Impact & Originality", "max": 30}
  ]'::jsonb
where name = 'Cartoon Drawing';

update public.event_categories set
  code_prefix = 'PHO',
  event_format = 'submission',
  submission_mode = 'file',
  rubric = '[
    {"id": "composition", "label": "Composition & Framing", "max": 30},
    {"id": "lighting", "label": "Lighting & Exposure", "max": 30},
    {"id": "story", "label": "Storytelling & Theme Relevance", "max": 25},
    {"id": "originality", "label": "Originality", "max": 15}
  ]'::jsonb
where name = 'Photography';

update public.event_categories set
  code_prefix = 'GRD',
  event_format = 'timed',
  submission_mode = 'both',
  rubric = '[
    {"id": "visual", "label": "Visual Hierarchy & Layout", "max": 30},
    {"id": "creativity", "label": "Creativity & Concept", "max": 30},
    {"id": "typography", "label": "Typography & Color Theory", "max": 20},
    {"id": "relevance", "label": "Relevance to Brief", "max": 20}
  ]'::jsonb
where name = 'Graphic Designing';

update public.event_categories set
  code_prefix = 'TEC',
  event_format = 'timed',
  submission_mode = 'both',
  rubric = '[
    {"id": "accuracy", "label": "Technical Accuracy & Knowledge", "max": 40},
    {"id": "problem", "label": "Problem Solving & Execution", "max": 35},
    {"id": "speed", "label": "Completeness & Clarity", "max": 25}
  ]'::jsonb
where name = 'Technical';

update public.event_categories set
  code_prefix = 'SHF',
  event_format = 'submission',
  submission_mode = 'link',
  rubric = '[
    {"id": "story", "label": "Screenplay, Direction & Storytelling", "max": 30},
    {"id": "camera", "label": "Cinematography & Lighting", "max": 25},
    {"id": "editing", "label": "Editing & Sound Design", "max": 25},
    {"id": "acting", "label": "Performance & Overall Impact", "max": 20}
  ]'::jsonb
where name = 'Short Film';

update public.event_categories set
  code_prefix = 'SPE',
  event_format = 'submission',
  submission_mode = 'both',
  rubric = '[
    {"id": "creativity", "label": "Creativity & Concept", "max": 35},
    {"id": "execution", "label": "Technical Execution", "max": 35},
    {"id": "impact", "label": "Presentation & Impact", "max": 30}
  ]'::jsonb
where name = 'Special Event';

update public.event_categories set
  code_prefix = 'EDT',
  event_format = 'timed',
  submission_mode = 'both',
  rubric = '[
    {"id": "pacing", "label": "Pacing, Rhythm & Cuts", "max": 30},
    {"id": "story", "label": "Narrative Flow from Raw Footage", "max": 30},
    {"id": "audio", "label": "Audio Mixing & Sound Sync", "max": 20},
    {"id": "color", "label": "Color & Visual Polish", "max": 20}
  ]'::jsonb
where name = 'Editing';


-- ------------------------------------------------------------
-- 3. Anonymous Entry Codes on contestants (e.g. ANN-S-SR-001)
-- ------------------------------------------------------------
alter table public.contestants
  add column if not exists entry_code text unique;

create sequence if not exists public.contestant_code_seq start 1;

create or replace function public.generate_entry_code(
  p_category text,
  p_language text,
  p_age_group text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prefix text;
  v_lang   text := '';
  v_age    text := '';
  v_num    bigint;
begin
  select coalesce(code_prefix, 'EVT') into v_prefix
    from public.event_categories
   where name = p_category;

  if v_prefix is null then
    v_prefix := 'EVT';
  end if;

  if p_language is not null and p_language <> '' then
    v_lang := '-' || upper(left(p_language, 1));
  end if;

  if p_age_group is not null and p_age_group <> '' and p_age_group <> 'Open' then
    v_age := '-' || case p_age_group
      when 'Junior' then 'JR'
      when 'Intermediate' then 'IN'
      when 'Senior' then 'SR'
      else upper(left(p_age_group, 2))
    end;
  end if;

  v_num := nextval('public.contestant_code_seq');
  return v_prefix || v_lang || v_age || '-' || lpad(v_num::text, 3, '0');
end;
$$;

create or replace function public.assign_contestant_entry_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.entry_code is null or new.entry_code = '' then
    new.entry_code := public.generate_entry_code(new.category, new.language, new.age_group);
  end if;
  return new;
end;
$$;

drop trigger if exists contestants_assign_code on public.contestants;
create trigger contestants_assign_code
  before insert on public.contestants
  for each row execute function public.assign_contestant_entry_code();

-- Temporarily relax the DOB constraint and rule trigger while backfilling existing rows
-- (some already-registered rows have a typo in birth year, e.g. 2026 instead of 2011)
alter table public.contestants drop constraint if exists contestants_dob_sane;
alter table public.contestants disable trigger contestants_enforce_rules;

-- Backfill any existing contestants that don't have an entry_code yet
update public.contestants
   set entry_code = public.generate_entry_code(category, language, age_group)
 where entry_code is null;

-- Re-enable trigger and re-add DOB check as NOT VALID (applies to new/edited rows only)
alter table public.contestants enable trigger contestants_enforce_rules;
alter table public.contestants
  add constraint contestants_dob_sane
  check (date_of_birth <= current_date and date_of_birth > date '1990-01-01') not valid;


-- ------------------------------------------------------------
-- 4. Submissions, Judges & Scores tables (ready for Milestones 2–4)
-- ------------------------------------------------------------
create table if not exists public.submissions (
  id             uuid primary key default gen_random_uuid(),
  contestant_id  uuid not null unique references public.contestants(id) on delete cascade,
  file_url       text,
  file_name      text,
  external_url   text,
  notes          text,
  submitted_by   text not null default 'contestant' check (submitted_by in ('contestant', 'coordinator', 'admin')),
  submitted_at   timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.submissions enable row level security;

drop policy if exists "Coordinators manage their school submissions" on public.submissions;
create policy "Coordinators manage their school submissions"
  on public.submissions
  for all
  using (
    contestant_id in (
      select c.id from public.contestants c
      join public.schools s on s.id = c.school_id
      where s.user_id = auth.uid()
    )
  )
  with check (
    contestant_id in (
      select c.id from public.contestants c
      join public.schools s on s.id = c.school_id
      where s.user_id = auth.uid()
    )
  );

create table if not exists public.judges (
  id                  uuid primary key default gen_random_uuid(),
  full_name           text not null,
  access_code         text not null unique,
  assigned_categories text[] not null default '{}',
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

alter table public.judges enable row level security;

create table if not exists public.scores (
  id             uuid primary key default gen_random_uuid(),
  contestant_id  uuid not null references public.contestants(id) on delete cascade,
  judge_id       uuid not null references public.judges(id) on delete cascade,
  breakdown      jsonb not null default '{}'::jsonb,
  total_score    numeric(6,2) not null default 0,
  comments       text,
  submitted_at   timestamptz not null default now(),
  unique (contestant_id, judge_id)
);

alter table public.scores enable row level security;

-- Create public 'submissions' storage bucket for direct file uploads (images/PDFs/designs)
insert into storage.buckets (id, name, public, file_size_limit)
values ('submissions', 'submissions', true, 52428800)
on conflict (id) do nothing;

