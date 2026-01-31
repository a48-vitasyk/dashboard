import { Task, PRIORITY_COLORS, PRIORITY_TEXT_COLORS } from './types';
import { Calendar, Paperclip, MessageSquare, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TaskCardProps {
    task: Task;
    index: number;
    onClick?: () => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={onClick}
            className={cn(
                "bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 cursor-grab active:cursor-grabbing border-t-4",
                PRIORITY_COLORS[task.priority]
            )}
        >
            {/* Title and Subtitle */}
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 line-clamp-2">
                {task.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                {task.subtitle}
            </p>

            {/* Footer with Meta Info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {/* Priority Flag */}
                    <Flag className={cn("w-4 h-4", PRIORITY_TEXT_COLORS[task.priority])} />

                    {/* Due Date */}
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(task.dueDate)}</span>
                    </div>

                    {/* Attachments */}
                    {task.attachmentsCount > 0 && (
                        <div className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            <span>{task.attachmentsCount}</span>
                        </div>
                    )}

                    {/* Comments */}
                    {task.commentsCount > 0 && (
                        <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{task.commentsCount}</span>
                        </div>
                    )}
                </div>

                {/* Assignee Avatar */}
                {task.assigneeAvatar && (
                    <img
                        src={task.assigneeAvatar}
                        alt="Assignee"
                        className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-800"
                    />
                )}
            </div>
        </motion.div>
    );
}
