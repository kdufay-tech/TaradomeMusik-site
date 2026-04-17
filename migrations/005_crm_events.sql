-- 005_crm_events.sql
CREATE TABLE IF NOT EXISTS fans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  email citext NULL,
  phone text NULL,
  first_name text NULL,
  last_name text NULL,
  city text NULL,
  region text NULL,
  country text NULL,
  consent_email boolean NOT NULL DEFAULT true,
  consent_sms boolean NOT NULL DEFAULT false,
  consent_ts timestamptz NULL,
  source text NULL,
  traits jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fans_org ON fans(org_id);
CREATE INDEX IF NOT EXISTS idx_fans_email ON fans(email);
CREATE INDEX IF NOT EXISTS idx_fans_phone ON fans(phone);

CREATE TABLE IF NOT EXISTS fan_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'user' CHECK (type IN ('system','user')),
  UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS fan_tag_map (
  fan_id uuid NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES fan_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (fan_id, tag_id)
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  fan_id uuid NULL REFERENCES fans(id) ON DELETE SET NULL,
  type text NOT NULL,
  entity_type text NULL,
  entity_id uuid NULL,
  utm jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip inet NULL,
  user_agent text NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_org ON events(org_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_fan ON events(fan_id);
