create extension if not exists "pgcrypto";

create type public.user_role as enum ('host', 'renter');
create type public.venue_status as enum ('draft', 'pending_review', 'active', 'paused', 'rejected');
create type public.booking_status as enum ('pending', 'approved', 'declined', 'captured', 'canceled');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'renter',
  name text not null,
  email text not null unique,
  avatar_url text,
  stripe_account_id text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text not null,
  category text not null,
  vibe text,
  capacity integer not null check (capacity > 0),
  hourly_rate integer not null check (hourly_rate > 0),
  images text[] not null default '{}',
  address text not null,
  operating_hours jsonb not null default '{}'::jsonb,
  active_status public.venue_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venue_use_cases (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  use_case text not null,
  created_at timestamptz not null default now(),
  unique (venue_id, use_case)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  renter_id uuid not null references public.users(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  guest_count integer not null check (guest_count > 0),
  use_case text not null,
  total_price integer not null check (total_price >= 0),
  platform_fee integer not null check (platform_fee >= 0),
  stripe_payment_intent_id text,
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  renter_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  use_case_tag text not null,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index users_role_idx on public.users(role);
create index venues_host_id_idx on public.venues(host_id);
create index venues_active_status_idx on public.venues(active_status);
create index venues_capacity_idx on public.venues(capacity);
create index venues_hourly_rate_idx on public.venues(hourly_rate);
create index venue_use_cases_venue_id_idx on public.venue_use_cases(venue_id);
create index venue_use_cases_use_case_idx on public.venue_use_cases(use_case);
create index bookings_venue_id_idx on public.bookings(venue_id);
create index bookings_renter_id_idx on public.bookings(renter_id);
create index bookings_status_idx on public.bookings(status);
create index bookings_start_time_idx on public.bookings(start_time);
create index reviews_venue_id_idx on public.reviews(venue_id);
create index reviews_use_case_tag_idx on public.reviews(use_case_tag);
create index messages_booking_id_idx on public.messages(booking_id);
create index messages_created_at_idx on public.messages(created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger venues_set_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, role, name, email, avatar_url)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'renter'),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger auth_user_created_profile
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.calculate_venue_readiness(venue_row public.venues)
returns integer
language plpgsql
stable
as $$
declare
  score integer := 0;
  use_case_count integer := 0;
  host_connected boolean := false;
begin
  select count(*) into use_case_count
  from public.venue_use_cases
  where venue_id = venue_row.id;

  select coalesce(stripe_account_id is not null, false) into host_connected
  from public.users
  where id = venue_row.host_id;

  if length(trim(venue_row.name)) > 2 then score := score + 10; end if;
  if length(trim(venue_row.description)) >= 80 then score := score + 15; end if;
  if venue_row.capacity >= 8 then score := score + 10; end if;
  if venue_row.hourly_rate >= 50 then score := score + 10; end if;
  if array_length(venue_row.images, 1) >= 3 then score := score + 20; end if;
  if use_case_count >= 2 then score := score + 15; end if;
  if venue_row.operating_hours <> '{}'::jsonb then score := score + 10; end if;
  if host_connected then score := score + 10; end if;

  return least(score, 100);
end;
$$;

alter table public.users enable row level security;
alter table public.venues enable row level security;
alter table public.venue_use_cases enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

create policy "Users can read their own profile"
on public.users for select
using (auth.uid() = id);

create policy "Users can create their own profile"
on public.users for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Anyone can view active venues"
on public.venues for select
using (active_status = 'active');

create policy "Hosts can view their own venues"
on public.venues for select
using (auth.uid() = host_id);

create policy "Hosts can create venues"
on public.venues for insert
with check (
  auth.uid() = host_id
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'host'
  )
);

create policy "Hosts can update their own venues"
on public.venues for update
using (auth.uid() = host_id)
with check (auth.uid() = host_id);

create policy "Hosts can delete draft venues"
on public.venues for delete
using (
  auth.uid() = host_id
  and active_status = 'draft'
);

create policy "Anyone can view use cases for active venues"
on public.venue_use_cases for select
using (
  exists (
    select 1 from public.venues
    where venues.id = venue_use_cases.venue_id
    and venues.active_status = 'active'
  )
);

create policy "Hosts can manage use cases for their venues"
on public.venue_use_cases for all
using (
  exists (
    select 1 from public.venues
    where venues.id = venue_use_cases.venue_id
    and venues.host_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.venues
    where venues.id = venue_use_cases.venue_id
    and venues.host_id = auth.uid()
  )
);

create policy "Renters can create their own bookings"
on public.bookings for insert
with check (
  auth.uid() = renter_id
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'renter'
  )
);

create policy "Renters can view their own bookings"
on public.bookings for select
using (auth.uid() = renter_id);

create policy "Hosts can view bookings for their venues"
on public.bookings for select
using (
  exists (
    select 1 from public.venues
    where venues.id = bookings.venue_id
    and venues.host_id = auth.uid()
  )
);

create policy "Renters can cancel their own pending bookings"
on public.bookings for update
using (
  auth.uid() = renter_id
  and status = 'pending'
)
with check (
  auth.uid() = renter_id
  and status = 'canceled'
);

create policy "Hosts can update bookings for their venues"
on public.bookings for update
using (
  exists (
    select 1 from public.venues
    where venues.id = bookings.venue_id
    and venues.host_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.venues
    where venues.id = bookings.venue_id
    and venues.host_id = auth.uid()
  )
);

create policy "Anyone can view reviews"
on public.reviews for select
using (true);

create policy "Renters can create reviews for captured completed bookings"
on public.reviews for insert
with check (
  auth.uid() = renter_id
  and exists (
    select 1 from public.bookings
    where bookings.id = reviews.booking_id
    and bookings.renter_id = auth.uid()
    and bookings.status = 'captured'
    and bookings.end_time < now()
    and bookings.use_case = reviews.use_case_tag
  )
);

create policy "Booking participants can view messages"
on public.messages for select
using (
  exists (
    select 1
    from public.bookings
    join public.venues on venues.id = bookings.venue_id
    where bookings.id = messages.booking_id
    and (
      bookings.renter_id = auth.uid()
      or venues.host_id = auth.uid()
    )
  )
);

create policy "Booking participants can send messages"
on public.messages for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1
    from public.bookings
    join public.venues on venues.id = bookings.venue_id
    where bookings.id = messages.booking_id
    and (
      bookings.renter_id = auth.uid()
      or venues.host_id = auth.uid()
    )
  )
);

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.bookings;

insert into storage.buckets (id, name, public)
values ('venue-images', 'venue-images', true)
on conflict (id) do nothing;

create policy "Anyone can view venue images"
on storage.objects for select
using (bucket_id = 'venue-images');

create policy "Hosts can upload venue images"
on storage.objects for insert
with check (
  bucket_id = 'venue-images'
  and auth.role() = 'authenticated'
);

create policy "Hosts can update their uploaded venue images"
on storage.objects for update
using (
  bucket_id = 'venue-images'
  and owner = auth.uid()
);

create policy "Hosts can delete their uploaded venue images"
on storage.objects for delete
using (
  bucket_id = 'venue-images'
  and owner = auth.uid()
);
