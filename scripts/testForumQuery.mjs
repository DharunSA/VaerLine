import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://stoqwlzsaeujshcphsgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bBx5-SYFsagOkZ6zCmhlEQ_yZENMyXy';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testForumFetch() {
  console.log('Testing forum posts and comments count query...');

  const [{ data: posts, error: pErr }, { data: comments, error: cErr }] = await Promise.all([
    supabase.from('forum_posts').select('*').order('created_at', { ascending: false }),
    supabase.from('forum_comments').select('id, post_id'),
  ]);

  console.log('Posts found:', posts?.length, pErr);
  console.log('Comments found:', comments?.length, cErr);

  // Group comments by post_id
  const commentCounts = {};
  for (const c of (comments ?? [])) {
    commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
  }
  console.log('Comment counts per post:', commentCounts);
}

testForumFetch();
