import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://stoqwlzsaeujshcphsgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bBx5-SYFsagOkZ6zCmhlEQ_yZENMyXy';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testVotesTable() {
  console.log('Testing forum_votes table in Supabase with vote_type: 1...');

  const testUserId = '00000000-0000-0000-0000-000000000005';
  const testPostId = '20000000-0000-0000-0000-000000000001';

  // 1. Insert with vote_type = 1
  const { data: insData, error: insErr } = await supabase
    .from('forum_votes')
    .upsert({
      post_id: testPostId,
      user_id: testUserId,
      vote_type: 1,
    })
    .select();

  console.log('Upsert vote result:', insData, 'Error:', insErr);

  // 2. Query votes for this user
  const { data: userVotes, error: uvErr } = await supabase
    .from('forum_votes')
    .select('post_id')
    .eq('user_id', testUserId);

  console.log('User votes for testUserId:', userVotes, 'Error:', uvErr);

  // 3. Clean up test row
  const { error: delErr } = await supabase
    .from('forum_votes')
    .delete()
    .eq('post_id', testPostId)
    .eq('user_id', testUserId);

  console.log('Delete test vote error:', delErr);
}

testVotesTable();
