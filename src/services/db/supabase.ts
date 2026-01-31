import { supabase } from '@/lib/supabase';
import {
    DatabaseService,
    ProjectStats,
    AnalyticsData,
    User,
    TeamMember,
} from './types';
import { Task } from '@/components/kanban/types';

export class SupabaseService implements DatabaseService {

    // --- Projects (Placeholder for future real data) ---
    async getProjects(): Promise<ProjectStats> {
        // For now, we return mock data as Project table structure isn't defined yet
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

    // --- Users (Real Auth check + Placeholder profile) ---
    async getUsers(): Promise<User[]> {
        // In real app, we would query 'profiles' table
        return [
            {
                id: '1',
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
                isActive: true,
            },
        ];
    }

    async getUserById(id: string): Promise<User | null> {
        // Placeholder
        return {
            id,
            email: 'user@example.com',
            name: 'User',
            role: 'user',
            isActive: true
        };
    }

    async getTeamMembers(): Promise<TeamMember[]> {
        return [
            {
                id: '1',
                name: 'Alexandra Deff',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandra',
                task: 'GitHub Project Repository',
                status: 'Completed',
            },
            // ... more placeholders
        ];
    }

    // --- KANBAN TASKS (REAL IMPLEMENTATION) ---

    async getTasks(): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }

        // Map snake_case DB fields to camelCase frontend types
        return (data || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            subtitle: t.subtitle || '',
            status: t.status,
            priority: t.priority,
            dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '',
            attachmentsCount: t.attachments_count || 0,
            commentsCount: t.comments_count || 0,
            assigneeAvatar: t.assignee?.avatar,
        }));
    }

    async createTask(task: Omit<Task, 'id'>): Promise<Task> {
        // Map frontend camelCase to DB snake_case
        const dbTask = {
            title: task.title,
            subtitle: task.subtitle,
            status: task.status,
            priority: task.priority,
            // Simple date parsing for now, or null
            due_date: task.dueDate ? new Date().toISOString() : null,
            attachments_count: task.attachmentsCount,
            comments_count: task.commentsCount,
            assignee: task.assigneeAvatar ? { avatar: task.assigneeAvatar } : {},
        };

        const { data, error } = await supabase
            .from('tasks')
            .insert(dbTask)
            .select()
            .single();

        if (error) {
            console.error('Error creating task:', error);
            throw error;
        }

        return {
            id: data.id,
            title: data.title,
            subtitle: data.subtitle || '',
            status: data.status,
            priority: data.priority,
            dueDate: data.due_date ? new Date(data.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '',
            attachmentsCount: data.attachments_count || 0,
            commentsCount: data.comments_count || 0,
            assigneeAvatar: data.assignee?.avatar,
        };
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.priority) dbUpdates.priority = updates.priority;

        const { data, error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            throw error;
        }

        return {
            id: data.id,
            title: data.title,
            subtitle: data.subtitle || '',
            status: data.status,
            priority: data.priority,
            dueDate: data.due_date ? new Date(data.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '',
            attachmentsCount: data.attachments_count || 0,
            commentsCount: data.comments_count || 0,
            assigneeAvatar: data.assignee?.avatar,
        };
    }

    async deleteTask(id: string): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    subscribeToTasks(onUpdate: () => void): () => void {
        const subscription = supabase
            .channel('tasks_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks' },
                (payload) => {
                    console.log('Realtime update received:', payload);
                    onUpdate();
                }
            )
            .subscribe();

        // Return unsubscribe function
        return () => {
            supabase.removeChannel(subscription);
        };
    }
}
