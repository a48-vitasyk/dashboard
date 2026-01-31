-- 1. Ensure tasks table exists (if not created yet)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    status TEXT NOT NULL DEFAULT 'backlog',
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    attachments_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assignee JSONB -- Store avatar etc.
);

-- 2. Remove any restrictive CHECK constraints on 'status'
-- We wrap this in a DO block to avoid errors if the constraint doesn't exist
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Find and drop any check constraints on the 'status' column
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'tasks'::regclass
        AND contype = 'c'
        AND conname LIKE '%status%' -- Heuristic to find status checks
    ) LOOP
        EXECUTE 'ALTER TABLE tasks DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 3. Ensure status column is TEXT (removes ENUM restrictions if any)
ALTER TABLE tasks ALTER COLUMN status TYPE TEXT;

-- 4. Enable RLS (Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create policies (Open for development)
DROP POLICY IF EXISTS "Allow public read tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public insert tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public update tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public delete tasks" ON tasks;

CREATE POLICY "Allow public read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tasks" ON tasks FOR DELETE USING (true);
