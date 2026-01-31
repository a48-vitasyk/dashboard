import { useState, useEffect, useRef } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column, TaskStatus, Task } from './types';
import { KanbanColumn } from './KanbanColumn';
import { db } from '@/services/db';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailsModal } from './TaskDetailsModal';
import { CreateColumnModal } from './CreateColumnModal';
import { Plus, Filter, ArrowUpDown, ChevronDown, Layout } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function TasksView() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDraggingBoard, setIsDraggingBoard] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
    const [createModalStatus, setCreateModalStatus] = useState<TaskStatus>('backlog');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [columns, setColumns] = useState<Column[]>(() => {
        const saved = localStorage.getItem('kanban-columns');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved columns', e);
            }
        }
        return [
            { id: 'backlog', title: 'Backlog', tasks: [] },
            { id: 'todo', title: 'To Do', tasks: [] },
            { id: 'in_progress', title: 'In Progress', tasks: [] },
            { id: 'for_review', title: 'For Review', tasks: [] },
        ];
    });

    // Persist columns to localStorage whenever they change (title or count)
    // Note: We only want to save structure, not tasks, but here we have tasks in the state.
    // We should separate structure persistence.
    useEffect(() => {
        const structure = columns.map(({ id, title }) => ({ id, title, tasks: [] }));
        localStorage.setItem('kanban-columns', JSON.stringify(structure));
    }, [columns]);

    const [isLoading, setIsLoading] = useState(true);

    // Filter & Sort State
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    const fetchTasks = async () => {
        try {
            const tasks = await db.getTasks();
            setAllTasks(tasks);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load & Real-time subscription
    useEffect(() => {
        fetchTasks();

        // Subscribe to real-time updates if supported
        let unsubscribe: (() => void) | undefined;
        if (db.subscribeToTasks) {
            unsubscribe = db.subscribeToTasks(() => {
                // Refresh tasks on any change
                fetchTasks();
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Apply Filters & Sort whenever dependencies change
    useEffect(() => {
        let processedTasks = [...allTasks];

        // 1. Filter
        if (filterPriority !== 'all') {
            processedTasks = processedTasks.filter(t => t.priority === filterPriority);
        }

        // 2. Sort
        processedTasks.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime();
            }
            if (sortBy === 'oldest') {
                return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
            }
            if (sortBy === 'priority') {
                const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
                return priorityWeight[b.priority] - priorityWeight[a.priority];
            }
            return 0;
        });

        // 3. Distribute to Columns
        setColumns(prev => prev.map(col => ({
            ...col,
            tasks: processedTasks.filter(t => t.status === col.id)
        })));

    }, [allTasks, filterPriority, sortBy]);

    const [isTaskDragging, setIsTaskDragging] = useState(false);

    // ... (existing handlers)

    const handleDragStart = () => {
        setIsTaskDragging(true);
    };

    const handleDragEnd = async (result: DropResult) => {
        setIsTaskDragging(false);
        const { source, destination } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        // Optimistic UI Update relative to current columns
        const sourceColumnIndex = columns.findIndex(col => col.id === source.droppableId);
        const destColumnIndex = columns.findIndex(col => col.id === destination.droppableId);
        const sourceColumn = columns[sourceColumnIndex];
        const destColumn = columns[destColumnIndex];
        const taskToMove = sourceColumn.tasks[source.index];

        // Update local columns state immediately for smoothness
        if (source.droppableId === destination.droppableId) {
            const newTasks = Array.from(sourceColumn.tasks);
            newTasks.splice(source.index, 1);
            newTasks.splice(destination.index, 0, taskToMove);
            const newColumns = [...columns];
            newColumns[sourceColumnIndex] = { ...sourceColumn, tasks: newTasks };
            setColumns(newColumns);
        } else {
            const sourceTasks = Array.from(sourceColumn.tasks);
            const destTasks = Array.from(destColumn.tasks);
            sourceTasks.splice(source.index, 1);
            const updatedTask = { ...taskToMove, status: destination.droppableId as TaskStatus };
            destTasks.splice(destination.index, 0, updatedTask);
            const newColumns = [...columns];
            newColumns[sourceColumnIndex] = { ...sourceColumn, tasks: sourceTasks };
            newColumns[destColumnIndex] = { ...destColumn, tasks: destTasks };
            setColumns(newColumns);

            // Update main data source (allTasks) so filters don't revert the change
            setAllTasks(prev => prev.map(t =>
                t.id === taskToMove.id ? { ...t, status: destination.droppableId as TaskStatus } : t
            ));

            // Persist change to DB
            try {
                await db.updateTask(taskToMove.id, { status: destination.droppableId as TaskStatus });
            } catch (error) {
                console.error('Failed to update task status:', error);
                fetchTasks();
            }
        }
    };

    const handleCreateColumn = (title: string) => {
        const id = title.toLowerCase().replace(/\s+/g, '_');
        // Ensure unique ID
        if (columns.some(c => c.id === id)) {
            alert("Column with this name already exists");
            return;
        }
        setColumns(prev => [...prev, { id, title, tasks: [] }]);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent if clicking on interactive elements
        if ((e.target as HTMLElement).closest('button') ||
            (e.target as HTMLElement).closest('[data-rbd-drag-handle-id]')) {
            return;
        }
        // Prevent if a task is being dragged
        if (isTaskDragging) return;

        if (!containerRef.current) return;
        setIsDraggingBoard(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDraggingBoard(false);
    };

    const handleMouseUp = () => {
        setIsDraggingBoard(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingBoard || !containerRef.current || isTaskDragging) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed multiplier
        containerRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className="min-h-screen pb-10">
            {/* Header */}
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Actions</h1>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white border-b-2 border-purple-600 pb-1">
                        <Layout className="w-4 h-4 text-purple-600" />
                        All
                    </button>
                    <button className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white pb-1">
                        5 Views
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* Controls Bar */}
            <motion.div
                className="flex gap-3 mb-6 flex-wrap"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Action
                </button>

                {/* Filter Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border rounded-full text-sm font-medium transition-colors",
                            filterPriority !== 'all'
                                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        {filterPriority === 'all' ? 'Filter' : `Priority: ${filterPriority}`}
                        <ChevronDown className={cn("w-3 h-3 transition-transform", showFilterMenu ? "rotate-180" : "")} />
                    </button>

                    {showFilterMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full mt-2 left-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden"
                            >
                                <div className="p-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</div>
                                    {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => { setFilterPriority(p); setShowFilterMenu(false); }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                                filterPriority === p
                                                    ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border rounded-full text-sm font-medium transition-colors",
                            sortBy !== 'newest'
                                ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        )}
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        Ordering
                        <ChevronDown className={cn("w-3 h-3 transition-transform", showSortMenu ? "rotate-180" : "")} />
                    </button>

                    {showSortMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full mt-2 left-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden"
                            >
                                <div className="p-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort By</div>
                                    {[
                                        { id: 'newest', label: 'Newest First' },
                                        { id: 'oldest', label: 'Oldest First' },
                                        { id: 'priority', label: 'Priority (High)' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => { setSortBy(opt.id as any); setShowSortMenu(false); }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                                sortBy === opt.id
                                                    ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </div>
            </motion.div>

            {isLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[300px] bg-slate-100 dark:bg-slate-800/50 rounded-xl h-[500px] animate-pulse" />
                    ))}
                </div>
            ) : (
                /* Kanban Board */
                <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
                    <div
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className={cn(
                            "flex flex-col md:flex-row gap-4 pb-6 overflow-x-auto items-start",
                            isDraggingBoard ? "cursor-grabbing select-none" : "cursor-grab"
                        )}
                    >
                        {columns.map((column, index) => (
                            <motion.div
                                key={column.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className="w-full md:w-[320px] min-w-[280px]"
                            >
                                <KanbanColumn
                                    column={column}
                                    onTaskClick={(task) => setSelectedTask(task)}
                                    // ...
                                    onAddClick={() => {
                                        setCreateModalStatus(column.id as TaskStatus);
                                        setIsCreateModalOpen(true);
                                    }}
                                    onRename={(newTitle) => {
                                        setColumns(prev => prev.map(c =>
                                            c.id === column.id ? { ...c, title: newTitle } : c
                                        ));
                                    }}
                                    onDelete={() => {
                                        if (column.tasks.length > 0) {
                                            alert("Cannot delete column with tasks. Please move or delete tasks first.");
                                            return;
                                        }
                                        if (confirm(`Delete column "${column.title}"?`)) {
                                            setColumns(prev => prev.filter(c => c.id !== column.id));
                                        }
                                    }}
                                />
                            </motion.div>
                        ))}

                        {/* Add Column Button */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-full md:w-[320px] min-w-[280px] h-full max-h-[100px]"
                        >
                            <button
                                onClick={() => setIsCreateColumnModalOpen(true)}
                                className="w-full h-[60px] flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Add Column
                            </button>
                        </motion.div>
                    </div>
                </DragDropContext>
            )}

            {/* Modals */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                initialStatus={createModalStatus}
                onClose={() => setIsCreateModalOpen(false)}
                onTaskCreated={fetchTasks}
                columns={columns}
            />

            <TaskDetailsModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                onTaskUpdated={fetchTasks}
                columns={columns}
            />

            <CreateColumnModal
                isOpen={isCreateColumnModalOpen}
                onClose={() => setIsCreateColumnModalOpen(false)}
                onCreate={handleCreateColumn}
            />
        </div>
    );
}
