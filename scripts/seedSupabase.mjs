import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://stoqwlzsaeujshcphsgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bBx5-SYFsagOkZ6zCmhlEQ_yZENMyXy';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TREE_ID = '00000000-0000-0000-0000-000000000001';

const PEOPLE_IDS = {
  raj: '10000000-0000-0000-0000-000000000001',
  meena: '10000000-0000-0000-0000-000000000002',
  arjun: '10000000-0000-0000-0000-000000000003',
  priya: '10000000-0000-0000-0000-000000000004',
  dharun: '10000000-0000-0000-0000-000000000005',
  kavya: '10000000-0000-0000-0000-000000000006',
  sunita: '10000000-0000-0000-0000-000000000007',
  dev: '10000000-0000-0000-0000-000000000008',
  rohan: '10000000-0000-0000-0000-000000000009',
  ananya: '10000000-0000-0000-0000-000000000010',
};

async function seedCloudDatabase() {
  console.log('🌱 Starting Supabase Cloud Database Seed with UUIDs...');

  // 1. Upsert Tree
  console.log('1. Upserting tree record...');
  const { error: treeError } = await supabase.from('trees').upsert({
    id: TREE_ID,
    name: "Dharun's Family Lineage Tree",
  });

  if (treeError) {
    console.error('Error inserting tree:', treeError);
  } else {
    console.log('✓ Tree created/updated successfully.');
  }

  // 2. People records with Dharun SA as the central member
  const people = [
    {
      id: PEOPLE_IDS.raj,
      tree_id: TREE_ID,
      name: 'Raj Sharma',
      gender: 'male',
      dob: '1942-03-15',
      profession: 'Retired Teacher',
      location: 'Mumbai',
      bio: 'Family patriarch, retired educator with 40 years of service in Mumbai.',
    },
    {
      id: PEOPLE_IDS.meena,
      tree_id: TREE_ID,
      name: 'Meena Sharma',
      gender: 'female',
      dob: '1945-08-22',
      profession: 'Homemaker',
      location: 'Mumbai',
      bio: 'Family matriarch, renowned for preserving heirloom recipes and family lore.',
    },
    {
      id: PEOPLE_IDS.arjun,
      tree_id: TREE_ID,
      name: 'Arjun Sharma',
      gender: 'male',
      dob: '1968-11-10',
      profession: 'Software Engineer',
      location: 'Bangalore',
      bio: 'Senior technology consultant, passionate genealogist and father of Dharun.',
    },
    {
      id: PEOPLE_IDS.priya,
      tree_id: TREE_ID,
      name: 'Priya Sharma',
      gender: 'female',
      dob: '1971-04-25',
      profession: 'Doctor',
      location: 'Bangalore',
      bio: 'Chief Medical Officer, mother of Dharun and Kavya.',
    },
    {
      id: PEOPLE_IDS.dharun,
      tree_id: TREE_ID,
      name: 'Dharun SA',
      gender: 'male',
      dob: '2001-08-11',
      profession: 'Software Architect',
      location: 'Bangalore',
      bio: 'Software Architect and creator of the VerLine family heirloom platform.',
    },
    {
      id: PEOPLE_IDS.kavya,
      tree_id: TREE_ID,
      name: 'Kavya Sharma',
      gender: 'female',
      dob: '1998-02-09',
      profession: 'Student',
      location: 'Pune',
      bio: 'Master of Design student in Pune, younger sister of Dharun.',
    },
    {
      id: PEOPLE_IDS.sunita,
      tree_id: TREE_ID,
      name: 'Sunita Kapoor',
      gender: 'female',
      dob: '1972-06-30',
      profession: 'Architect',
      location: 'Delhi',
      bio: 'Landscape architect based in New Delhi, sister of Arjun.',
    },
    {
      id: PEOPLE_IDS.dev,
      tree_id: TREE_ID,
      name: 'Dev Kapoor',
      gender: 'male',
      dob: '1970-09-18',
      profession: 'Businessman',
      location: 'Delhi',
      bio: 'Entrepreneur and business leader in New Delhi, husband of Sunita.',
    },
    {
      id: PEOPLE_IDS.rohan,
      tree_id: TREE_ID,
      name: 'Rohan Kapoor',
      gender: 'male',
      dob: '1999-12-01',
      profession: 'Graphic Designer',
      location: 'Delhi',
      bio: 'Creative visual designer in Delhi, cousin of Dharun.',
    },
    {
      id: PEOPLE_IDS.ananya,
      tree_id: TREE_ID,
      name: 'Ananya Menon',
      gender: 'female',
      dob: '1996-05-20',
      profession: 'Journalist',
      location: 'Chennai',
      bio: "Spouse of Dharun SA, investigative cultural journalist.",
    },
  ];

  console.log('2. Upserting 10 family members into Supabase `people` table...');
  const { error: peopleError } = await supabase.from('people').upsert(people);
  if (peopleError) {
    console.error('Error inserting people:', peopleError);
  } else {
    console.log('✓ 10 family members upserted successfully.');
  }

  // 3. Relationships linking everyone to Dharun SA and parents
  const relationships = [
    { id: '40000000-0000-0000-0000-000000000001', tree_id: TREE_ID, type: 'SPOUSE_OF', from_person_id: PEOPLE_IDS.raj, to_person_id: PEOPLE_IDS.meena },
    { id: '40000000-0000-0000-0000-000000000002', tree_id: TREE_ID, type: 'PARENT_OF', from_person_id: PEOPLE_IDS.raj, to_person_id: PEOPLE_IDS.arjun },
    { id: '40000000-0000-0000-0000-000000000003', tree_id: TREE_ID, type: 'PARENT_OF', from_person_id: PEOPLE_IDS.meena, to_person_id: PEOPLE_IDS.arjun },
    { id: '40000000-0000-0000-0000-000000000004', tree_id: TREE_ID, type: 'PARENT_OF', from_person_id: PEOPLE_IDS.raj, to_person_id: PEOPLE_IDS.sunita },
    { id: '40000000-0000-0000-0000-000000000005', tree_id: TREE_ID, type: 'PARENT_OF', from_person_id: PEOPLE_IDS.meena, to_person_id: PEOPLE_IDS.sunita },
    { id: '40000000-0000-0000-0000-000000000006', tree_id: TREE_ID, type: 'SPOUSE_OF', from_person_id: PEOPLE_IDS.arjun, to_person_id: PEOPLE_IDS.priya },
    { id: '40000000-0000-0000-0000-000000000007', tree_id: TREE_ID, type: 'PARENT_OF', from_person_id: PEOPLE_IDS.arjun, to_person_id: PEOPLE_IDS.dharun },
    { id: '40000000-0000-0000-0000-000000000008', tree_id: TREE_ID, type: 'PARENT_OF', from_person_id: PEOPLE_IDS.priya, to_person_id: PEOPLE_IDS.dharun },
    { id: '40000000-0000-0000-0000-000000000009', tree_id: TREE_ID, type: 'PARENT_OF', from_person_id: PEOPLE_IDS.arjun, to_person_id: PEOPLE_IDS.kavya },
    { id: '40000000-0000-0000-0000-000000000010', tree_id: TREE_ID, type: 'PARENT_OF', from_person_id: PEOPLE_IDS.priya, to_person_id: PEOPLE_IDS.kavya },
    { id: '40000000-0000-0000-0000-000000000011', tree_id: TREE_ID, type: 'SPOUSE_OF', from_person_id: PEOPLE_IDS.sunita, to_person_id: PEOPLE_IDS.dev },
    { id: '40000000-0000-0000-0000-000000000012', tree_id: TREE_ID, type: 'PARENT_OF', from_person_id: PEOPLE_IDS.sunita, to_person_id: PEOPLE_IDS.rohan },
    { id: '40000000-0000-0000-0000-000000000013', tree_id: TREE_ID, type: 'PARENT_OF', from_person_id: PEOPLE_IDS.dev, to_person_id: PEOPLE_IDS.rohan },
    { id: '40000000-0000-0000-0000-000000000014', tree_id: TREE_ID, type: 'SPOUSE_OF', from_person_id: PEOPLE_IDS.dharun, to_person_id: PEOPLE_IDS.ananya },
  ];

  console.log('3. Upserting relationships into Supabase `relationships` table...');
  const { error: relError } = await supabase.from('relationships').upsert(relationships);
  if (relError) {
    console.error('Error inserting relationships:', relError);
  } else {
    console.log('✓ 14 relationship edges upserted successfully.');
  }

  // 4. Forum Discussions
  const forumPosts = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      tree_id: TREE_ID,
      author_name: 'Dharun SA',
      title: 'Seeking ancestral village records for Raj Sharma in Rajasthan (circa 1940)',
      content: 'We are researching our grandfather Raj Sharma’s early life before he migrated to Mumbai in 1958. Does anyone have old land deeds, municipal records, or remember the name of the ancestral haveli in Jaipur/Ajmer district? Any photos or oral recollections would be priceless for our tree.',
      category: 'ancestry',
      tags: ['Rajasthan', 'AncestralHaveli', '1940sRecords', 'Jaipur'],
      linked_person_id: PEOPLE_IDS.raj,
      is_solved: false,
      upvotes_count: 12,
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      tree_id: TREE_ID,
      author_name: 'Priya Sharma',
      title: 'Photograph Identification: 1974 Family Gathering in Bangalore',
      content: 'I found a faded monochrome photograph in grandmother Meena’s heirloom trunk taken around 1974. There are two elders standing next to Arjun whom we haven’t been able to identify. Could they be great-uncle Ramesh or grand-aunt Saraswati? Please take a look at the attached person profile.',
      category: 'photos',
      tags: ['VintagePhotos', '1970s', 'Bangalore', 'PhotoID'],
      linked_person_id: PEOPLE_IDS.meena,
      is_solved: true,
      upvotes_count: 14,
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      tree_id: TREE_ID,
      author_name: 'Kavya Sharma',
      title: 'Oral History Project: Recording Grandfather Raj’s Teaching Stories',
      content: 'I am putting together a digital audio collection of Dada-ji’s memoirs from his four decades as a school principal in Mumbai. If you have anecdotes, letters, or school yearbooks from 1965–1995, please share them here!',
      category: 'stories',
      tags: ['OralHistory', 'Memoirs', 'Education', 'AudioArchive'],
      linked_person_id: PEOPLE_IDS.raj,
      is_solved: false,
      upvotes_count: 19,
    },
    {
      id: '20000000-0000-0000-0000-000000000004',
      tree_id: TREE_ID,
      author_name: 'Sunita Kapoor',
      title: 'Upcoming 50th Golden Anniversary Reunion in December 2026',
      content: 'Planning our grand family reunion for the upcoming golden milestones! We are looking into venue locations equidistant from Bangalore, Mumbai, and Delhi. Let us discuss preferred dates and coordinate travel for the whole lineage.',
      category: 'events',
      tags: ['Reunion2026', 'GoldenMilestones', 'FamilyGathering'],
      is_solved: false,
      upvotes_count: 23,
    },
  ];

  console.log('4. Upserting forum posts into Supabase `forum_posts` table...');
  const { error: postErr } = await supabase.from('forum_posts').upsert(forumPosts);
  if (postErr) {
    console.error('Error inserting forum posts:', postErr);
  } else {
    console.log('✓ Forum posts upserted successfully.');
  }

  // 5. Forum Comments
  const forumComments = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      post_id: '20000000-0000-0000-0000-000000000001',
      author_name: 'Sunita Kapoor',
      content: 'I recall Uncle Dev mentioning that the family register was maintained in the Amber tehsil office before 1952. Let me check our father’s diary tonight.',
      upvotes_count: 4,
      is_accepted_answer: false,
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      post_id: '20000000-0000-0000-0000-000000000001',
      author_name: 'Arjun Sharma',
      content: 'Yes! The village was called Nawalgarh in Jhunjhunu district. I have the scanned copy of the 1956 migration certificate which lists the ancestral plot number.',
      upvotes_count: 9,
      is_accepted_answer: true,
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      post_id: '20000000-0000-0000-0000-000000000002',
      author_name: 'Arjun Sharma',
      content: 'The gentleman on the left with the pocket watch is indeed great-uncle Ramesh! He visited Bangalore during the summer of 1974 for my graduation ceremony.',
      upvotes_count: 7,
      is_accepted_answer: true,
    },
  ];

  console.log('5. Upserting forum comments into Supabase `forum_comments` table...');
  const { error: commentErr } = await supabase.from('forum_comments').upsert(forumComments);
  if (commentErr) {
    console.error('Error inserting forum comments:', commentErr);
  } else {
    console.log('✓ Forum comments upserted successfully.');
  }

  console.log('\n🎉 ALL DHARUN SA FAMILY DATA SUCCESSFULLY PUSHED TO SUPABASE CLOUD!');
}

seedCloudDatabase();
