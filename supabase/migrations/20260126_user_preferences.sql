-- 4. User Preferences Table (for Grid Layout)
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- Link to auth.users if using Auth, or just unique ID for now
    layout_config JSONB DEFAULT '[]'::JSONB,
    theme TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read preferences" ON user_preferences FOR SELECT USING (true);
CREATE POLICY "Allow public update preferences" ON user_preferences FOR UPDATE USING (true);
CREATE POLICY "Allow public insert preferences" ON user_preferences FOR INSERT WITH CHECK (true);
