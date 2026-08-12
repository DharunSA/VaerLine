import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://stoqwlzsaeujshcphsgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bBx5-SYFsagOkZ6zCmhlEQ_yZENMyXy';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCloudData() {
  console.log('🔍 Querying live Supabase tables...');

  const { data: trees, error: treeErr } = await supabase.from('trees').select('*');
  console.log('Trees:', trees?.length, 'found', treeErr ? `(Error: ${treeErr.message})` : '');

  const { data: people, error: peopleErr } = await supabase.from('people').select('id, name, gender, dob, profession');
  console.log('People:', people?.length, 'members found');
  if (people) {
    console.table(people);
  }

  const { data: rels, error: relErr } = await supabase.from('relationships').select('id, type, from_person_id, to_person_id');
  console.log('Relationships:', rels?.length, 'edges found');

  const { data: posts, error: postErr } = await supabase.from('forum_posts').select('id, title, author_name');
  console.log('Forum Posts:', posts?.length, 'posts found');
  if (posts) {
    console.table(posts);
  }
}

checkCloudData();
