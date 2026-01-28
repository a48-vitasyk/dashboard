/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DB_TYPE: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_DB_HOST: string;
    readonly VITE_DB_PORT: string;
    readonly VITE_DB_NAME: string;
    readonly VITE_DB_USER: string;
    readonly VITE_DB_PASSWORD: string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly VITE_GOOGLE_CLIENT_SECRET: string;
    readonly VITE_SLACK_CLIENT_ID: string;
    readonly VITE_SLACK_CLIENT_SECRET: string;
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
