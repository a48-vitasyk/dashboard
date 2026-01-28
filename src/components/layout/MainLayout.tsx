import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarStore } from '@/stores/sidebar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const { isOpen } = useSidebarStore();

    return (
        <div className="min-h-screen bg-gray-50/40 dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />

            <div
                className={cn(
                    'transition-smooth',
                    isOpen ? 'ml-[240px]' : 'ml-[80px]'
                )}
            >
                <Header />

                <main className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
