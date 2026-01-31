import {
    DatabaseService,
    ProjectStats,
    AnalyticsData,
    User,
    TeamMember,
} from './types';
import { mockKanbanTasks } from '@/components/kanban/mockData';
import { Task } from '@/components/kanban/types';

export class MockDatabaseService implements DatabaseService {
    private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    async getProjects(): Promise<ProjectStats> {
        await this.delay(300);
        return {
            total: 24,
            ended: 10,
            running: 12,
            pending: 2,
            totalTrend: 'Increased from last month',
            endedTrend: 'Increased from last month',
            runningTrend: 'Increased from last month',
        };
    }

    async getProjectAnalytics(): Promise<AnalyticsData[]> {
        await this.delay(300);
        return [
            { day: 'S', value: 0 },
            { day: 'M', value: 85 },
            { day: 'T', value: 65 },
            { day: 'W', value: 95 },
            { day: 'T', value: 0 },
            { day: 'F', value: 0 },
            { day: 'S', value: 0 },
        ];
    }

    async getUsers(): Promise<User[]> {
        await this.delay(300);
        return [
            {
                id: '1',
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
                isActive: true,
            },
            {
                id: '2',
                email: 'user@example.com',
                name: 'Regular User',
                role: 'user',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
                isActive: true,
            },
        ];
    }

    async getUserById(id: string): Promise<User | null> {
        await this.delay(200);
        const users = await this.getUsers();
        return users.find((u) => u.id === id) || null;
    }

    async getTeamMembers(): Promise<TeamMember[]> {
        await this.delay(300);
        return [
            {
                id: '1',
                name: 'Alexandra Deff',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandra',
                task: 'GitHub Project Repository',
                status: 'Completed',
            },
            {
                id: '2',
                name: 'Edwin Adenike',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Edwin',
                task: 'Integrate User Authentication System',
                status: 'In Progress',
            },
            {
                id: '3',
                name: 'Isaac Oluwatamilorun',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isaac',
                task: 'Develop Search and Filter Functionality',
                status: 'Pending',
            },
            {
                id: '4',
                name: 'David Oshodi',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
                task: 'Responsive Layout for Homepage',
                status: 'In Progress',
            },
        ];
    }

    // Kanban Mock Implementation
    async getTasks(): Promise<Task[]> {
        await this.delay(400);
        return [...mockKanbanTasks];
    }

    async createTask(task: Omit<Task, 'id'>): Promise<Task> {
        await this.delay(500);
        const newTask: Task = {
            ...task,
            id: Math.random().toString(36).substr(2, 9),
        };
        // In a real mock, we might want to push to the array, 
        // but since we import it, we can't easily mutate the readonly import permanently.
        // For now, we just return the new task simulating success.
        return newTask;
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        await this.delay(300);
        const task = mockKanbanTasks.find(t => t.id === id);
        if (!task) throw new Error('Task not found');
        return { ...task, ...updates };
    }

    async deleteTask(id: string): Promise<void> {
        await this.delay(300);
        // Simulate deletion
        return;
    }
}
