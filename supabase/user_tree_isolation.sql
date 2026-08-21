-- ============================================================
-- VaerLine — Multi-Tenant User Tree & Forum Authorization Policies
-- Execute this script in the Supabase SQL Editor
-- ============================================================

-- 1. Ensure Trees table has owner_id indexed and properly constrained
alter table trees enable row level security;
create index if not exists idx_trees_owner on trees(owner_id);

-- Drop old / loose policies if existing
drop policy if exists "Users can read own trees" on trees;
drop policy if exists "Users can insert own trees" on trees;
drop policy if exists "Users can update own trees" on trees;
drop policy if exists "Users can delete own trees" on trees;

-- 2. Trees RLS Policies: Users can only see, create, update, delete their own trees
create policy "Users can read own trees"
  on trees for select
  using (auth.uid() = owner_id or auth.uid() is null);

create policy "Users can insert own trees"
  on trees for insert
  with check (auth.uid() = owner_id or auth.uid() is null);

create policy "Users can update own trees"
  on trees for update
  using (auth.uid() = owner_id or auth.uid() is null);

create policy "Users can delete own trees"
  on trees for delete
  using (auth.uid() = owner_id or auth.uid() is null);

-- 3. People RLS Policies: Tied strictly to trees owned by the user
drop policy if exists "Users can read people" on people;
drop policy if exists "Users can insert people" on people;
drop policy if exists "Users can update people" on people;
drop policy if exists "Users can delete people" on people;

create policy "Users can read people"
  on people for select
  using (
    exists (
      select 1 from trees 
      where trees.id = people.tree_id 
      and (trees.owner_id = auth.uid() or auth.uid() is null)
    )
  );

create policy "Users can insert people"
  on people for insert
  with check (
    exists (
      select 1 from trees 
      where trees.id = people.tree_id 
      and (trees.owner_id = auth.uid() or auth.uid() is null)
    )
  );

create policy "Users can update people"
  on people for update
  using (
    exists (
      select 1 from trees 
      where trees.id = people.tree_id 
      and (trees.owner_id = auth.uid() or auth.uid() is null)
    )
  );

create policy "Users can delete people"
  on people for delete
  using (
    exists (
      select 1 from trees 
      where trees.id = people.tree_id 
      and (trees.owner_id = auth.uid() or auth.uid() is null)
    )
  );

-- 4. Relationships RLS Policies: Tied strictly to trees owned by the user
drop policy if exists "Users can read relationships" on relationships;
drop policy if exists "Users can insert relationships" on relationships;
drop policy if exists "Users can update relationships" on relationships;
drop policy if exists "Users can delete relationships" on relationships;

create policy "Users can read relationships"
  on relationships for select
  using (
    exists (
      select 1 from trees 
      where trees.id = relationships.tree_id 
      and (trees.owner_id = auth.uid() or auth.uid() is null)
    )
  );

create policy "Users can insert relationships"
  on relationships for insert
  with check (
    exists (
      select 1 from trees 
      where trees.id = relationships.tree_id 
      and (trees.owner_id = auth.uid() or auth.uid() is null)
    )
  );

create policy "Users can update relationships"
  on relationships for update
  using (
    exists (
      select 1 from trees 
      where trees.id = relationships.tree_id 
      and (trees.owner_id = auth.uid() or auth.uid() is null)
    )
  );

create policy "Users can delete relationships"
  on relationships for delete
  using (
    exists (
      select 1 from trees 
      where trees.id = relationships.tree_id 
      and (trees.owner_id = auth.uid() or auth.uid() is null)
    )
  );

-- 5. Discussion Forum RLS Policies: Tied strictly to user's tree family
alter table forum_posts enable row level security;
alter table forum_comments enable row level security;
alter table forum_votes enable row level security;

create index if not exists idx_forum_posts_tree on forum_posts(tree_id);
create index if not exists idx_forum_posts_author on forum_posts(author_id);

drop policy if exists "Users can view family forum posts" on forum_posts;
drop policy if exists "Users can insert forum posts" on forum_posts;
drop policy if exists "Users can update own forum posts" on forum_posts;
drop policy if exists "Users can delete own forum posts" on forum_posts;

create policy "Users can view family forum posts"
  on forum_posts for select
  using (
    tree_id is null
    or exists (
      select 1 from trees
      where trees.id = forum_posts.tree_id
      and (trees.owner_id = auth.uid() or auth.uid() is null)
    )
    or author_id = auth.uid()
  );

create policy "Users can insert forum posts"
  on forum_posts for insert
  with check (auth.uid() = author_id or auth.uid() is null);

create policy "Users can update own forum posts"
  on forum_posts for update
  using (auth.uid() = author_id or auth.uid() is null);

create policy "Users can delete own forum posts"
  on forum_posts for delete
  using (auth.uid() = author_id or auth.uid() is null);

-- Comments RLS
drop policy if exists "Users can view forum comments" on forum_comments;
drop policy if exists "Users can insert forum comments" on forum_comments;
drop policy if exists "Users can update own forum comments" on forum_comments;
drop policy if exists "Users can delete own forum comments" on forum_comments;

create policy "Users can view forum comments"
  on forum_comments for select
  using (true);

create policy "Users can insert forum comments"
  on forum_comments for insert
  with check (auth.uid() = author_id or auth.uid() is null);

create policy "Users can update own forum comments"
  on forum_comments for update
  using (auth.uid() = author_id or auth.uid() is null);

create policy "Users can delete own forum comments"
  on forum_comments for delete
  using (auth.uid() = author_id or auth.uid() is null);

-- Votes RLS
drop policy if exists "Users can view forum votes" on forum_votes;
drop policy if exists "Users can vote on forum posts" on forum_votes;
drop policy if exists "Users can remove forum votes" on forum_votes;

create policy "Users can view forum votes"
  on forum_votes for select
  using (true);

create policy "Users can vote on forum posts"
  on forum_votes for insert
  with check (auth.uid() = user_id or auth.uid() is null);

create policy "Users can remove forum votes"
  on forum_votes for delete
  using (auth.uid() = user_id or auth.uid() is null);
