import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://stoqwlzsaeujshcphsgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bBx5-SYFsagOkZ6zCmhlEQ_yZENMyXy';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUpdate() {
  console.log('Testing updating Dharun SA dob in Supabase...');

  const dharunId = '10000000-0000-0000-0000-000000000005';

  const { data, error, count } = await supabase
    .from('people')
    .update({ dob: '2001-08-12' })
    .eq('id', dharunId)
    .select();

  console.log('Update result data:', data);
  console.log('Update error:', error);
}

testUpdate();
