// Database service interface for multi-DB support
import { Task } from '@/components/kanban/types';

export interface DatabaseService {
    // Projects
    getProjects(): Promise<ProjectStats>;
    getProjectAnalytics(): Promise<AnalyticsData[]>;

    // Users
    getUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User | null>;

    // Team collaboration
    getTeamMembers(): Promise<TeamMember[]>;

    // Kanban Tasks
    getTasks(): Promise<Task[]>;
    createTask(task: Omit<Task, 'id'>): Promise<Task>;
    updateTask(id: string, updates: Partial<Task>): Promise<Task>;
    deleteTask(id: string): Promise<void>;
    subscribeToTasks?(onUpdate: () => void): () => void; // Optional for now to avoid breaking mock immediately
}

export interface ProjectStats {
    total: number;
    ended: number;
    running: number;
    pending: number;
    totalTrend: string;
    endedTrend: string;
    runningTrend: string;
}

export interface AnalyticsData {
    day: string;
    value: number;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    avatar?: string;
    isActive: boolean;
}

export interface TeamMember {
    id: string;
    name: string;
    avatar: string;
    task: string;
    status: 'Completed' | 'In Progress' | 'Pending';
}
