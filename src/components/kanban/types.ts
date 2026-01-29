export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'for_review';

export interface Task {
    id: string;
    title: string;
    subtitle: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    attachmentsCount: number;
    commentsCount: number;
    assigneeAvatar?: string;
}

export interface Column {
    id: TaskStatus;
    title: string;
    tasks: Task[];
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
    urgent: 'border-red-500',
    high: 'border-orange-500',
    medium: 'border-blue-500',
    low: 'border-green-500',
};

export const PRIORITY_TEXT_COLORS: Record<TaskPriority, string> = {
    urgent: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-blue-500',
    low: 'text-green-500',
};
