import { DatabaseService } from './types';
import { MockDatabaseService } from './mock';

// Determine which DB service to use based on environment
const dbType = import.meta.env.VITE_DB_TYPE || 'mock';

let dbInstance: DatabaseService;

switch (dbType) {
    case 'mock':
        dbInstance = new MockDatabaseService();
        break;
    // Future: Add Supabase, Postgres, MariaDB cases
    // case 'supabase':
    //   dbInstance = new SupabaseService();
    //   break;
    default:
        dbInstance = new MockDatabaseService();
}

export const db = dbInstance;
