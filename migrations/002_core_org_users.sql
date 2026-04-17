-- 002_core_org_users.sql
CREATE TABLE IF NOT EXISTS orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE user_role AS ENUM ('admin','staff','artist_manager','finance','partner','viewer');
CREATE TYPE user_status AS ENUM ('active','disabled');

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  email citext NOT NULL UNIQUE,
  phone text NULL,
  password_hash text NULL,
  role user_role NOT NULL DEFAULT 'staff',
  status user_status NOT NULL DEFAULT 'active',
  last_login_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);
