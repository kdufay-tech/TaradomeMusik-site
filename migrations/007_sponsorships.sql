-- 007_sponsorships.sql
CREATE TABLE IF NOT EXISTS sponsorship_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_cents bigint NOT NULL DEFAULT 0,
  deliverables jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS sponsorship_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES partners(id),
  package_id uuid NOT NULL REFERENCES sponsorship_packages(id),
  name text NOT NULL,
  start_date date NULL,
  end_date date NULL,
  budget_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('draft','active','complete')),
  kpis jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES sponsorship_campaigns(id) ON DELETE CASCADE,
  type text NOT NULL,
  due_at timestamptz NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivered','approved')),
  evidence_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
