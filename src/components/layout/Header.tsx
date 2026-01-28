import { Moon, Sun, Bell, Mail, Menu } from 'lucide-react';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { useSidebarStore } from '@/stores/sidebar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function Header() {
    const { theme, toggleTheme } = useThemeStore();
    const { user } = useAuthStore();
    const { toggle } = useSidebarStore();

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={cn(
                'sticky top-0 z-30',
                'glass-card border-b',
                'px-6 py-4'
            )}
        >
            <div className="flex items-center justify-between">
                {/* Left: Mobile Menu + Search */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-accent transition-smooth"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search task"
                            className={cn(
                                'w-64 px-4 py-2 pl-10 rounded-lg',
                                'bg-background/50 border border-border',
                                'focus:outline-none focus:ring-2 focus:ring-ring',
                                'transition-smooth'
                            )}
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded">
                            ⌘F
                        </kbd>
                    </div>
                </div>

                {/* Right: Actions + User */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-accent transition-smooth"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? (
                            <Moon className="w-5 h-5" />
                        ) : (
                            <Sun className="w-5 h-5" />
                        )}
                    </button>

                    {/* Notifications */}
                    <button className="p-2 rounded-lg hover:bg-accent transition-smooth relative">
                        <Mail className="w-5 h-5" />
                    </button>

                    <button className="p-2 rounded-lg hover:bg-accent transition-smooth relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                    </button>

                    {/* User Avatar */}
                    {user && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 pl-4 border-l border-border"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-foreground">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <img
                                src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default'}
                                alt={user.name}
                                className="w-10 h-10 rounded-full border-2 border-primary"
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
