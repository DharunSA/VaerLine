import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://stoqwlzsaeujshcphsgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bBx5-SYFsagOkZ6zCmhlEQ_yZENMyXy';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testQuery() {
  const treeId = '00000000-0000-0000-0000-000000000001';
  console.log('Testing query for treeId:', treeId);

  const [{ data: peopleData, error: pErr }, { data: relData, error: rErr }] = await Promise.all([
    supabase.from('people').select('*').eq('tree_id', treeId),
    supabase.from('relationships').select('*').eq('tree_id', treeId),
  ]);

  console.log('peopleData error:', pErr);
  console.log('peopleData count:', peopleData?.length);
  console.log('relData error:', rErr);
  console.log('relData count:', relData?.length);
}

testQuery();
