-- ============================================================
-- VaerLine — Tree Members Table (Assisted Account Provisioning)
-- Run this in Supabase SQL Editor AFTER user_tree_isolation.sql
-- ============================================================

-- Create tree_members join table
create table if not exists tree_members (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid references trees(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member' check (role in ('member', 'creator')),
  invited_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  unique(tree_id, user_id)
);

-- Enable RLS
alter table tree_members enable row level security;

-- Tree owners can view, insert, update, and delete memberships for their trees
drop policy if exists "Owner can manage tree members" on tree_members;
create policy "Owner can manage tree members"
  on tree_members for all
  using (
    exists (
      select 1 from trees
      where trees.id = tree_members.tree_id
      and trees.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from trees
      where trees.id = tree_members.tree_id
      and trees.owner_id = auth.uid()
    )
  );

-- Members can read their own memberships (to discover which tree they belong to)
drop policy if exists "Members can view own memberships" on tree_members;
create policy "Members can view own memberships"
  on tree_members for select
  using (auth.uid() = user_id);

-- Index for fast lookup by user
create index if not exists idx_tree_members_user on tree_members(user_id);
create index if not exists idx_tree_members_tree on tree_members(tree_id);

-- ============================================================
-- forum_votes unique constraint (prevents duplicate vote rows)
-- ============================================================
-- Only add if not exists (safe to re-run)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'forum_votes_post_user_unique'
  ) then
    alter table forum_votes
      add constraint forum_votes_post_user_unique
      unique (post_id, user_id)
      deferrable initially deferred;
  end if;
end$$;
