import { useState, useEffect } from 'react';
import { X, Flag, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskPriority, TaskStatus, PRIORITY_TEXT_COLORS } from './types';
import { db } from '@/services/db';
import { cn } from '@/lib/utils';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
    initialStatus?: TaskStatus;
    columns: { id: string; title: string }[];
}

export function CreateTaskModal({ isOpen, onClose, onTaskCreated, initialStatus = 'backlog', columns }: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [status, setStatus] = useState<TaskStatus>(initialStatus);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset status when modal opens with a new initialStatus
    useEffect(() => {
        if (isOpen) {
            setStatus(initialStatus);
        }
    }, [isOpen, initialStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            await db.createTask({
                title,
                subtitle,
                priority,
                status,
                dueDate: new Date().toISOString(), // Default to today
                attachmentsCount: 0,
                commentsCount: 0,
            });

            // Reset form
            setTitle('');
            setSubtitle('');
            setPriority('medium');
            setStatus('backlog');

            onTaskCreated();
            onClose();
        } catch (error) {
            console.error('Failed to create task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Task</h2>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                        >
                                            <X className="w-5 h-5 text-slate-500" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Title Input */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="What needs to be done?"
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                                                autoFocus
                                            />
                                        </div>

                                        {/* Category/Subtitle Input */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category / Subtitle</label>
                                            <div className="relative">
                                                <Tag className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={subtitle}
                                                    onChange={(e) => setSubtitle(e.target.value)}
                                                    placeholder="e.g. Design System"
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Priority Select */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</label>
                                                <div className="relative">
                                                    <select
                                                        value={priority}
                                                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none text-slate-900 dark:text-white font-medium cursor-pointer"
                                                    >
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                        <option value="urgent">Urgent</option>
                                                    </select>
                                                    <Flag className={cn("absolute left-4 top-3.5 w-4 h-4", PRIORITY_TEXT_COLORS[priority])} />
                                                </div>
                                            </div>

                                            {/* Status Select */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                                                <div className="relative">
                                                    <select
                                                        value={status}
                                                        onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none text-slate-900 dark:text-white font-medium cursor-pointer"
                                                    >
                                                        {columns.map(col => (
                                                            <option key={col.id} value={col.id}>{col.title}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute left-4 top-3.5 w-4 h-4 rounded-full border-2 border-slate-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!title.trim() || isSubmitting}
                                        className={cn(
                                            "px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95",
                                            (!title.trim() || isSubmitting) ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-600 hover:shadow-emerald-500/30"
                                        )}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Task'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
