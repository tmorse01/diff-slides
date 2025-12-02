-- Add settings JSON column to projects table
ALTER TABLE projects 
  ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;

-- Add index for JSONB queries (optional, but useful if we query by settings)
CREATE INDEX IF NOT EXISTS idx_projects_settings ON projects USING GIN (settings);

