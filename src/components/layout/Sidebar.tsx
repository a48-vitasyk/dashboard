import { useLocation, Link } from 'react-router-dom';
import { navigationConfig } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth';
import { useSidebarStore } from '@/stores/sidebar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAppConfig } from '@/stores/config';

export function Sidebar() {
    const location = useLocation();
    const { isAdmin } = useAuthStore();
    const { isOpen } = useSidebarStore();
    const { isDemoMode, toggleDemoMode } = useAppConfig();

    const filteredSections = navigationConfig.map((section) => ({
        ...section,
        items: section.items.filter((item) => !item.adminOnly || isAdmin()),
    }));

    return (
        <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0, width: isOpen ? 240 : 80 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed left-0 top-0 h-screen z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all duration-300"
        >
            <div className="flex flex-col h-full py-6">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 mb-8">
                    <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>
                    {isOpen && (
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Donezo</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto">
                    {filteredSections.map((section, idx) => (
                        <div key={idx} className="mb-6">
                            {section.title && isOpen && (
                                <h3 className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                    {section.title}
                                </h3>
                            )}
                            <ul className="space-y-0.5 px-3">
                                {section.items.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    const Icon = item.icon;

                                    return (
                                        <li key={item.href} className="relative">
                                            {/* Active Indicator - Perfect Vertical Bar */}
                                            {isActive && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 dark:bg-emerald-500 rounded-r-full" />
                                            )}

                                            <Link
                                                to={item.href}
                                                className={cn(
                                                    'flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200',
                                                    isActive
                                                        ? 'bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 font-semibold'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                                )}
                                            >
                                                <Icon className={cn(
                                                    'w-[18px] h-[18px] flex-shrink-0',
                                                    isActive ? 'text-emerald-800 dark:text-emerald-400' : 'text-muted-foreground group-hover:text-foreground'
                                                )} />
                                                {isOpen && (
                                                    <span className="flex-1 text-sm">{item.label}</span>
                                                )}
                                                {isOpen && item.badge && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-900 dark:bg-emerald-500 text-white rounded-[4px]">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer / Demo Toggle */}
                <div className="px-6 pb-2">
                    <div className={cn(
                        "flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 transition-all",
                        isOpen ? "justify-between" : "justify-center"
                    )}>
                        {isOpen && <span className="text-xs font-semibold text-gray-500">Demo Mode</span>}

                        <button
                            onClick={toggleDemoMode}
                            className={cn(
                                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                                isDemoMode ? "bg-emerald-600" : "bg-gray-300"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out",
                                    isDemoMode ? "translate-x-4.5" : "translate-x-1"
                                )}
                                style={{ transform: isDemoMode ? 'translateX(18px)' : 'translateX(2px)' }}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}
