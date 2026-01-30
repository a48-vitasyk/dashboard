import { createPortal } from 'react-dom';
import { Column } from './types';
import { TaskCard } from './TaskCard';
import { Plus, MoreHorizontal, Circle, Clock, CheckCircle2 } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
    column: Column;
    isDropDisabled?: boolean;
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

export function KanbanColumn({ column, isDropDisabled = false }: KanbanColumnProps) {
    const Icon = COLUMN_ICONS[column.id] || Circle;

    return (
        <div className="flex flex-col bg-[#F8F9FA] dark:bg-slate-900 rounded-2xl p-3 h-full">

            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                {/* ... existing header code ... */}
                <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", COLUMN_ICON_COLORS[column.id])} />
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {column.title}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {column.tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Add task"
                    >
                        <Plus className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                        className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Column menu"
                    >
                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Droppable Task List */}
            <Droppable droppableId={column.id} isDropDisabled={isDropDisabled}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            "flex-1 overflow-y-auto space-y-3 px-1 pb-2 hide-scrollbar",
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
                                            <TaskCard task={task} index={index} />
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
