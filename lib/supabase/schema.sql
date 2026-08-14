-- NutriGuía — Supabase Schema
-- Ejecuta esto en: supabase.com → SQL Editor → New query

-- ================================================================
-- EXTENSION: UUID generadas automáticamente
-- ================================================================
create extension if not exists "pgcrypto";

-- ================================================================
-- TABLA: user_profiles
-- Perfil completo del usuario
-- ================================================================
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key default gen_random_uuid(),
  email text unique,
  name text,
  provider text, -- 'google' | 'apple' | 'guest'

  -- Métricas corporales
  weight real default 70,
  height real default 170,
  age integer default 30,
  gender text default 'other', -- 'male' | 'female' | 'other'

  -- Objetivo y preferencias
  primary_goal text, -- 'bajar-peso' | 'ganar-musculo' | 'comer-sano'
  allergies text[] default '{}',
  restrictions text[] default '{}',
  cooking_level text,
  budget text,
  goals text[] default '{}',
  daily_calories integer,
  daily_water integer default 2000,

  -- Avatar
  avatar_style jsonb default '{}',

  -- Plan y suscripción
  plan text default 'FREE' check (plan in ('FREE', 'PRO', 'ASESORADO')),
  plan_updated_at timestamptz,

  -- Mensajes
  daily_message_count integer default 0,
  last_message_date date,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================================
-- TABLA: streaks
-- Control de rachas diarias
-- ================================================================
create table public.streaks (
  user_id uuid references auth.users on delete cascade primary key,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date,
  freezes_available integer default 1,
  freezes_used_this_week integer default 0,
  last_freeze_week integer default 0,
  history jsonb default '{}', -- { "2026-08-01": "active", "2026-08-02": "freeze" }
  total_check_ins integer default 0,
  hydration_today integer default 0,
  last_hydration_date date,
  updated_at timestamptz default now()
);

-- ================================================================
-- TABLA: weight_history
-- Registro histórico de peso
-- ================================================================
create table public.weight_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  weight real not null,
  bmi real,
  recorded_at timestamptz default now()
);

-- ================================================================
-- TABLA: chat_messages (para historial)
-- ================================================================
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- ================================================================
-- RLS — Row Level Security
-- ================================================================
alter table public.user_profiles enable row level security;
alter table public.streaks enable row level security;
alter table public.weight_history enable row level security;
alter table public.chat_messages enable row level security;

-- Cada usuario solo ve sus propios datos
create policy "Users can manage own profile" on public.user_profiles
  for all using (auth.uid() = id);

create policy "Users can manage own streak" on public.streaks
  for all using (auth.uid() = user_id);

create policy "Users can manage own weight history" on public.weight_history
  for all using (auth.uid() = user_id);

create policy "Users can manage own chat messages" on public.chat_messages
  for all using (auth.uid() = user_id);

-- ================================================================
-- FUNCIONES ÚTILES
-- ================================================================

-- Función: upsert user_profile después de login
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, name, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    'google'
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(excluded.name, user_profiles.name);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: crear perfil automáticamente al registrarse
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: crear streak automáticamente al crear perfil
create or replace function public.handle_new_profile()
returns trigger as $$
begin
  insert into public.streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created on public.user_profiles;
create trigger on_profile_created
  after insert on public.user_profiles
  for each row execute procedure public.handle_new_profile();

-- ================================================================
-- INDEX para performance
-- ================================================================
create index if not exists idx_weight_history_user_date
  on public.weight_history (user_id, recorded_at desc);
create index if not exists idx_chat_messages_user_created
  on public.chat_messages (user_id, created_at desc);

-- ================================================================
-- FUNCIONES RPC
-- ================================================================

-- Incrementar contador de mensajes (atómico)
create or replace function public.increment_message_count(user_uuid uuid)
returns void as $$
declare
  v_today date := current_date;
  v_last_date date;
begin
  select last_message_date into v_last_date
  from public.user_profiles
  where id = user_uuid;

  if v_last_date is null or v_last_date != v_today then
    update public.user_profiles
    set daily_message_count = 1,
        last_message_date = v_today,
        updated_at = now()
    where id = user_uuid;
  else
    update public.user_profiles
    set daily_message_count = daily_message_count + 1,
        updated_at = now()
    where id = user_uuid;
  end if;
end;
$$ language plpgsql security definer;

-- ================================================================
-- NOTA: Habilita Google OAuth en Supabase Auth
--   Authentication → Providers → Google → Configura client ID + secret
-- ================================================================
