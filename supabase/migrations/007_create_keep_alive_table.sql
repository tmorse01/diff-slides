-- Create keep_alive table for database connection keep-alive mechanism
-- This table is used by a Vercel cron job to ping the database every 3 days
-- to prevent connections from going cold during inactivity.
CREATE TABLE keep_alive (
  id INTEGER PRIMARY KEY
);

-- Insert exactly one row (this is all we need for the keep-alive query)
INSERT INTO keep_alive (id) VALUES (1);

-- Enable Row Level Security
-- With RLS enabled and no policies, all access is denied by default for regular users
-- Service role bypasses RLS entirely, so it can access this table without needing a policy
-- This ensures only the cron job (using service role key) can query this table
ALTER TABLE keep_alive ENABLE ROW LEVEL SECURITY;

-- No SELECT policy is created because:
-- 1. Default RLS behavior denies all access when no policies exist
-- 2. Service role bypasses RLS, so it can SELECT without a policy
-- 3. This effectively makes the table accessible only to service role (the cron job)

