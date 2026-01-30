import { useState, useRef, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column, TaskStatus } from './types';
import { KanbanColumn } from './KanbanColumn';
import { mockKanbanTasks } from './mockData';
import { Plus, Circle, Clock, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLUMN_ICONS: Record<TaskStatus, any> = {
    backlog: Circle,
    todo: Circle,
    in_progress: Clock,
    for_review: CheckCircle2,
};

const COLUMN_COLORS: Record<TaskStatus, string> = {
    backlog: 'text-gray-400',
    todo: 'text-red-500',
    in_progress: 'text-yellow-500',
    for_review: 'text-blue-500',
};

export function TasksViewWidget() {
    const [columns, setColumns] = useState<Column[]>([
        {
            id: 'backlog',
            title: 'Backlog',
            tasks: mockKanbanTasks.filter(t => t.status === 'backlog'),
        },
        {
            id: 'todo',
            title: 'To Do',
            tasks: mockKanbanTasks.filter(t => t.status === 'todo'),
        },
        {
            id: 'in_progress',
            title: 'In Progress',
            tasks: mockKanbanTasks.filter(t => t.status === 'in_progress'),
        },
        {
            id: 'for_review',
            title: 'For Review',
            tasks: mockKanbanTasks.filter(t => t.status === 'for_review'),
        },
    ]);

    const [activeTab, setActiveTab] = useState<TaskStatus>('todo');
    const [dragOverTab, setDragOverTab] = useState<TaskStatus | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const tabsContainerRef = useRef<HTMLDivElement>(null);

    const checkScroll = () => {
        if (tabsContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding tolerance
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [columns]);

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsContainerRef.current) {
            const scrollAmount = 150;
            tabsContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleDragEnd = (result: DropResult) => {
        setIsDragging(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        setDragOverTab(null);

        const { source, destination, reason } = result;

        // Fallback Logic:
        // If dropped "nowhere" (destination null) but reason is DROP (not cancelled),
        // and we are currently viewing a different tab than the source,
        // assume user meant to drop it into the currently visible Active Tab.
        let actualDestination = destination;
        if (!destination && reason === 'DROP' && source.droppableId !== activeTab) {
            actualDestination = {
                droppableId: activeTab,
                index: 0 // Add to top if dropped blindly? Or maybe push to end. Let's try top.
            };
        }

        if (!actualDestination) return;
        if (source.droppableId === actualDestination.droppableId && source.index === actualDestination.index) return;

        const sourceColumnIndex = columns.findIndex(col => col.id === source.droppableId);
        const destColumnIndex = columns.findIndex(col => col.id === actualDestination.droppableId);
        const sourceColumn = columns[sourceColumnIndex];
        const destColumn = columns[destColumnIndex];
        const taskToMove = sourceColumn.tasks[source.index];

        if (source.droppableId === actualDestination.droppableId) {
            const newTasks = Array.from(sourceColumn.tasks);
            newTasks.splice(source.index, 1);
            newTasks.splice(actualDestination.index, 0, taskToMove);
            const newColumns = [...columns];
            newColumns[sourceColumnIndex] = { ...sourceColumn, tasks: newTasks };
            setColumns(newColumns);
        } else {
            const sourceTasks = Array.from(sourceColumn.tasks);
            const destTasks = Array.from(destColumn.tasks);
            sourceTasks.splice(source.index, 1);

            // If dragging cross-column, correct the status
            const updatedTask = { ...taskToMove, status: actualDestination.droppableId as TaskStatus };

            // If using fallback (index 0 might be weird if we want to append), 
            // but usually specific drop gives index. Fallback is okay at 0 or length.
            // If destination was null, actualDestination.index is 0.
            // Let's create a smarter placement? No, 0 is fine for now (Top of list).

            destTasks.splice(actualDestination.index, 0, updatedTask);
            const newColumns = [...columns];
            newColumns[sourceColumnIndex] = { ...sourceColumn, tasks: sourceTasks };
            newColumns[destColumnIndex] = { ...destColumn, tasks: destTasks };
            setColumns(newColumns);
        }
    };

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleTabMouseEnter = (targetColumnId: TaskStatus) => {
        if (!isDragging || targetColumnId === activeTab) return;

        setDragOverTab(targetColumnId);

        // Auto-switch tab after delay
        timerRef.current = setTimeout(() => {
            setActiveTab(targetColumnId);
            setDragOverTab(null);
        }, 600);
    };

    const handleTabMouseLeave = () => {
        setDragOverTab(null);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };



    return (
        <div className="w-full h-full flex flex-col gap-4 p-5 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <h3 className="text-base font-semibold">Tasks Board</h3>
                <button className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors">
                    <Plus className="w-3 h-3" />
                    Add
                </button>
            </div>

            {/* Tabs with Auto-Switch */}
            <div className="relative group shrink-0">
                {/* Left Scroll Button */}
                {canScrollLeft && (
                    <button
                        onClick={() => scrollTabs('left')}
                        className="absolute left-0 top-0 bottom-0 z-20 flex items-center justify-center w-6 bg-gradient-to-r from-gray-100 to-transparent dark:from-slate-800 dark:to-transparent rounded-l-lg hover:from-white dark:hover:from-slate-700 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </button>
                )}

                <div
                    ref={tabsContainerRef}
                    onScroll={checkScroll}
                    className="flex gap-1 bg-gray-100 dark:bg-slate-800/50 p-1 rounded-lg overflow-x-auto hide-scrollbar scroll-smooth"
                >
                    {columns.map((column) => {
                        const Icon = COLUMN_ICONS[column.id];
                        const isActive = activeTab === column.id;
                        const isDragOver = dragOverTab === column.id && !isActive;

                        return (
                            <button
                                key={column.id}
                                onClick={() => setActiveTab(column.id)}
                                onMouseEnter={() => handleTabMouseEnter(column.id)}
                                onMouseLeave={handleTabMouseLeave}
                                className={cn(
                                    "shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                                    isActive
                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                        : isDragOver
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400 dark:ring-blue-600"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                <Icon className={cn("w-3 h-3 shrink-0", isActive && COLUMN_COLORS[column.id])} />
                                <span>{column.title}</span>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-full text-[10px] font-semibold min-w-[18px] text-center shrink-0",
                                    isActive
                                        ? "bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
                                        : isDragOver
                                            ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                )}>
                                    {column.tasks.length}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right Scroll Button */}
                {canScrollRight && (
                    <button
                        onClick={() => scrollTabs('right')}
                        className="absolute right-0 top-0 bottom-0 z-20 flex items-center justify-center w-6 bg-gradient-to-l from-gray-100 to-transparent dark:from-slate-800 dark:to-transparent rounded-r-lg hover:from-white dark:hover:from-slate-700 transition-all"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </button>
                )}
            </div>

            {/* Columns Container */}
            <DragDropContext
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <div className="flex-1 min-h-0 relative">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className={cn(
                                "absolute inset-0 w-full h-full transition-all duration-200",
                                activeTab === column.id ? "z-10" : "z-0",
                                // Enable pointer-events during drag so hit-testing works on all layers (z-index will decide winner)
                                (activeTab === column.id || isDragging) ? "pointer-events-auto" : "pointer-events-none",
                                (activeTab !== column.id && !isDragging) ? "opacity-0" : "opacity-100"
                            )}
                        >
                            <KanbanColumn
                                column={column}
                                isDropDisabled={activeTab !== column.id}
                            />
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}
