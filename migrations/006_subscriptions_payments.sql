-- 006_subscriptions_payments.sql
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  interval text NOT NULL CHECK (interval IN ('month','year')),
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_product_id text NULL,
  active boolean NOT NULL DEFAULT true,
  UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  fan_id uuid NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  status text NOT NULL CHECK (status IN ('active','past_due','canceled','paused')),
  provider text NOT NULL CHECK (provider IN ('stripe','paypal','flutterwave')),
  provider_subscription_id text NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  cancel_at timestamptz NULL
);
CREATE INDEX IF NOT EXISTS idx_subs_fan ON subscriptions(fan_id);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  fan_id uuid NULL REFERENCES fans(id) ON DELETE SET NULL,
  subscription_id uuid NULL REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount_cents bigint NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  provider text NOT NULL CHECK (provider IN ('stripe','paypal','flutterwave')),
  provider_payment_id text NULL,
  status text NOT NULL CHECK (status IN ('succeeded','failed','pending','refunded')),
  paid_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
