-- ==========================================
-- RESET ALL DATA & TABLES IN SUPABASE DATABASE
-- ==========================================

-- Drop all existing tables and data
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.place_interests CASCADE;
DROP TABLE IF EXISTS public.thoughts CASCADE;
DROP TABLE IF EXISTS public.places CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  handle TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Groups Table
CREATE TABLE public.groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast invite code lookup (case-insensitive)
CREATE INDEX idx_groups_invite_code ON public.groups (UPPER(invite_code));

-- 3. Group Members Junction Table
CREATE TABLE public.group_members (
  group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- 4. Places Table
CREATE TABLE public.places (
  id TEXT PRIMARY KEY,
  group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  added_by_id TEXT,
  added_by_name TEXT,
  added_by_avatar TEXT,
  status TEXT DEFAULT 'saved',
  visited_date TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Thoughts Table
CREATE TABLE public.thoughts (
  id TEXT PRIMARY KEY,
  place_id TEXT REFERENCES public.places(id) ON DELETE CASCADE,
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Place Interests Table
CREATE TABLE public.place_interests (
  place_id TEXT REFERENCES public.places(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (place_id, user_id)
);

-- 7. Activities Table
CREATE TABLE public.activities (
  id TEXT PRIMARY KEY,
  group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  type TEXT NOT NULL,
  target_place_id TEXT,
  target_place_name TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) ENABLED
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on groups" ON public.groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on group_members" ON public.group_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on places" ON public.places FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on thoughts" ON public.thoughts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on place_interests" ON public.place_interests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;
