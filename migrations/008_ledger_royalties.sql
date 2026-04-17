-- 008_ledger_royalties.sql
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
  parent_id uuid NULL REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  UNIQUE(org_id, code)
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  posted_at timestamptz NOT NULL DEFAULT now(),
  source_type text NULL,
  source_id uuid NULL,
  memo text NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'posted' CHECK (status IN ('pending','posted','reversed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  entry_id uuid NOT NULL REFERENCES ledger_entries(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES chart_of_accounts(id),
  artist_id uuid NULL REFERENCES artists(id) ON DELETE SET NULL,
  partner_id uuid NULL REFERENCES partners(id) ON DELETE SET NULL,
  department text NULL,
  debit_cents bigint NOT NULL DEFAULT 0,
  credit_cents bigint NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ledger_lines_entry ON ledger_lines(entry_id);

CREATE TABLE IF NOT EXISTS royalty_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  default_rate_bps integer NOT NULL DEFAULT 0,
  recoupable_balance_cents bigint NOT NULL DEFAULT 0,
  payment_terms jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(org_id, artist_id)
);

CREATE TABLE IF NOT EXISTS royalty_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  gross_cents bigint NOT NULL DEFAULT 0,
  net_cents bigint NOT NULL DEFAULT 0,
  recouped_cents bigint NOT NULL DEFAULT 0,
  payable_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','issued','paid')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS royalty_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  statement_id uuid NOT NULL REFERENCES royalty_statements(id) ON DELETE CASCADE,
  track_id uuid NULL REFERENCES tracks(id) ON DELETE SET NULL,
  revenue_type text NOT NULL CHECK (revenue_type IN ('streaming','sync','merch','tour','sponsor')),
  units numeric NULL,
  gross_cents bigint NOT NULL DEFAULT 0,
  net_cents bigint NOT NULL DEFAULT 0,
  rate_bps integer NOT NULL DEFAULT 0,
  artist_share_cents bigint NOT NULL DEFAULT 0
);
