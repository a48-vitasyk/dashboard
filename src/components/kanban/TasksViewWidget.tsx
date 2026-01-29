import { useState, useRef } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column, TaskStatus } from './types';
import { KanbanColumn } from './KanbanColumn';
import { mockKanbanTasks } from './mockData';
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react';
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
    const draggedTaskRef = useRef<{ columnId: string; taskIndex: number } | null>(null);

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        // Clear drag state
        draggedTaskRef.current = null;
        setDragOverTab(null);

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColumnIndex = columns.findIndex(col => col.id === source.droppableId);
        const destColumnIndex = columns.findIndex(col => col.id === destination.droppableId);
        const sourceColumn = columns[sourceColumnIndex];
        const destColumn = columns[destColumnIndex];
        const taskToMove = sourceColumn.tasks[source.index];

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
        }
    };

    const handleDragStart = (columnId: string, taskIndex: number) => {
        draggedTaskRef.current = { columnId, taskIndex };
    };

    const handleTabDragEnter = (targetColumnId: TaskStatus) => {
        setDragOverTab(targetColumnId);
    };

    const handleTabDragLeave = () => {
        setDragOverTab(null);
    };

    const handleTabDrop = (targetColumnId: TaskStatus) => {
        setDragOverTab(null);

        if (!draggedTaskRef.current) return;

        const { columnId: sourceColumnId, taskIndex } = draggedTaskRef.current;

        // Don't do anything if dropping on same column
        if (sourceColumnId === targetColumnId) {
            draggedTaskRef.current = null;
            return;
        }

        const sourceColumnIndex = columns.findIndex(col => col.id === sourceColumnId);
        const destColumnIndex = columns.findIndex(col => col.id === targetColumnId);
        const sourceColumn = columns[sourceColumnIndex];
        const destColumn = columns[destColumnIndex];
        const taskToMove = sourceColumn.tasks[taskIndex];

        const sourceTasks = Array.from(sourceColumn.tasks);
        const destTasks = Array.from(destColumn.tasks);

        sourceTasks.splice(taskIndex, 1);
        const updatedTask = { ...taskToMove, status: targetColumnId };
        destTasks.push(updatedTask); // Add to end of target column

        const newColumns = [...columns];
        newColumns[sourceColumnIndex] = { ...sourceColumn, tasks: sourceTasks };
        newColumns[destColumnIndex] = { ...destColumn, tasks: destTasks };
        setColumns(newColumns);

        // Switch to target tab to show the result
        setActiveTab(targetColumnId);
        draggedTaskRef.current = null;
    };

    const activeColumn = columns.find(col => col.id === activeTab)!;

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

            {/* Tabs with Drop Zones */}
            <div className="flex gap-1 shrink-0 bg-gray-100 dark:bg-slate-800/50 p-1 rounded-lg">
                {columns.map((column) => {
                    const Icon = COLUMN_ICONS[column.id];
                    const isActive = activeTab === column.id;
                    const isDragOver = dragOverTab === column.id && !isActive;

                    return (
                        <button
                            key={column.id}
                            onClick={() => setActiveTab(column.id)}
                            onDragEnter={(e) => {
                                e.preventDefault();
                                if (!isActive) handleTabDragEnter(column.id);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                            }}
                            onDragLeave={handleTabDragLeave}
                            onDrop={(e) => {
                                e.preventDefault();
                                handleTabDrop(column.id);
                            }}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all",
                                isActive
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                    : isDragOver
                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400 dark:ring-blue-600"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <Icon className={cn("w-3 h-3", isActive && COLUMN_COLORS[column.id])} />
                            <span className="hidden sm:inline truncate">{column.title}</span>
                            <span className={cn(
                                "px-1.5 py-0.5 rounded-full text-[10px] font-semibold min-w-[18px] text-center",
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

            {/* Active Column Content */}
            <DragDropContext
                onDragEnd={handleDragEnd}
                onDragStart={(result) => handleDragStart(result.source.droppableId, result.source.index)}
            >
                <div className="flex-1 min-h-0">
                    <KanbanColumn column={activeColumn} />
                </div>
            </DragDropContext>
        </div>
    );
}
