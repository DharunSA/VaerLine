-- ============================================================
-- Vaerline: Seed Dharun SA Family Tree & Heritage Graph
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/stoqwlzsaeujshcphsgw/sql
-- ============================================================

-- 1. Ensure Tree exists for Dharun SA
insert into trees (id, name)
values (
  '00000000-0000-0000-0000-000000000001',
  'Dharun SA Family Heirloom Tree'
)
on conflict (id) do update set name = excluded.name;

-- 2. Insert/Update 10 Family Members (Dharun SA as central root)
insert into people (id, tree_id, name, gender, dob, profession, location, bio)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Raj Sharma',
    'male',
    '1942-03-15',
    'Retired Teacher',
    'Mumbai',
    'Family patriarch, retired educator with 40 years of service in Mumbai.'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Meena Sharma',
    'female',
    '1945-08-22',
    'Homemaker',
    'Mumbai',
    'Family matriarch, renowned for preserving heirloom recipes and family lore.'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Arjun Sharma',
    'male',
    '1968-11-10',
    'Software Engineer',
    'Bangalore',
    'Senior technology consultant, passionate genealogist and father of Dharun.'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Priya Sharma',
    'female',
    '1971-04-25',
    'Doctor',
    'Bangalore',
    'Chief Medical Officer, mother of Dharun and Kavya.'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Dharun SA',
    'male',
    '2001-08-11',
    'Software Architect',
    'Bangalore',
    'Software Architect and creator of the Vaerline family heirloom platform.'
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'Kavya Sharma',
    'female',
    '1998-02-09',
    'Student',
    'Pune',
    'Master of Design student in Pune, sister of Dharun.'
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000001',
    'Sunita Kapoor',
    'female',
    '1972-06-30',
    'Architect',
    'Delhi',
    'Landscape architect based in New Delhi, aunt of Dharun.'
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000001',
    'Dev Kapoor',
    'male',
    '1970-09-18',
    'Businessman',
    'Delhi',
    'Entrepreneur and business leader in New Delhi, uncle of Dharun.'
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000001',
    'Rohan Kapoor',
    'male',
    '1999-12-01',
    'Graphic Designer',
    'Delhi',
    'Creative visual designer in Delhi, cousin of Dharun.'
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'Ananya Menon',
    'female',
    '1996-05-20',
    'Journalist',
    'Chennai',
    'Spouse of Dharun SA, investigative cultural journalist.'
  )
on conflict (id) do update set
  name = excluded.name,
  gender = excluded.gender,
  dob = excluded.dob,
  profession = excluded.profession,
  location = excluded.location,
  bio = excluded.bio;

-- 3. Insert 14 Kinship Relationships
insert into relationships (id, tree_id, type, from_person_id, to_person_id)
values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'SPOUSE_OF', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'PARENT_OF', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'PARENT_OF', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'PARENT_OF', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007'),
  ('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'PARENT_OF', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007'),
  ('40000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'SPOUSE_OF', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'PARENT_OF', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005'),
  ('40000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'PARENT_OF', '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005'),
  ('40000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'PARENT_OF', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006'),
  ('40000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'PARENT_OF', '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006'),
  ('40000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'SPOUSE_OF', '10000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000008'),
  ('40000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'PARENT_OF', '10000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000009'),
  ('40000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'PARENT_OF', '10000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000009'),
  ('40000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'SPOUSE_OF', '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000010')
on conflict (tree_id, type, from_person_id, to_person_id) do nothing;

-- 4. Insert Discussion Forum Posts
insert into forum_posts (id, tree_id, author_name, title, content, category, tags, linked_person_id, is_solved, upvotes_count)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Dharun SA',
    'Seeking ancestral village records for Raj Sharma in Rajasthan (circa 1940)',
    'We are researching our grandfather Raj Sharma’s early life before he migrated to Mumbai in 1958. Does anyone have old land deeds, municipal records, or remember the name of the ancestral haveli in Jaipur/Ajmer district? Any photos or oral recollections would be priceless for our tree.',
    'ancestry',
    array['Rajasthan', 'AncestralHaveli', '1940sRecords', 'Jaipur'],
    '10000000-0000-0000-0000-000000000001',
    false,
    12
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Priya Sharma',
    'Photograph Identification: 1974 Family Gathering in Bangalore',
    'I found a faded monochrome photograph in grandmother Meena’s heirloom trunk taken around 1974. There are two elders standing next to Arjun whom we haven’t been able to identify. Could they be great-uncle Ramesh or grand-aunt Saraswati? Please take a look at the attached person profile.',
    'photos',
    array['VintagePhotos', '1970s', 'Bangalore', 'PhotoID'],
    '10000000-0000-0000-0000-000000000002',
    true,
    14
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Kavya Sharma',
    'Oral History Project: Recording Grandfather Raj’s Teaching Stories',
    'I am putting together a digital audio collection of Dada-ji’s memoirs from his four decades as a school principal in Mumbai. If you have anecdotes, letters, or school yearbooks from 1965–1995, please share them here!',
    'stories',
    array['OralHistory', 'Memoirs', 'Education', 'AudioArchive'],
    '10000000-0000-0000-0000-000000000001',
    false,
    19
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Sunita Kapoor',
    'Upcoming 50th Golden Anniversary Reunion in December 2026',
    'Planning our grand family reunion for the upcoming golden milestones! We are looking into venue locations equidistant from Bangalore, Mumbai, and Delhi. Let us discuss preferred dates and coordinate travel for the whole lineage.',
    'events',
    array['Reunion2026', 'GoldenMilestones', 'FamilyGathering'],
    null,
    false,
    23
  )
on conflict (id) do nothing;

-- 5. Insert Forum Comments
insert into forum_comments (id, post_id, author_name, content, upvotes_count, is_accepted_answer)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Sunita Kapoor',
    'I recall Uncle Dev mentioning that the family register was maintained in the Amber tehsil office before 1952. Let me check our father’s diary tonight.',
    4,
    false
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Arjun Sharma',
    'Yes! The village was called Nawalgarh in Jhunjhunu district. I have the scanned copy of the 1956 migration certificate which lists the ancestral plot number.',
    9,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000002',
    'Arjun Sharma',
    'The gentleman on the left with the pocket watch is indeed great-uncle Ramesh! He visited Bangalore during the summer of 1974 for my graduation ceremony.',
    7,
    true
  )
on conflict (id) do nothing;
