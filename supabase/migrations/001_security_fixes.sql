-- ============================================================
-- NINNADAYA '26 — Migration 001: Security & integrity fixes
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to run once on top of supabase_schema.sql.
--
-- BEFORE RUNNING: check for duplicate schools per account (the unique
-- constraint below will fail if any exist):
--   select user_id, count(*) from public.schools group by user_id having count(*) > 1;
-- ============================================================


-- ------------------------------------------------------------
-- 1. Schools: one school per account, sane field lengths
-- ------------------------------------------------------------
alter table public.schools
  add constraint schools_user_id_key unique (user_id);

alter table public.schools
  add column if not exists welcome_email_sent_at timestamptz;

-- NOT VALID = enforce for new/updated rows without re-checking old data
alter table public.schools
  add constraint schools_field_lengths check (
    char_length(school_name)       between 2 and 200 and
    char_length(school_address)    between 5 and 500 and
    char_length(teacher_name)      between 2 and 120 and
    char_length(teacher_phone)     between 9 and 20  and
    char_length(coordinator_name)  between 2 and 120 and
    char_length(coordinator_email) between 3 and 254 and
    char_length(coordinator_phone) between 9 and 20
  ) not valid;


-- ------------------------------------------------------------
-- 2. Atomic registration: create the school row in the SAME
--    transaction as the auth user. If the school insert fails,
--    the signup fails too — no more orphaned accounts.
--    The client passes school details as signUp metadata.
-- ------------------------------------------------------------
create or replace function public.handle_new_coordinator()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m jsonb := new.raw_user_meta_data;
begin
  if m ? 'school_name' then
    insert into public.schools (
      user_id, school_name, school_address, teacher_name, teacher_phone,
      coordinator_name, coordinator_email, coordinator_phone, requires_invitation
    ) values (
      new.id,
      trim(m->>'school_name'),
      trim(m->>'school_address'),
      trim(m->>'teacher_name'),
      trim(m->>'teacher_phone'),
      trim(m->>'coordinator_name'),
      new.email,                                   -- always the verified auth email
      trim(m->>'coordinator_phone'),
      coalesce(m->>'requires_invitation', 'false') = 'true'
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.handle_new_coordinator() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_coordinator();


-- ------------------------------------------------------------
-- 3. App settings (registration deadline / open-close switch)
-- ------------------------------------------------------------
create table if not exists public.app_settings (
  id                    boolean primary key default true check (id), -- single row
  registration_open     boolean not null default true,
  registration_deadline timestamptz,
  updated_at            timestamptz default now()
);

insert into public.app_settings (id) values (true) on conflict (id) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "Anyone can read app settings" on public.app_settings;
create policy "Anyone can read app settings"
  on public.app_settings for select
  using (true);
-- No insert/update/delete policies → only the service role (admin) can change it.

create or replace function public.registration_is_open()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select registration_open
            and (registration_deadline is null or now() < registration_deadline)
       from public.app_settings where id),
    true
  );
$$;


-- ------------------------------------------------------------
-- 4. Event categories — single source of truth for the rules
--    (keep src/lib/constants.ts in sync until the UI reads this table)
-- ------------------------------------------------------------
create table if not exists public.event_categories (
  name             text primary key,
  languages        text[] not null default '{}',   -- empty = no language
  age_groups       text[] not null default '{}',   -- empty = 'Open'
  max_per_school   int    not null default 2,      -- per category+language+age group
  is_special       boolean not null default false,
  sort_order       int    not null default 0
);

alter table public.event_categories enable row level security;

drop policy if exists "Anyone can read event categories" on public.event_categories;
create policy "Anyone can read event categories"
  on public.event_categories for select
  using (true);

insert into public.event_categories (name, languages, age_groups, is_special, sort_order) values
  ('Announcing',         '{Sinhala,English}', '{Junior,Intermediate,Senior}', false, 1),
  ('Announcing (Tamil)', '{Tamil}',           '{}',                           false, 2),
  ('Sports Commentary',  '{Sinhala,English}', '{}',                           false, 3),
  ('Dubbing',            '{Sinhala,English}', '{}',                           false, 4),
  ('Cartoon Drawing',    '{Sinhala,English}', '{}',                           false, 5),
  ('Photography',        '{}',                '{}',                           false, 6),
  ('Graphic Designing',  '{Sinhala,English}', '{}',                           false, 7),
  ('Technical',          '{Sinhala,English}', '{}',                           false, 8),
  ('Short Film',         '{Sinhala,English}', '{}',                           false, 9),
  ('Special Event',      '{Sinhala,English}', '{Open}',                       true,  10),
  ('Editing',            '{Sinhala,English}', '{Junior,Intermediate,Senior}', false, 11)
on conflict (name) do update set
  languages = excluded.languages,
  age_groups = excluded.age_groups,
  is_special = excluded.is_special,
  sort_order = excluded.sort_order;


-- ------------------------------------------------------------
-- 5. Contestant rules — enforced server-side (cannot be bypassed
--    by calling the Supabase API directly)
-- ------------------------------------------------------------
alter table public.contestants
  add constraint contestants_full_name_length
  check (char_length(trim(full_name)) between 2 and 120) not valid;

alter table public.contestants
  add constraint contestants_dob_sane
  check (date_of_birth <= current_date and date_of_birth > date '1990-01-01') not valid;

create or replace function public.enforce_contestant_rules()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  cat            public.event_categories%rowtype;
  is_service     boolean := coalesce(auth.role(), '') = 'service_role';
  same_slot      int;
  person_regular int;
begin
  -- Deadline (admins using the service role may still make changes)
  if not is_service and not public.registration_is_open() then
    raise exception 'Registration is closed. Contact the Organizing Committee for changes.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  new.full_name := regexp_replace(trim(new.full_name), '\s+', ' ', 'g');

  select * into cat from public.event_categories where name = new.category;
  if not found then
    raise exception 'Invalid category: %', new.category;
  end if;

  -- Language must match the category
  if cardinality(cat.languages) = 0 then
    new.language := null;
  elsif new.language is null or not (new.language = any(cat.languages)) then
    raise exception 'Please select a valid language for %.', new.category;
  end if;

  -- Age group must match the category
  if cardinality(cat.age_groups) = 0 then
    new.age_group := 'Open';
  elsif new.age_group is null or not (new.age_group = any(cat.age_groups)) then
    raise exception 'Please select a valid age category for %.', new.category;
  end if;

  -- Serialize writes per school so concurrent inserts can't exceed quotas
  perform pg_advisory_xact_lock(hashtext(new.school_id::text));

  -- Rule 1: max N contestants per school per category/language/age group
  if not cat.is_special then
    select count(*) into same_slot
      from public.contestants c
     where c.school_id = new.school_id
       and c.category = new.category
       and c.language is not distinct from new.language
       and c.age_group is not distinct from new.age_group
       and c.id <> new.id;

    if same_slot >= cat.max_per_school then
      raise exception 'Your school has already registered % contestants for % (%). Limit reached.',
        cat.max_per_school, new.category,
        concat_ws(' ', new.language, nullif(new.age_group, 'Open'));
    end if;
  end if;

  -- Rule 2: a student may enter max 1 regular event + 1 special event
  if exists (
    select 1 from public.contestants c
     where c.school_id = new.school_id
       and lower(c.full_name) = lower(new.full_name)
       and c.date_of_birth = new.date_of_birth
       and c.category = new.category
       and c.id <> new.id
  ) then
    raise exception '% is already registered in %.', new.full_name, new.category;
  end if;

  if not cat.is_special then
    select count(*) into person_regular
      from public.contestants c
      join public.event_categories ec on ec.name = c.category
     where c.school_id = new.school_id
       and lower(c.full_name) = lower(new.full_name)
       and c.date_of_birth = new.date_of_birth
       and not ec.is_special
       and c.id <> new.id;

    if person_regular >= 1 then
      raise exception '% is already registered in a regular event. Max 1 regular event and 1 Special Event per student.', new.full_name;
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_contestant_rules() from public, anon, authenticated;

drop trigger if exists contestants_enforce_rules on public.contestants;
create trigger contestants_enforce_rules
  before insert or update or delete on public.contestants
  for each row execute function public.enforce_contestant_rules();

-- Prevent moving a contestant to another school via update
drop policy if exists "Coordinators manage their own contestants" on public.contestants;
create policy "Coordinators manage their own contestants"
  on public.contestants
  for all
  using (
    school_id in (select id from public.schools where user_id = auth.uid())
  )
  with check (
    school_id in (select id from public.schools where user_id = auth.uid())
  );

-- ============================================================
-- Done.
-- To close registration later:
--   update public.app_settings set registration_open = false;
-- or set a deadline:
--   update public.app_settings set registration_deadline = '2026-12-01 23:59:00+05:30';
-- ============================================================

