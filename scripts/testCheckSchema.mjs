import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://stoqwlzsaeujshcphsgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bBx5-SYFsagOkZ6zCmhlEQ_yZENMyXy';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkForumVotesSchema() {
  console.log('Checking forum_posts and forum_votes structure...');

  // Query existing forum_votes if any
  const { data: allVotes, error: allErr } = await supabase.from('forum_votes').select('*');
  console.log('All forum votes in table:', allVotes, 'Error:', allErr);
}

checkForumVotesSchema();
