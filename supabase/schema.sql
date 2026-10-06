-- Paste this into the Supabase SQL Editor and click "Run".
create table if not exists public.briefings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  task_name text not null,
  title text not null,
  summary text not null,
  content text not null,
  sources text[] not null default '{}'
);

-- Lock the table down. Only the server (using the service_role key) can read or write it.
alter table public.briefings enable row level security;
