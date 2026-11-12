-- Public course catalog for the standalone law coaching pages.
-- Run this in the Supabase SQL Editor, then add confirmed prices, schedules,
-- faculty and policy details before setting is_published = true.

create table if not exists public.law_courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  batch_start_date date,
  language text not null default 'Hindi + English',
  duration_label text not null default '',
  price_amount integer,
  price_currency text not null default 'INR',
  discount_label text,
  enrollment_url text,
  demo_url text,
  refund_policy_summary text,
  refund_policy_url text,
  class_schedule text,
  course_validity text,
  learning_mode text,
  hero_image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.law_course_benefits (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.law_courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  icon text not null default '✓',
  position integer not null default 0,
  unique (course_id, position)
);

create table if not exists public.law_course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.law_courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  position integer not null default 0,
  unique (course_id, position)
);

create table if not exists public.law_module_items (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.law_course_modules(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  unique (module_id, position)
);

create table if not exists public.law_course_tests (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.law_courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  icon text not null default '✓',
  position integer not null default 0,
  unique (course_id, position)
);

create table if not exists public.law_course_faculty (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.law_courses(id) on delete cascade,
  name text not null,
  qualification text not null default '',
  photo_url text,
  position integer not null default 0,
  unique (course_id, position)
);

comment on column public.law_courses.price_amount is 'Course price in whole currency units, e.g. INR rupees, not paise.';
comment on column public.law_courses.enrollment_url is 'Public checkout or enrollment URL; can be null until checkout is configured.';
comment on column public.law_courses.demo_url is 'Public free demo booking URL; can be null until booking is configured.';

create index if not exists law_course_benefits_course_position_idx on public.law_course_benefits(course_id, position);
create index if not exists law_course_modules_course_position_idx on public.law_course_modules(course_id, position);
create index if not exists law_module_items_module_position_idx on public.law_module_items(module_id, position);
create index if not exists law_course_tests_course_position_idx on public.law_course_tests(course_id, position);
create index if not exists law_course_faculty_course_position_idx on public.law_course_faculty(course_id, position);

alter table public.law_courses enable row level security;
alter table public.law_course_benefits enable row level security;
alter table public.law_course_modules enable row level security;
alter table public.law_module_items enable row level security;
alter table public.law_course_tests enable row level security;
alter table public.law_course_faculty enable row level security;

revoke all on public.law_courses, public.law_course_benefits, public.law_course_modules,
  public.law_module_items, public.law_course_tests, public.law_course_faculty
from anon, authenticated;

grant select on public.law_courses, public.law_course_benefits, public.law_course_modules,
  public.law_module_items, public.law_course_tests, public.law_course_faculty
to anon, authenticated;

drop policy if exists "Public can read published courses" on public.law_courses;
create policy "Public can read published courses" on public.law_courses
  for select to anon, authenticated using (is_published = true);

drop policy if exists "Public can read published course benefits" on public.law_course_benefits;
create policy "Public can read published course benefits" on public.law_course_benefits
  for select to anon, authenticated using (
    exists (select 1 from public.law_courses c where c.id = course_id and c.is_published = true)
  );

drop policy if exists "Public can read published modules" on public.law_course_modules;
create policy "Public can read published modules" on public.law_course_modules
  for select to anon, authenticated using (
    exists (select 1 from public.law_courses c where c.id = course_id and c.is_published = true)
  );

drop policy if exists "Public can read items in published modules" on public.law_module_items;
create policy "Public can read items in published modules" on public.law_module_items
  for select to anon, authenticated using (
    exists (
      select 1 from public.law_course_modules m
      join public.law_courses c on c.id = m.course_id
      where m.id = module_id and c.is_published = true
    )
  );

drop policy if exists "Public can read tests for published courses" on public.law_course_tests;
create policy "Public can read tests for published courses" on public.law_course_tests
  for select to anon, authenticated using (
    exists (select 1 from public.law_courses c where c.id = course_id and c.is_published = true)
  );

drop policy if exists "Public can read faculty for published courses" on public.law_course_faculty;
create policy "Public can read faculty for published courses" on public.law_course_faculty
  for select to anon, authenticated using (
    exists (select 1 from public.law_courses c where c.id = course_id and c.is_published = true)
  );

-- Starter CLAT record: known course details only. Prices, dates and faculty stay empty
-- until supplied by the institute. Add course content through the Supabase dashboard.
insert into public.law_courses (slug, name, description, language, duration_label)
values (
  'clat-ug-2028-1-year-batch',
  'CLAT UG 2028 - 1 Year Batch',
  'Structured one-year online coaching covering all five CLAT UG sections, with guided lessons, practice and revision.',
  'Hindi + English',
  '1 year'
)
on conflict (slug) do nothing;

insert into public.law_course_benefits (course_id, title, description, icon, position)
select id, item.title, item.description, item.icon, item.position
from public.law_courses c
cross join (values
  ('Live Classes', 'Attend guided lessons and ask questions in class.', '◷', 1),
  ('Recorded Lectures', 'Revisit lessons when you need another explanation.', '▶', 2),
  ('Notes and PDFs', 'Use organized course notes for revision.', '▤', 3),
  ('Mock Tests', 'Practice with section-wise and full-length tests.', '✓', 4),
  ('Doubt Support', 'Get help with questions and difficult concepts.', '?', 5),
  ('Mentorship', 'Get guidance for planning and consistent study.', '✦', 6)
) as item(title, description, icon, position)
where c.slug = 'clat-ug-2028-1-year-batch'
on conflict (course_id, position) do nothing;

insert into public.law_course_modules (course_id, title, description, position)
select c.id, item.title, item.description, item.position
from public.law_courses c
cross join (values
  ('English Language', 'Build reading comprehension, vocabulary and language skills through guided practice.', 1),
  ('Current Affairs and GK', 'Study current affairs and general knowledge with regular revision prompts.', 2),
  ('Legal Reasoning', 'Practice legal principles, passages and application-based questions.', 3),
  ('Logical Reasoning', 'Develop reasoning skills with structured methods and question practice.', 4),
  ('Quantitative Techniques', 'Review core quantitative concepts and apply them to CLAT-style sets.', 5)
) as item(title, description, position)
where c.slug = 'clat-ug-2028-1-year-batch'
on conflict (course_id, position) do nothing;

insert into public.law_module_items (module_id, title, position)
select m.id, item.title, item.position
from public.law_course_modules m
join public.law_courses c on c.id = m.course_id
cross join (values
  ('Concept videos', 1), ('Notes / PDF', 2), ('Practice questions', 3),
  ('Sectional test', 4), ('Doubt session', 5)
) as item(title, position)
where c.slug = 'clat-ug-2028-1-year-batch'
on conflict (module_id, position) do nothing;

insert into public.law_course_tests (course_id, title, description, icon, position)
select id, item.title, item.description, item.icon, item.position
from public.law_courses c
cross join (values
  ('Full-length mocks', 'Full-length mock tests for timed exam practice.', '▤', 1),
  ('Previous year papers', 'Practice with previous year question papers and review solutions.', '↻', 2),
  ('Performance analysis', 'Review scores and section-wise performance after each test.', '⌁', 3)
) as item(title, description, icon, position)
where c.slug = 'clat-ug-2028-1-year-batch'
on conflict (course_id, position) do nothing;
