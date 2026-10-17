-- supabase/applications.sql
-- Jalankan sekali di Supabase Dashboard > SQL Editor > New query > Run.

create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  ref_code      text unique not null,
  career_id     text not null,
  career_title  text not null,
  name          text not null,
  phone         text not null,
  email         text not null,
  education     text,
  cover_note    text,
  cv_path       text not null,
  status        text not null default 'new'
                check (status in ('new','reviewed','interview','accepted','rejected')),
  created_at    timestamptz not null default now()
);

create index if not exists applications_created_idx on public.applications (created_at desc);
create index if not exists applications_career_idx  on public.applications (career_id);
create index if not exists applications_status_idx  on public.applications (status);

-- Aktifkan RLS tanpa policy: hanya service role (server) yang bisa akses.
alter table public.applications enable row level security;

-- Pengaturan key/value (mis. hr_email) yang bisa diubah dari admin tanpa deploy.
create table if not exists public.app_settings (
  key   text primary key,
  value text not null default ''
);
alter table public.app_settings enable row level security;

-- Beri akses penuh ke service role (diperlukan pada Postgres lokal/baru)
grant all on public.applications to service_role;
grant all on public.app_settings to service_role;

-- Bucket privat untuk CV (jika belum dibuat lewat API)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cv', 'cv', false, 5242880,
  array['application/pdf','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;
