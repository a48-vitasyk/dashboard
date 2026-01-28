import { createClient } from '@supabase/supabase-js';

// Define a placeholder type for now, or use 'any' until we generate types
export type Database = any;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'WARNING: Supabase environment variables are missing. Please check .env file.'
    );
}

// Fallback to placeholder if keys are missing (prevents crash in Demo Mode)
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase = createClient<Database>(
    supabaseUrl || fallbackUrl,
    supabaseAnonKey || fallbackKey
);

/**
 * Basic connection test to verify Supabase configuration.
 * Call this function from the browser console or a temporary useEffect to test.
 * Example: import { checkConnection } from '@/lib/supabase'; checkConnection();
 */
export const checkConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            return { success: false, error };
        }

        console.log('✅ Supabase connected successfully!');
        console.log('Sample data from "projects":', data);
        return { success: true, data };
    } catch (err) {
        console.error('❌ Unexpected error connecting to Supabase:', err);
        return { success: false, error: err };
    }
};
