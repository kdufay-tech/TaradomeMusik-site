-- 004_landing_spotlight.sql
CREATE TYPE landing_type AS ENUM ('artist','release','spotlight','sponsor','partnership','campaign');
CREATE TYPE landing_status AS ENUM ('draft','published','archived');

CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('sponsor','brand','distributor','media','venue','other')),
  contact_name text NULL,
  contact_email citext NULL,
  contact_phone text NULL,
  notes text NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  type landing_type NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  artist_id uuid NULL REFERENCES artists(id) ON DELETE SET NULL,
  release_id uuid NULL REFERENCES releases(id) ON DELETE SET NULL,
  partner_id uuid NULL REFERENCES partners(id) ON DELETE SET NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status landing_status NOT NULL DEFAULT 'draft',
  published_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, slug)
);

CREATE TABLE IF NOT EXISTS spotlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  month date NOT NULL,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  headline text NOT NULL,
  copy text NULL,
  featured_track_id uuid NULL REFERENCES tracks(id) ON DELETE SET NULL,
  cta_label text NULL,
  cta_target text NULL,
  status landing_status NOT NULL DEFAULT 'draft',
  published_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, month)
);
