-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'unlisted', 'public')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- Steps table
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  index INTEGER NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  language TEXT NOT NULL DEFAULT 'typescript',
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, index)
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_steps_project_id ON steps(project_id);
CREATE INDEX idx_steps_project_index ON steps(project_id, index);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: users can manage their own projects
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Projects: public/unlisted projects are readable by anyone
CREATE POLICY "Public projects are viewable" ON projects FOR SELECT USING (visibility = 'public');
CREATE POLICY "Unlisted projects are viewable" ON projects FOR SELECT USING (visibility = 'unlisted');

-- Steps: users can manage steps in their own projects
CREATE POLICY "Users can view steps in own projects" ON steps FOR SELECT 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = steps.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create steps in own projects" ON steps FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = steps.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update steps in own projects" ON steps FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = steps.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete steps in own projects" ON steps FOR DELETE 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = steps.project_id AND projects.user_id = auth.uid()));

-- Steps: readable if project is public/unlisted
CREATE POLICY "Steps in public projects are viewable" ON steps FOR SELECT 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = steps.project_id AND projects.visibility = 'public'));
CREATE POLICY "Steps in unlisted projects are viewable" ON steps FOR SELECT 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = steps.project_id AND projects.visibility = 'unlisted'));

