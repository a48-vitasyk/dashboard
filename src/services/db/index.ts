import { DatabaseService } from './types';
import { MockDatabaseService } from './mock';

import { SupabaseService } from './supabase';

// Determine which DB service to use based on environment
const dbType = import.meta.env.VITE_DB_TYPE || 'mock';

let dbInstance: DatabaseService;

switch (dbType) {
    case 'mock':
        dbInstance = new MockDatabaseService();
        console.log('✅ Using MOCK Database');
        break;
    case 'supabase':
        dbInstance = new SupabaseService();
        console.log('✅ Using SUPABASE Database');
        break;
    default:
        dbInstance = new MockDatabaseService();
}

export const db = dbInstance;
