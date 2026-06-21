-- ============================================================
-- Exécuter ce fichier dans Supabase > SQL Editor
-- ============================================================

-- 1. Table des paiements en attente (liée au depositId PawaPay)
create table if not exists pending_payments (
  deposit_id     text primary key,
  user_id        uuid references auth.users(id) not null,
  plan_id        text not null,
  billing_period text not null check (billing_period in ('monthly', 'yearly')),
  amount_usd     numeric(10, 2),
  status         text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at     timestamptz default now()
);

-- Pas de RLS côté client : accès uniquement via service_role (routes API)
alter table pending_payments enable row level security;

-- 2. Table des abonnements actifs
create table if not exists subscriptions (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) not null,
  plan_id        text not null,
  billing_period text not null check (billing_period in ('monthly', 'yearly')),
  status         text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  amount_usd     numeric(10, 2),
  deposit_id     text unique,
  expires_at     timestamptz not null,
  created_at     timestamptz default now()
);

alter table subscriptions enable row level security;

-- Politique : chaque utilisateur peut lire ses propres abonnements
create policy "select_own_subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);
