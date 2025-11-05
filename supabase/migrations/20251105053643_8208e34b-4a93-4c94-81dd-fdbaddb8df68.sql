-- Create profiles table for user information
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text unique,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles are viewable by everyone
create policy "Profiles are viewable by everyone" 
on public.profiles 
for select 
using (true);

-- Users can update their own profile
create policy "Users can update their own profile" 
on public.profiles 
for update 
using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert their own profile" 
on public.profiles 
for insert 
with check (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public 
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();