import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://stoqwlzsaeujshcphsgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bBx5-SYFsagOkZ6zCmhlEQ_yZENMyXy';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testVoteAggregation() {
  console.log('Testing full forum vote aggregation...');

  const [{ data: posts }, { data: allVotes }, { data: comments }] = await Promise.all([
    supabase.from('forum_posts').select('*').order('created_at', { ascending: false }),
    supabase.from('forum_votes').select('post_id, user_id'),
    supabase.from('forum_comments').select('id, post_id'),
  ]);

  console.log('Posts count:', posts?.length);
  console.log('All votes in DB:', allVotes?.length);
  console.log('All comments in DB:', comments?.length);

  // Group votes count per post
  const voteCounts = {};
  for (const v of (allVotes ?? [])) {
    voteCounts[v.post_id] = (voteCounts[v.post_id] || 0) + 1;
  }
  console.log('Vote counts per post:', voteCounts);
}

testVoteAggregation();
