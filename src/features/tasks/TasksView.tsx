import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn as KanbanColumnType, TaskStatus } from '@/types/kanban';
import { KanbanColumn } from './components/KanbanColumn';
import { mockTasks } from './data/mockTasks';
import { Plus, Filter, ArrowUpDown, ChevronDown, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

export function TasksView() {
    const [columns, setColumns] = useState<KanbanColumnType[]>([
        {
            id: 'backlog',
            title: 'Backlog',
            tasks: mockTasks.filter(t => t.status === 'backlog'),
        },
        {
            id: 'todo',
            title: 'To Do',
            tasks: mockTasks.filter(t => t.status === 'todo'),
        },
        {
            id: 'in_progress',
            title: 'In Progress',
            tasks: mockTasks.filter(t => t.status === 'in_progress'),
        },
        {
            id: 'for_review',
            title: 'For Review',
            tasks: mockTasks.filter(t => t.status === 'for_review'),
        },
    ]);

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        // Dropped outside valid droppable
        if (!destination) return;

        // Dropped in same position
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // Find source and destination columns
        const sourceColumnIndex = columns.findIndex(col => col.id === source.droppableId);
        const destColumnIndex = columns.findIndex(col => col.id === destination.droppableId);

        const sourceColumn = columns[sourceColumnIndex];
        const destColumn = columns[destColumnIndex];

        // Get the task being moved
        const taskToMove = sourceColumn.tasks[source.index];

        // Same column reorder
        if (source.droppableId === destination.droppableId) {
            const newTasks = Array.from(sourceColumn.tasks);
            newTasks.splice(source.index, 1);
            newTasks.splice(destination.index, 0, taskToMove);

            const newColumns = [...columns];
            newColumns[sourceColumnIndex] = {
                ...sourceColumn,
                tasks: newTasks,
            };

            setColumns(newColumns);
        } else {
            // Moving between columns
            const sourceTasks = Array.from(sourceColumn.tasks);
            const destTasks = Array.from(destColumn.tasks);

            // Remove from source
            sourceTasks.splice(source.index, 1);

            // Update task status
            const updatedTask = {
                ...taskToMove,
                status: destination.droppableId as TaskStatus,
            };

            // Add to destination
            destTasks.splice(destination.index, 0, updatedTask);

            const newColumns = [...columns];
            newColumns[sourceColumnIndex] = {
                ...sourceColumn,
                tasks: sourceTasks,
            };
            newColumns[destColumnIndex] = {
                ...destColumn,
                tasks: destTasks,
            };

            setColumns(newColumns);
        }
    };

    return (
        <div className="min-h-screen pb-10">
            {/* Header */}
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Actions
                </h1>
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
                <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    New Action
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <ArrowUpDown className="w-4 h-4" />
                    Ordering
                </button>
            </motion.div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-6">
                    {columns.map((column, index) => (
                        <motion.div
                            key={column.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                        >
                            <KanbanColumn column={column} />
                        </motion.div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}
