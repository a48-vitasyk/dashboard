import { cn } from '@/lib/utils';
import { ProjectRow } from '@/services/db/types_db';
// Map categories/titles to icons or just use generic ones for now dynamic
import { Share2, RotateCcw, Palette, Zap, Bug, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectListProps {
    projects?: ProjectRow[];
}

export function ProjectList({ projects = [] }: ProjectListProps) {
    // Helper to get icon based on project title or category (simple mapping for demo)
    const getProjectIcon = (index: number) => {
        const icons = [Share2, RotateCcw, Palette, Zap, Bug, FileText];
        const colors = ['bg-blue-500', 'bg-teal-500', 'bg-orange-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
        return {
            Icon: icons[index % icons.length],
            bg: colors[index % colors.length]
        };
    };

    // Limit to 5 projects for the widget view
    const displayProjects = projects.slice(0, 5);

    return (
        <div className="w-full h-full flex flex-col gap-4 p-5 overflow-hidden">
            {/* Header */}
            <motion.div
                className="flex justify-between items-center shrink-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h3 className="text-base font-semibold">Project</h3>
                <button className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-accent transition-smooth">
                    + New
                </button>
            </motion.div>

            {/* Project List */}
            <div className="space-y-3 flex-1 overflow-y-auto">
                {displayProjects.map((project, idx) => {
                    const { Icon, bg } = getProjectIcon(idx);
                    return (
                        <motion.div
                            key={project.id}
                            className="flex items-center gap-3 group cursor-pointer"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                        >
                            <motion.div
                                className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white", bg)}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.1 + 0.3, duration: 0.3, ease: "backOut" }}
                            >
                                <Icon className="w-4 h-4" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium group-hover:text-emerald-700 transition-smooth truncate">
                                    {project.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Due date: {new Date(project.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
                {displayProjects.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No active projects</p>
                )}
            </div>
        </div>
    );
}
