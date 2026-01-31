import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Column } from './types';
import { TaskCard } from './TaskCard';
import { Plus, MoreHorizontal, Circle, Clock, CheckCircle2, Pencil, Trash2, X, Check } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface KanbanColumnProps {
    column: Column;
    isDropDisabled?: boolean;
    onTaskClick?: (task: any) => void;
    onAddClick?: () => void;
    onRename?: (newTitle: string) => void;
    onDelete?: () => void;
}

const COLUMN_ICONS: Record<string, any> = {
    backlog: Circle,
    todo: Circle,
    in_progress: Clock,
    for_review: CheckCircle2,
};

const COLUMN_ICON_COLORS: Record<string, string> = {
    backlog: 'text-gray-400',
    todo: 'text-red-500',
    in_progress: 'text-yellow-500',
    for_review: 'text-blue-500',
};

export function KanbanColumn({ column, isDropDisabled = false, onTaskClick, onAddClick, onRename, onDelete }: KanbanColumnProps) {
    const Icon = COLUMN_ICONS[column.id] || Circle;
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(column.title);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleRenameSubmit = () => {
        if (editTitle.trim()) {
            onRename?.(editTitle);
        } else {
            setEditTitle(column.title); // Revert if empty
        }
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col bg-[#F8F9FA] dark:bg-slate-900 rounded-2xl p-3 relative">

            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 flex-1">
                    <Icon className={cn("w-4 h-4 shrink-0", COLUMN_ICON_COLORS[column.id])} />

                    {isEditing ? (
                        <div className="flex items-center gap-1 flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full text-sm font-semibold bg-white dark:bg-slate-800 border border-emerald-500 rounded px-1 py-0.5 outline-none text-slate-900 dark:text-white"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameSubmit();
                                    if (e.key === 'Escape') {
                                        setEditTitle(column.title);
                                        setIsEditing(false);
                                    }
                                }}
                            />
                            <button onClick={handleRenameSubmit} className="p-0.5 text-emerald-500 hover:bg-emerald-50 rounded">
                                <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setEditTitle(column.title); setIsEditing(false); }} className="p-0.5 text-slate-400 hover:bg-slate-100 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                {column.title}
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                                {column.tasks.length}
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-1 relative">
                    <button
                        onClick={onAddClick}
                        className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Add task"
                    >
                        <Plus className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Column menu"
                    >
                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </button>

                    {/* Column Menu */}
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                ref={menuRef}
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                            >
                                <div className="p-1 flex flex-col">
                                    <button
                                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Rename
                                    </button>
                                    <button
                                        onClick={() => { onDelete?.(); setShowMenu(false); }}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Droppable Task List */}
            <Droppable droppableId={column.id} isDropDisabled={isDropDisabled}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            "space-y-3 px-1 pb-2", // Removed overflow-y-auto and flex-1
                            snapshot.isDraggingOver && "bg-blue-50/50 dark:bg-blue-900/10 rounded-lg"
                        )}
                    >
                        {column.tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => {
                                    const child = (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={provided.draggableProps.style}
                                            className={cn(
                                                snapshot.isDragging && "opacity-100 ring-2 ring-emerald-500 shadow-xl z-50 rounded-xl mt-12 pointer-events-none"
                                            )}
                                        >
                                            <TaskCard
                                                task={task}
                                                index={index}
                                                onClick={() => onTaskClick?.(task)}
                                            />
                                        </div>
                                    );

                                    if (snapshot.isDragging) {
                                        return createPortal(child, document.body);
                                    }

                                    return child;
                                }}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Empty State */}
                        {column.tasks.length === 0 && (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                                No tasks
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
