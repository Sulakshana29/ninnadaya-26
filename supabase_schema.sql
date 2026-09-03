-- ============================================================
-- NINNADAYA '26 - Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Schools table — one row per registered school
create table if not exists public.schools (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  school_name      text not null,
  school_address   text not null,
  teacher_name     text not null,
  teacher_phone    text not null,
  coordinator_name  text not null,
  coordinator_email text not null,
  coordinator_phone text not null,
  requires_invitation boolean default false,
  created_at       timestamptz default now()
);

-- 2. Contestants table — many contestants per school
create table if not exists public.contestants (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  full_name     text not null,
  date_of_birth date not null,
  category      text not null,
  language      text,
  age_group     text,
  created_at    timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — very important for security!
-- ============================================================

-- Enable RLS on both tables
alter table public.schools enable row level security;
alter table public.contestants enable row level security;

-- Schools: a coordinator can only see/edit THEIR OWN school
create policy "Coordinators manage their own school"
  on public.schools
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Contestants: a coordinator can only see/manage contestants 
-- belonging to their own school
create policy "Coordinators manage their own contestants"
  on public.contestants
  for all
  using (
    school_id in (
      select id from public.schools where user_id = auth.uid()
    )
  )
  with check (
    school_id in (
      select id from public.schools where user_id = auth.uid()
    )
  );

-- ============================================================
-- Done! Your database is now secure and ready.
-- ============================================================
