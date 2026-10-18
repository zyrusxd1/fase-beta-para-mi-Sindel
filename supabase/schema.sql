create table if not exists public.app_state (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_memories (
  id text primary key,
  title text not null,
  date text not null,
  location text not null,
  image_url text not null,
  caption text not null,
  category text not null check (category in ('viajes', 'cotidiano', 'citas', 'celebraciones')),
  likes integer not null default 0 check (likes >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.music_tracks (
  id text primary key,
  title text not null,
  object_path text not null unique,
  created_at timestamptz not null default now()
);

alter table public.app_state enable row level security;
alter table public.gallery_memories enable row level security;
alter table public.music_tracks enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.app_state to service_role;
grant select, insert, update, delete on public.gallery_memories to service_role;
grant select, insert, update, delete on public.music_tracks to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('memory-photos', 'memory-photos', true, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('music-tracks', 'music-tracks', true, 104857600, array['audio/mpeg'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
