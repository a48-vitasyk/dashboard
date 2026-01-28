import {
    DatabaseService,
    ProjectStats,
    AnalyticsData,
    User,
    TeamMember,
} from './types';

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
}
