#!/usr/bin/env bash
# deploy/init-db.sh
# Inisialisasi Database Vanilla PostgreSQL 16 + PostgREST Roles untuk ESU Company
# Dieksekusi otomatis oleh Docker Postgres saat volume database pertama kali dibuat.

set -e

echo "🚀 [init-db.sh] Memulai inisialisasi database dan role PostgREST..."

AUTH_PW="${AUTHENTICATOR_PASSWORD:-authenticator_secret_pass_123}"
DB_NAME="${POSTGRES_DB:-esu_prod}"
DB_USER="${POSTGRES_USER:-postgres}"

psql -v ON_ERROR_STOP=1 --username "$DB_USER" --dbname "$DB_NAME" <<-EOSQL
  -- 1. Buat ekstensi UUID jika belum ada
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  -- 2. Buat Role PostgREST
  DO \$\$
  BEGIN
    -- Role anon: untuk request tanpa autentikasi (NO GRANTS ke data aplikasi)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
      CREATE ROLE anon NOLOGIN;
    END IF;

    -- Role service_role: untuk backend Next.js (BYPASSRLS agar akses mutasi/baca aman)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
      CREATE ROLE service_role NOLOGIN BYPASSRLS;
    ELSE
      ALTER ROLE service_role WITH BYPASSRLS;
    END IF;

    -- Role authenticator: pengguna login untuk koneksi daemon PostgREST
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
      CREATE ROLE authenticator WITH NOINHERIT LOGIN PASSWORD '$AUTH_PW';
    ELSE
      ALTER ROLE authenticator WITH NOINHERIT PASSWORD '$AUTH_PW';
    END IF;
  END
  \$\$;

  -- 3. Beri izin impersonasi ke role authenticator
  GRANT anon, service_role TO authenticator;

  -- 4. Hak Akses Skema Public
  GRANT USAGE ON SCHEMA public TO anon, service_role;

  -- 5. TABEL: site_content (Menyimpan seluruh data CMS Website)
  CREATE TABLE IF NOT EXISTS public.site_content (
    id integer PRIMARY KEY DEFAULT 1,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamptz DEFAULT now()
  );

  -- 6. TABEL: applications (Menyimpan data lamaran karir / pelamar kerja)
  CREATE TABLE IF NOT EXISTS public.applications (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_code      text UNIQUE NOT NULL,
    career_id     text NOT NULL,
    career_title  text NOT NULL,
    name          text NOT NULL,
    phone         text NOT NULL,
    email         text NOT NULL,
    education     text,
    cover_note    text,
    cv_path       text NOT NULL,
    status        text NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','reviewed','interview','accepted','rejected')),
    cv_purged     boolean DEFAULT false,
    consent_at    timestamptz DEFAULT now(),
    consent_version text DEFAULT '1.0',
    created_at    timestamptz NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS applications_created_idx ON public.applications (created_at DESC);
  CREATE INDEX IF NOT EXISTS applications_career_idx  ON public.applications (career_id);
  CREATE INDEX IF NOT EXISTS applications_status_idx  ON public.applications (status);

  -- 7. TABEL: app_settings (Pengaturan sistem seperti HR Email)
  CREATE TABLE IF NOT EXISTS public.app_settings (
    key   text PRIMARY KEY,
    value text NOT NULL DEFAULT ''
  );

  -- 8. Aktifkan Row Level Security (RLS)
  ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

  -- 9. Grant Hak Akses Tabel HANYA ke service_role (anon TIDAK diberi akses)
  GRANT ALL ON public.site_content TO service_role;
  GRANT ALL ON public.applications TO service_role;
  GRANT ALL ON public.app_settings TO service_role;

  -- Pastikan default privileges untuk tabel di masa depan
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

  -- Cabut semua akses tabel dari anon dan public
  REVOKE ALL ON public.site_content FROM anon, public;
  REVOKE ALL ON public.applications FROM anon, public;
  REVOKE ALL ON public.app_settings FROM anon, public;

  -- 10. Policy RLS
  DROP POLICY IF EXISTS "Service role manage site_content" ON public.site_content;
  CREATE POLICY "Service role manage site_content" ON public.site_content FOR ALL TO service_role USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Service role manage applications" ON public.applications;
  CREATE POLICY "Service role manage applications" ON public.applications FOR ALL TO service_role USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Service role manage app_settings" ON public.app_settings;
  CREATE POLICY "Service role manage app_settings" ON public.app_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

EOSQL

echo "✅ [init-db.sh] Inisialisasi database dan role PostgREST berhasil diselesaikan."
