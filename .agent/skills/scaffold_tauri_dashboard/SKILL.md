---
name: scaffold-tauri-dashboard
description: Scaffold a Modern Web/Tauri Dashboard with React, Tailwind, Shadcn UI, Multi-DB support (Supabase/Postgres/MariaDB), RBAC, and external API integrations (Telegram, Slack, Google Sheets).
---

# Scaffold Tauri Dashboard

This skill guides you through creating a professional, production-ready dashboard with Web-First architecture, Multi-DB support, and external API integrations.

## Prerequisites
- Node.js (v18+)
- NPM or Pnpm
- Rust (for Tauri building, optional for web-only development)

## Core Setup Steps

### 1. Initialize Vite Project (React + TypeScript)
If the directory is empty:
```bash
npm create vite@latest . -- --template react-ts
npm install
```

### 2. Setup Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add directives to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Setup Path Aliases
Update `tsconfig.json` (compilerOptions):
```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

Update `vite.config.ts`:
```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```
(Install `@types/node` if needed: `npm install -D @types/node`)

### 4. Initialize Shadcn UI
```bash
npx shadcn@latest init
```
*Prompts:*
- Style: `New York`
- Base Color: `Zinc`
- CSS variables: `yes`

### 5. Install Core Dependencies
```bash
npm install class-variance-authority clsx tailwind-merge lucide-react framer-motion
npm install @tanstack/react-query zustand zod
```

### 6. Setup Feature-Sliced Architecture
Create the standard directory structure:
```bash
mkdir -p src/app src/components/ui src/components/layout src/features src/hooks src/lib src/services/db src/services/sheets src/services/slack src/styles
```

Create `src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 7. Multi-DB Setup (Supabase/Postgres/MariaDB)

Install database clients:
```bash
npm install @supabase/supabase-js
# For self-hosted Postgres/MariaDB (optional):
npm install pg mysql2
```

Create `.env` file:
```env
# Database Configuration
VITE_DB_TYPE=supabase  # Options: 'supabase' | 'postgres' | 'mariadb' | 'mock'

# Supabase (if using)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Self-hosted Postgres/MariaDB (if using)
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=dashboard
VITE_DB_USER=user
VITE_DB_PASSWORD=password
```

Create `src/services/db/index.ts`:
```typescript
// Database abstraction layer - supports switching between providers
const dbType = import.meta.env.VITE_DB_TYPE || 'supabase';

export const db = 
  dbType === 'mock' ? new MockDatabaseService() :
  dbType === 'postgres' ? new PostgresService() :
  dbType === 'mariadb' ? new MariaDbService() :
  new SupabaseService();
```

### 8. External API Services Setup

Create service stubs for external integrations:

**Telegram** (`src/services/telegram/index.ts`):
```typescript
// Telegram Bot API integration
// Use Supabase Edge Functions for webhook handling
export class TelegramService {
  // Implementation via Edge Functions to protect bot token
}
```

**Slack** (`src/services/slack/index.ts`):
```typescript
// Slack API integration
// Proxy through backend to protect tokens
export class SlackService {
  // Implementation via Edge Functions
}
```

**Google Sheets** (`src/services/sheets/index.ts`):
```typescript
// Google Sheets API integration
export class GoogleSheetsService {
  // OAuth or Service Account handling
}
```

### 9. RBAC & Auth Setup

Create `src/stores/auth.ts` (Zustand):
```typescript
import { create } from 'zustand';

interface AuthState {
  user: { id: string; role: 'admin' | 'user' } | null;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: () => get().user?.role === 'admin',
}));
```

### 10. Initialize Tauri (Optional - Only When Requested)
```bash
npm install @tauri-apps/cli @tauri-apps/api
npx tauri init
```

## Verification Checklist
- [ ] Run `npm run dev` - Web app starts successfully
- [ ] Tailwind styles are applying (check dark mode toggle)
- [ ] Path aliases work (`@/` imports)
- [ ] Shadcn components can be added (`npx shadcn@latest add button`)
- [ ] Environment variables load correctly
- [ ] Database connection initializes (check console for errors)

## Next Steps After Scaffolding
1. Set up Supabase Row Level Security (RLS) policies for RBAC
2. Create database migrations for user permissions tables
3. Implement authentication flow
4. Add first dashboard feature in `src/features/analytics/`
5. Configure external API credentials in environment variables
