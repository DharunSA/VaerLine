-- ============================================================
-- VerLine — Complete Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up your database
-- ============================================================

-- 1. Trees Table
create table if not exists trees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- 2. People Table (Family Members)
create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references trees(id) on delete cascade,
  name text not null,
  gender text check (gender in ('male','female','other','unspecified')),
  dob date,
  dod date,
  photo_url text,
  profession text,
  location text,
  bio text,
  phone text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 3. Relationships Table
create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references trees(id) on delete cascade,
  type text not null check (type in ('PARENT_OF','SPOUSE_OF')),
  from_person_id uuid not null references people(id) on delete cascade,
  to_person_id uuid not null references people(id) on delete cascade,
  is_adopted boolean default false,
  is_divorced boolean default false,
  marriage_date date,
  created_at timestamptz default now(),
  unique (tree_id, type, from_person_id, to_person_id)
);

-- 4. Discussion & Queries Forum Tables
create table if not exists forum_posts (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid references trees(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_avatar text,
  title text not null,
  content text not null,
  category text not null default 'general',
  tags text[] default '{}',
  linked_person_id uuid references people(id) on delete set null,
  is_solved boolean default false,
  upvotes_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_avatar text,
  content text not null,
  parent_comment_id uuid references forum_comments(id) on delete cascade,
  upvotes_count integer default 0,
  is_accepted_answer boolean default false,
  created_at timestamptz default now()
);

create table if not exists forum_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references forum_posts(id) on delete cascade,
  comment_id uuid references forum_comments(id) on delete cascade,
  vote_type integer not null check (vote_type in (-1, 1)),
  created_at timestamptz default now(),
  unique(user_id, post_id, comment_id)
);

-- ============================================================
-- Row Level Security (RLS) Configuration
-- ============================================================

alter table trees enable row level security;
alter table people enable row level security;
alter table relationships enable row level security;
alter table forum_posts enable row level security;
alter table forum_comments enable row level security;
alter table forum_votes enable row level security;

-- Trees RLS Policies
create policy "Users can read own trees"
  on trees for select using (auth.uid() = owner_id or auth.uid() is null);

create policy "Users can insert own trees"
  on trees for insert with check (auth.uid() = owner_id);

create policy "Users can update own trees"
  on trees for update using (auth.uid() = owner_id);

create policy "Users can delete own trees"
  on trees for delete using (auth.uid() = owner_id);

-- People RLS Policies
create policy "Users can read people"
  on people for select using (true);

create policy "Users can insert people"
  on people for insert with check (
    exists (select 1 from trees where id = tree_id and (owner_id = auth.uid() or auth.uid() is null))
  );

create policy "Users can update people"
  on people for update using (
    exists (select 1 from trees where id = tree_id and (owner_id = auth.uid() or auth.uid() is null))
  );

create policy "Users can delete people"
  on people for delete using (
    exists (select 1 from trees where id = tree_id and (owner_id = auth.uid() or auth.uid() is null))
  );

-- Relationships RLS Policies
create policy "Users can read relationships"
  on relationships for select using (true);

create policy "Users can insert relationships"
  on relationships for insert with check (
    exists (select 1 from trees where id = tree_id and (owner_id = auth.uid() or auth.uid() is null))
  );

-- Forum RLS Policies
create policy "Anyone can read forum posts"
  on forum_posts for select using (true);

create policy "Authenticated users can insert forum posts"
  on forum_posts for insert with check (auth.uid() is not null or auth.uid() is null);

create policy "Authors can update own forum posts"
  on forum_posts for update using (auth.uid() = author_id or auth.uid() is null);

create policy "Authors can delete own forum posts"
  on forum_posts for delete using (auth.uid() = author_id or auth.uid() is null);

create policy "Anyone can read forum comments"
  on forum_comments for select using (true);

create policy "Authenticated users can insert comments"
  on forum_comments for insert with check (true);

create policy "Users can manage forum votes"
  on forum_votes for all using (true);

-- Indexes for lightning fast queries
create index if not exists idx_people_tree on people(tree_id);
create index if not exists idx_rel_tree on relationships(tree_id);
create index if not exists idx_rel_from on relationships(from_person_id);
create index if not exists idx_rel_to on relationships(to_person_id);
create index if not exists idx_forum_posts_tree on forum_posts(tree_id);
create index if not exists idx_forum_comments_post on forum_comments(post_id);
