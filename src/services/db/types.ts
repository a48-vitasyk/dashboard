// Database service interface for multi-DB support
export interface DatabaseService {
    // Projects
    getProjects(): Promise<ProjectStats>;
    getProjectAnalytics(): Promise<AnalyticsData[]>;

    // Users
    getUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User | null>;

    // Team collaboration
    getTeamMembers(): Promise<TeamMember[]>;
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
