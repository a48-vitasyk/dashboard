-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    status TEXT CHECK (status IN ('completed', 'in_progress', 'pending')) NOT NULL DEFAULT 'pending',
    due_date DATE NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Team Members Table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT,
    current_task TEXT,
    status TEXT CHECK (status IN ('completed', 'in_progress', 'pending')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Time Logs Table
CREATE TABLE time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL DEFAULT 0, -- Duration in seconds
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (Open for public demo purposes, restrict in production)
CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON team_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON time_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON time_logs FOR SELECT USING (true);

-- Insert Mock Data for demonstration
INSERT INTO projects (title, status, due_date, category) VALUES
('Develop API Endpoints', 'completed', '2024-11-26', 'Backend'),
('Onboarding Flow', 'in_progress', '2024-11-28', 'Frontend'),
('Build Dashboard', 'pending', '2024-11-30', 'Frontend'),
('Optimize Page Load', 'in_progress', '2024-12-05', 'Performance'),
('Cross-Browser Testing', 'pending', '2024-12-06', 'QA');

INSERT INTO team_members (name, role, avatar_url, current_task, status) VALUES
('Alexandra Deff', 'Frontend Dev', 'https://i.pravatar.cc/150?u=1', 'Github Project Repository', 'completed'),
('Edwin Adenike', 'Backend Dev', 'https://i.pravatar.cc/150?u=2', 'Integrate User Authentication System', 'in_progress'),
('Isaac Oluwatemilorun', 'Designer', 'https://i.pravatar.cc/150?u=3', 'Develop Search and Filter Functionality', 'pending'),
('David Oshodi', 'Fullstack', 'https://i.pravatar.cc/150?u=4', 'Responsive Layout for Homepage', 'in_progress');
