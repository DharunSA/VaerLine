import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://stoqwlzsaeujshcphsgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bBx5-SYFsagOkZ6zCmhlEQ_yZENMyXy';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testWithSimulatedUser() {
  console.log('Testing reading trees as anon vs authenticated...');
  
  // 1. Anon query
  const { data: anonTrees, error: anonErr } = await supabase.from('trees').select('*');
  console.log('Anon trees count:', anonTrees?.length, anonErr);

  // 2. People query
  const { data: anonPeople, error: pErr } = await supabase.from('people').select('*');
  console.log('Anon people count:', anonPeople?.length, pErr);
}

testWithSimulatedUser();
