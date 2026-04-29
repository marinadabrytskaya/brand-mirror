create extension if not exists citext;

create table if not exists public.brandmirror_customers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.brandmirror_first_reads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.brandmirror_customers(id) on delete set null,
  email citext not null,
  url text not null,
  locale text not null default 'en',
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.brandmirror_paid_reports (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.brandmirror_customers(id) on delete set null,
  email citext not null,
  url text not null,
  locale text not null default 'en',
  provider text not null,
  payment_reference text not null unique,
  amount_total integer,
  currency text,
  report jsonb not null,
  email_status text not null default 'pending',
  email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brandmirror_first_reads_email_created_idx
  on public.brandmirror_first_reads (email, created_at desc);

create index if not exists brandmirror_paid_reports_email_created_idx
  on public.brandmirror_paid_reports (email, created_at desc);

alter table public.brandmirror_customers enable row level security;
alter table public.brandmirror_first_reads enable row level security;
alter table public.brandmirror_paid_reports enable row level security;

create policy "Service role manages BrandMirror customers"
  on public.brandmirror_customers
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role manages BrandMirror first reads"
  on public.brandmirror_first_reads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role manages BrandMirror paid reports"
  on public.brandmirror_paid_reports
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
