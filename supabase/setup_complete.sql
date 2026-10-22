-- ==============================================================================
-- SETUP DATABASE & STORAGE SUPABASE UNTUK PT EMPAT SINERGI UTAMA (ESU)
-- ==============================================================================
-- Cara pakai:
-- 1. Buka Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Pilih Project Anda
-- 3. Masuk ke menu "SQL Editor" di bilah kiri
-- 4. Klik "New query", paste seluruh isi file ini, lalu klik "Run" (atau Ctrl+Enter)
-- ==============================================================================

-- 1. TABEL: site_content (Menyimpan seluruh data CMS Website)
create table if not exists public.site_content (
  id integer primary key default 1,
  data jsonb not null default '{}'::jsonb
);
alter table public.site_content add column if not exists updated_at timestamptz default now();

-- RLS untuk site_content (HANYA service_role / backend server yang berhak akses demi keamanan data CMS)
alter table public.site_content enable row level security;

-- Cabut akses baca langsung publik untuk mencegah pengunduhan hash password & data sesi
revoke select on public.site_content from anon, authenticated;
drop policy if exists "Allow public read site_content" on public.site_content;
drop policy if exists "Allow service_role write site_content" on public.site_content;
drop policy if exists "Allow service_role all site_content" on public.site_content;

create policy "Allow service_role all site_content"
  on public.site_content for all
  to service_role
  using (true)
  with check (true);

grant all on public.site_content to service_role;


-- 2. TABEL: applications (Menyimpan data lamaran karir / pelamar kerja)
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

-- RLS untuk applications (Hanya service_role / backend server yang berhak akses)
alter table public.applications enable row level security;

drop policy if exists "Allow service_role all applications" on public.applications;
create policy "Allow service_role all applications"
  on public.applications for all
  to service_role
  using (true)
  with check (true);

grant all on public.applications to service_role;


-- 3. TABEL: app_settings (Pengaturan sistem seperti HR Email)
create table if not exists public.app_settings (
  key   text primary key,
  value text not null default ''
);

alter table public.app_settings enable row level security;

drop policy if exists "Allow service_role all app_settings" on public.app_settings;
create policy "Allow service_role all app_settings"
  on public.app_settings for all
  to service_role
  using (true)
  with check (true);

grant all on public.app_settings to service_role;


-- 4. STORAGE BUCKETS (uploads untuk gambar & cv untuk dokumen pelamar)
-- Bucket: uploads (Public: true, max 10MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads', 'uploads', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760;

-- Bucket: cv (Public: false, max 5MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cv', 'cv', false, 5242880,
  array['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880;


-- 5. STORAGE POLICIES
-- uploads: siapapun bisa melihat gambar (Public Read)
drop policy if exists "Public Access Uploads" on storage.objects;
create policy "Public Access Uploads"
  on storage.objects for select
  to public
  using (bucket_id = 'uploads');

-- uploads: service_role punya izin penuh (Upload / Delete / Update)
drop policy if exists "Service Role Manage Uploads" on storage.objects;
create policy "Service Role Manage Uploads"
  on storage.objects for all
  to service_role
  using (bucket_id = 'uploads')
  with check (bucket_id = 'uploads');

-- cv: service_role punya izin penuh untuk upload & membuat signed URL
drop policy if exists "Service Role Manage CV" on storage.objects;
create policy "Service Role Manage CV"
  on storage.objects for all
  to service_role
  using (bucket_id = 'cv')
  with check (bucket_id = 'cv');

-- Selesai!
