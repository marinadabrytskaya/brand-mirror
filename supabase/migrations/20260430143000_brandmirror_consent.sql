alter table public.brandmirror_customers
  add column if not exists data_processing_consent boolean not null default false,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists consent_updated_at timestamptz,
  add column if not exists consent_source text;

alter table public.brandmirror_first_reads
  add column if not exists data_processing_consent boolean not null default false,
  add column if not exists marketing_consent boolean not null default false;

alter table public.brandmirror_paid_reports
  add column if not exists data_processing_consent boolean not null default false,
  add column if not exists marketing_consent boolean not null default false;

create index if not exists brandmirror_customers_marketing_consent_idx
  on public.brandmirror_customers (marketing_consent, consent_updated_at desc);
