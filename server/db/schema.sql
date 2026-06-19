create extension if not exists "pgcrypto";

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'web',
  summary text,
  url text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  need text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists site_settings (
  id int primary key default 1,
  maintenance boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into site_settings (id, maintenance)
values (1, false)
on conflict (id) do nothing;
