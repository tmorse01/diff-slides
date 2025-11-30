-- Add session_id column to projects table for temporary/anonymous projects
ALTER TABLE projects 
  ADD COLUMN session_id TEXT,
  ALTER COLUMN user_id DROP NOT NULL;

-- Add index for session_id lookups
CREATE INDEX idx_projects_session_id ON projects(session_id);

-- Add constraint: projects must have either user_id or session_id
ALTER TABLE projects 
  ADD CONSTRAINT projects_user_or_session_check 
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL);

-- Update unique constraint to allow same slug for different sessions/users
-- Drop the old unique constraint
-- First try the common name, then find it dynamically if needed
DO $$ 
DECLARE
  constraint_name text;
BEGIN
  -- Try dropping by the most common constraint name first
  BEGIN
    ALTER TABLE projects DROP CONSTRAINT projects_user_id_slug_key;
  EXCEPTION
    WHEN undefined_object THEN
      -- Constraint doesn't exist with that name, try to find it
      -- Find unique constraint that has both user_id and slug columns
      SELECT c.conname INTO constraint_name
      FROM pg_constraint c
      WHERE c.conrelid = 'projects'::regclass
        AND c.contype = 'u'
        AND array_length(c.conkey, 1) = 2
        AND EXISTS (
          SELECT 1 FROM pg_attribute a1
          WHERE a1.attrelid = c.conrelid 
            AND a1.attnum = c.conkey[1] 
            AND a1.attname = 'user_id'
        )
        AND EXISTS (
          SELECT 1 FROM pg_attribute a2
          WHERE a2.attrelid = c.conrelid 
            AND a2.attnum = c.conkey[2] 
            AND a2.attname = 'slug'
        );
      
      IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE projects DROP CONSTRAINT %I', constraint_name);
      END IF;
  END;
END $$;

-- Add new unique constraints that consider both user_id and session_id
CREATE UNIQUE INDEX IF NOT EXISTS projects_user_slug_unique ON projects(user_id, slug) 
  WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS projects_session_slug_unique ON projects(session_id, slug) 
  WHERE session_id IS NOT NULL;

-- Note: Session-based access will be handled in application code
-- RLS policies remain for authenticated users only
-- Temporary projects will be accessed using service role or by verifying session_id in app code

