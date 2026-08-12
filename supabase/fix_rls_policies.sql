-- ============================================================
-- Fix RLS Policies for VerLine Collaboration & Live Updates
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/stoqwlzsaeujshcphsgw/sql
-- ============================================================

-- 1. Trees Table Policies
drop policy if exists "Users can read own trees" on trees;
drop policy if exists "Users can insert own trees" on trees;
drop policy if exists "Users can update own trees" on trees;
drop policy if exists "Users can delete own trees" on trees;
drop policy if exists "Allow all on trees" on trees;

create policy "Allow all on trees" on trees for all using (true) with check (true);

-- 2. People Table Policies
drop policy if exists "Users can read people" on people;
drop policy if exists "Users can insert people" on people;
drop policy if exists "Users can update people" on people;
drop policy if exists "Users can delete people" on people;
drop policy if exists "Allow all on people" on people;

create policy "Allow all on people" on people for all using (true) with check (true);

-- 3. Relationships Table Policies
drop policy if exists "Users can read relationships" on relationships;
drop policy if exists "Users can insert relationships" on relationships;
drop policy if exists "Users can update relationships" on relationships;
drop policy if exists "Users can delete relationships" on relationships;
drop policy if exists "Allow all on relationships" on relationships;

create policy "Allow all on relationships" on relationships for all using (true) with check (true);

-- 4. Discussion Forum Policies
drop policy if exists "Anyone can read forum posts" on forum_posts;
drop policy if exists "Authenticated users can insert forum posts" on forum_posts;
drop policy if exists "Authors can update own forum posts" on forum_posts;
drop policy if exists "Authors can delete own forum posts" on forum_posts;
drop policy if exists "Allow all on forum_posts" on forum_posts;

create policy "Allow all on forum_posts" on forum_posts for all using (true) with check (true);

drop policy if exists "Anyone can read forum comments" on forum_comments;
drop policy if exists "Authenticated users can insert comments" on forum_comments;
drop policy if exists "Allow all on forum_comments" on forum_comments;

create policy "Allow all on forum_comments" on forum_comments for all using (true) with check (true);

drop policy if exists "Users can manage forum votes" on forum_votes;
drop policy if exists "Allow all on forum_votes" on forum_votes;

create policy "Allow all on forum_votes" on forum_votes for all using (true) with check (true);

-- Ensure 1 vote per user per post
create unique index if not exists idx_forum_votes_unique_user_post on forum_votes (user_id, post_id) where comment_id is null;

-- 5. Update Dharun SA DOB to 12-08-2001 (2001-08-12)
update people
set dob = '2001-08-12'
where id = '10000000-0000-0000-0000-000000000005';
