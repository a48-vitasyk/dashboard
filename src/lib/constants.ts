import {
    LayoutDashboard,
    CheckSquare,
    Calendar,
    Users,
    TrendingUp,
    Settings,
    LogOut,
    FolderKanban,
    FileBarChart,
    Plug,
    UserCog,
} from 'lucide-react';

export interface NavItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    adminOnly?: boolean;
    badge?: string;
}

export interface NavSection {
    title?: string;
    items: NavItem[];
}

export const navigationConfig: NavSection[] = [
    {
        title: 'MENU',
        items: [
            {
                label: 'Dashboard',
                icon: LayoutDashboard,
                href: '/',
            },
            {
                label: 'Tasks',
                icon: CheckSquare,
                href: '/tasks',
                badge: '12+',
            },
            {
                label: 'Calendar',
                icon: Calendar,
                href: '/calendar',
            },
            {
                label: 'Team',
                icon: Users,
                href: '/team',
            },
            {
                label: 'Projects',
                icon: FolderKanban,
                href: '/projects',
            },
            {
                label: 'Reports',
                icon: FileBarChart,
                href: '/reports',
            },
            {
                label: 'Analytics',
                icon: TrendingUp,
                href: '/analytics',
            },
            {
                label: 'Integrations',
                icon: Plug,
                href: '/integrations',
                adminOnly: true,
            },
        ],
    },
    {
        title: 'GENERAL',
        items: [
            {
                label: 'User Access',
                icon: UserCog,
                href: '/user-access',
                adminOnly: true,
            },
            {
                label: 'Settings',
                icon: Settings,
                href: '/settings',
            },
            {
                label: 'Logout',
                icon: LogOut,
                href: '/logout',
            },
        ],
    },
];
