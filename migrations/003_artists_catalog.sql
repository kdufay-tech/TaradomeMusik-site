-- 003_artists_catalog.sql
CREATE TYPE artist_status AS ENUM ('active','paused','archived');
CREATE TYPE release_type AS ENUM ('single','ep','album');
CREATE TYPE release_status AS ENUM ('draft','scheduled','live','archived');
CREATE TYPE track_status AS ENUM ('draft','live','archived');

CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  bio text NULL,
  origin text NULL,
  genre text NULL,
  image_url text NULL,
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  status artist_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, slug)
);

CREATE TABLE IF NOT EXISTS releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title text NOT NULL,
  type release_type NOT NULL,
  release_date date NOT NULL,
  cover_url text NULL,
  upc text NULL,
  status release_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('image','audio','video','document')),
  storage_provider text NOT NULL CHECK (storage_provider IN ('s3','gcs','azure','local')),
  bucket text NULL,
  object_key text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  checksum_sha256 text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title text NOT NULL,
  isrc text NULL,
  duration_ms integer NULL,
  explicit boolean NOT NULL DEFAULT false,
  preview_asset_id uuid NULL REFERENCES media_assets(id),
  audio_asset_id uuid NULL REFERENCES media_assets(id),
  status track_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_releases_artist ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_release ON tracks(release_id);
CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist_id);
