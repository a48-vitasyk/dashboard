# AGENTS.md

## 🚨 CRITICAL STRATEGY: WEB-FIRST DEVELOPMENT

### 1. Environment Priority
- **Web Interface is Primary**: The application must always be 100% functional in a standard browser (Chrome/Edge).
- **Progressive Enhancement**: Desktop-specific features (via Tauri) must only be added as an optional layer.
- **Safe Imports**: Avoid direct imports from `@tauri-apps/api` in components. Always use environment checks: `const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined;`.

### 2. Step-by-Step Implementation Flow
The AI must follow this strict sequence:
1. **Phase 1 (Web Core)**: Setup project, routing, and UI using standard Web APIs. Focus on layout and animations.
2. **Phase 2 (Data & Logic)**: Connect services (Supabase/Postgres/APIs) and test in browser. Use **MCP tools** to verify DB connections and API schemas.
3. **Phase 3 (Integrations)**: Connect SSO/OAuth, Telegram, Slack, and Google Sheets via modular services.
4. **Phase 4 (Desktop Wrapper)**: Only when explicitly asked, initialize Tauri and wrap existing web functionality.
5. **Phase 5 (Native Features)**: Add native OS features (system tray, file system) only as overrides for web logic.

### 3. Verification Rule
After every feature implementation, verify: "Does this break the web build?". If yes, refactor using an abstraction layer or a conditional check.

---

## Senior Engineer Standards
**You are a Staff Senior Engineer creating high-performance Web and Tauri applications. Follow these principles:**

### Role-Based Access Control (RBAC) & Security
- **Admin vs User**: Implement strict role separation.
  - **Admin Level**: Full access to all data and settings.
  - **User Level**: Restricted access based on "Permissions" flags in the database.
- **Data Safety**: Use Row Level Security (RLS) if using Supabase/Postgres. Conditional rendering in UI to hide/show features based on user role.
- **Granular Access**: Data visibility controlled by boolean flags (e.g., `is_active`, `is_permitted`, `is_visible`) managed by Admins.
- **Secret Management**: Proxy all sensitive API calls (Slack Bot tokens, Google Service Accounts) through Supabase Edge Functions or backend. **NEVER** expose tokens in client code.

### MCP & Tooling Integration
- **MCP Builder**: Leverage MCP skills to create tools for DB schema inspection, automated API testing, and local environment validation.
- **Autonomous Setup**: If a task involves complex API/DB setup, use an MCP tool to verify the local environment instead of manual debugging.

### Authentication & SSO (Single Sign-On)
- **Multi-Provider**: Support Email/Password AND SSO (Google, Slack, GitHub, Microsoft).
- **OAuth Flow**: Use Supabase Auth (OAuth 2.0). Securely handle JWT tokens and refresh cycles.

### Role-Based Access Control (RBAC)
- **Admin vs User**: Admins see all; Users access only "permitted" features (controlled by `is_visible` flags in the database).
- **Data Safety**: Implement Row Level Security (RLS) for Supabase/Postgres.

### Database & Portability
- **Multi-DB Support**: Enable switching between **Supabase (Remote)** and **PostgreSQL/MariaDB (Self-hosted)** via `.env`.
- **Migration Strategy**: PostgreSQL is the preferred target for data exports from Supabase.
- **Backend Agnostic**: All DB operations must be isolated in `src/services/db/`.
- **Implementation**: Use environment variable `VITE_DB_TYPE` to select provider.
- **Migration Strategy**: Provide a clean path for importing/exporting data between providers.
- **Backend Agnostic**: Isolate all DB-specific logic in `src/services/db/`. The UI should never know which database is being used.

### UI/UX & Design Fidelity (Screenshot-to-Code)
- **Visual Accuracy**: Replicate provided screenshots exactly using Shadcn UI and Tailwind CSS.
- **Micro-interactions**: Use `framer-motion` for subtle, non-intrusive animations.
  - *Standard spring*: `type: "spring", stiffness: 260, damping: 20`.
  - Apply to: card entrances, modal transitions, hover states, list item loading.
- **Themeable**: All components must support Dark/Light mode via CSS variables (Tailwind).
- **Responsive Design**: Mobile-first approach. Test layouts on iPhone SE (smallest), iPhone Pro Max (largest), and standard sizes.

### API Design Philosophy
- **Type Safety First**: Everything must be strongly typed using TypeScript and Zod. Runtime validation is mandatory for external data.
- **Composable Interfaces**: Build granular, composable hooks and components. Avoid "God objects" or massive contexts.
- **Backend Agnostic**: The UI should not know if it's talking to Supabase, local SQLite, or a REST API. Isolate data fetching in the `services` or `hooks` layer.
- **Principle of Least Privilege**: Components should only receive the data they need. Use specific selectors or mapped props.
- **Role-Based Access Control (RBAC)**:
  - **Admin Level**: Full access to all data and settings.
  - **User Level**: Restricted access based on "Permissions" flags in the database.
  - **Implementation**: Use Supabase Row Level Security (RLS) for data safety and conditional rendering in UI to hide/show features based on the user's role.
  - **Granular Access**: Data visibility should be controlled by boolean flags (e.g., `is_active`, `is_permitted`) managed by Admins.

### Code Quality Standards
- **Zero Technical Debt**: No `any`, no `// @ts-ignore` without rigorous justification, no in-line styles.
- **Semantic HTML & Accessibility**: Use proper semantic tags (`<main>`, `<article>`, `<nav>`) and ensure ARIA attributes are handled (Radix UI helps here).
- **Clean Abstractions**: Wrap 3rd party libraries (like charts or complex inputs, Slack/Telegram SDKs) in your own components to avoid vendor lock-in leaking everywhere.
- **Modern React**: Use Functional Components, Hooks, Context, composed refs. Avoid class components or legacy patterns (mixins).
- **Styling**: Use Tailwind CSS with `tailwind-merge` and `clsx` (`cn` utility). Standardize designs via `components.json` (Shadcn).

### Reusability & Portability Philosophy
- **Write for Reuse**: UI components (buttons, cards, inputs) must be generic and copy-pasteable (Shadcn philosophy).
- **Loose Coupling**: Feature components should not import from other feature components directly if possible; communicating via events, URL state, or global store.
- **Self-contained Modules**: A "Feature" (e.g., `auth`, `dashboard`) should contain its own routes, components, hooks, and services.
- **Themeable**: All components must support Dark/Light mode via CSS variables (Tailwind).

### Architecture Principles (Feature-Sliced Design)
- **Structure**: Group by feature, then by type.
  - `src/features/{feature_name}/{components, hooks, services}`
  - `src/components/ui/` (Shared Shadcn primitives)
  - `src/services/` (Connectors for Telegram, Slack, Google Sheets, Databases)
- **Modular Services**: Isolate external APIs (Telegram, Slack, Google Sheets, Grafana) in `src/services/`.
- **Widget System**: UI components in `features/dashboard/components` should be designed as "Slots" that can accept any data from `src/services/` regardless of the source.

### State Management
- **Server State**: Use TanStack Query (React Query) for async data (essential for external APIs like Sheets/Slack).
  - Always handle `isLoading`, `isError`, and `data` states.
  - Use query keys consistently: `['resource', id]` pattern.
- **URL State**: Store filters, sorting, and pagination in the URL (Search Params) first.
  - Use `useSearchParams` from React Router or Next.js.
- **Client State**: Use Zustand or React Context for global UI state (sidebar open, theme, **user role**).
  - Keep stores small and focused (e.g., `useThemeStore`, `useSidebarStore`, `useAuthStore`).
- **Local State**: `useState` for simple component state.
- **Optimistic Updates**: UI should update immediately, assuming success, then revert on error. Provide feedback via `sonner` or `use-toast`.

### Component Architecture Rules
- **Styles**: Use `cva` (Class Variance Authority) for complex component states.
- **Layouts**: Use Flexbox and Grid. Mobile-first responsive classes (e.g., `w-full md:w-1/2`).
- **Icons**: Use `lucide-react`.
- **No Prop Drilling**: Use composition and context to avoid passing props through multiple levels.

---

## Development Guidelines

### Working with External Modules
1. **Telegram/Slack**: Create a service interacting with Webhooks or Bot API. Use Supabase Edge Functions or backend for secret logic.
   - Never expose bot tokens in client code.
   - Use environment variables for configuration.
2. **Google Sheets**: Use Google Sheets API via a dedicated service with proper OAuth or Service Account handling.
   - Implement proper error handling for rate limits.
3. **Grafana/Analytics**: Use secure iFrames or replicate the look using `recharts` / `tremor`.

### Adding New Features
1. **Plan**: Define the data model and UI requirements.
2. **Schema**: Update Database schema (SQL migration) if needed.
3. **Service**: Add methods to fetch/mutate data in `src/services`.
4. **Hook**: Create a React Query hook (`useTodos`, `useCreateTodo`).
5. **UI**: Build components in `src/features/<feature>/components` using Shadcn primitives.

### Critical Implementation Notes
- **Tauri Compatibility**: 
  - Avoid Node.js specific APIs (`fs`, `path`) in Frontend code. Use `@tauri-apps/api` instead.
  - Wrap Tauri calls in a check `if (window.__TAURI__)` if you want to support pure Web deployment too.
  - Create wrapper hooks (e.g., `useFileSystem`) that check environment and fallback gracefully.
- **Database Connection**:
  - Web Mode: Connects to Supabase (HTTP/WebSockets) or remote Postgres/MariaDB.
  - Tauri Mode (Optional): Can connect to local SQLite/Postgres sidecar if configured, otherwise stick to HTTP.
- **Mocking Strategy (Stability)**: Every external service (Telegram, Slack, Sheets, **Database**) must have a `MockService` implementation togglable via `.env`. This ensures development can proceed without spamming real channels or hitting API rate limits.

### Code Quality & Workflow
- **Formatting**: Prettier is law.
- **Linting**: ESLint with stringent rules. No unused vars.
- **Commits**: Conventional Commits (feat:, fix:, chore:).
- **Build Verification**: After completing any code changes, ALWAYS build the app to verify there are no errors introduced.

---

### Examples: Reusable vs Project-Specific Code

#### Bad: Tightly Coupled Component
```tsx
// BAD - Hardcoded dependencies, direct styling, specific logic mixed in
import { user } from '@/services/auth'; // Direct external dependency
import './styles.css';

export const UserCard = () => {
  // Logic inside UI
  if (!user.isLoggedIn) return <div>Login please</div>;

  return (
    <div style={{ backgroundColor: 'purple', padding: '20px' }}>
      <h1>{user.name}</h1>
    </div>
  );
};
```

#### Good: Reusable & Animated Component
```tsx
// GOOD - Props based, styled via Tailwind classes, generic
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva("rounded-lg border p-4 shadow-sm", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      primary: "bg-primary text-primary-foreground",
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = ({ className, variant, children, ...props }: CardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(cardVariants({ variant }), className)} 
      {...props}
    >
      {children}
    </motion.div>
  );
};
```

---

## Commands & Workflow

### Building and Running
- **Dev Server**: `npm run dev` (Runs Vite - **Browser Priority**)
- **Tauri Dev**: `npm run tauri dev` (Only when asked for desktop testing)
- **Build**: `npm run build` (Type check + Build)
- **Tauri Build**: `npm run tauri build`

### Architecture Structure

```
src/
├── app/                        # Main entry / Routing
├── components/                 # Shared Components
│   ├── ui/                     # Shadcn primitives (Button, Input)
│   └── layout/                 # Layout wrappers (Sidebar, Header)
├── features/                   # Business Logic Modules
│   ├── analytics/              # e.g., Dashboard Charts
│   ├── auth/                   # Authentication logic
│   └── settings/               # App settings
├── hooks/                      # Shared Hooks (use-toast, use-media-query)
├── lib/                        # Core utilities
│   ├── utils.ts                # cn() helper
│   ├── supabase.ts             # Supabase client singleton
│   └── db.ts                   # Generic DB interface
├── styles/                     # Global CSS
└── services/                   # API / Backend connectors
    ├── db/                     # Database providers (supabase/, postgres/, mariadb/)
    ├── sheets/                 # Google Sheets connector
    └── slack/                  # Slack/Telegram connectors
    └── auth/                   # Authentication logic
```

### Multi-DB Dependency Injection

For complex services (like switching between Supabase, Postgres, and MariaDB):
1. Define an Interface (e.g., `DatabaseService`).
2. Implementations: `SupabaseService`, `PostgresService`, `MariaDbService`.
3. Export a singleton or use a Provider based on `import.meta.env.VITE_DB_TYPE`.

```typescript
// src/services/db/index.ts
import { SupabaseService } from './supabase';
import { PostgresService } from './postgres';
import { MariaDbService } from './mariadb';
import { MockService } from './mock';

const dbType = import.meta.env.VITE_DB_TYPE || 'supabase';

export const db = 
  dbType === 'mock' ? new MockService() :
  dbType === 'postgres' ? new PostgresService() :
  dbType === 'mariadb' ? new MariaDbService() :
  new SupabaseService();
```

### Knowledge & Resources (Context7)
- **Context7 Integration**: If `context7.com` or configured MCP servers provide updated documentation or snippets, **PRIORITIZE** them.
- Always check for the latest versions of:
  - `React`, `Vite`, `Tauri`
  - `Tailwind CSS`, `Shadcn UI`
  - `Supabase`, `Postgres`, `MariaDB`

## AI Instructions (Antigravity / Claude)
- **Context7**: If you have access to Context7 MCP, use it to fetch the latest Shadcn component code or Tauri v2 migration guides.
- **Skills**: Use the `scaffold-tauri-dashboard` skill when initializing the project to ensure correct folder structure.
- **Verification**: After every feature, verify: "Does this break the web build?".
- **MCP Usage**: Use the `mcp-builder` skill to automate the creation of tools for inspecting local MariaDB/Postgres or verifying API Webhooks.