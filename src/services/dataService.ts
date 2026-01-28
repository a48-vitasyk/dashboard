import { supabase } from '@/lib/supabase';
import { ProjectRow, TeamMemberRow, GaugeStats } from './db/types_db';

export const dataService = {
    /**
     * Fetch all projects sorted by due date
     */
    async getProjects(): Promise<ProjectRow[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('due_date', { ascending: true });

        if (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
        return data || [];
    },

    /**
     * Fetch all team members
     */
    async getTeamMembers(): Promise<TeamMemberRow[]> {
        const { data, error } = await supabase
            .from('team_members')
            .select('*');

        if (error) {
            console.error('Error fetching team members:', error);
            throw error;
        }
        return data || [];
    },

    /**
     * Calculate aggregated stats for Dashboard visual cards
     */
    async getDashboardStats() {
        const { data: projects, error } = await supabase
            .from('projects')
            .select('status, id');

        if (error) throw error;

        const total = projects?.length || 0;
        const completed = projects?.filter(p => p.status === 'completed').length || 0;
        const inProgress = projects?.filter(p => p.status === 'in_progress').length || 0;
        const pending = projects?.filter(p => p.status === 'pending').length || 0;

        return {
            total,
            ended: completed,
            running: inProgress,
            pending: pending,
            gaugeStats: {
                completed,
                inProgress,
                pending
            } as GaugeStats
        };
    },

    /**
     * Helper to calculate percentage for the Gauge
     */
    calculateGaugePercentage(stats: GaugeStats): number {
        const total = stats.completed + stats.inProgress + stats.pending;
        if (total === 0) return 0;
        return Math.round((stats.completed / total) * 100);
    },

    // --- Mock Data & External API Stubs (Demo Mode) ---

    async getMockDashboardData() {
        // "Perfect Mock" matching original design
        const projects: ProjectRow[] = [
            { id: '1', title: 'Develop API Endpoints', status: 'completed', due_date: '2024-11-26', category: 'Backend' },
            { id: '2', title: 'Onboarding Flow', status: 'in_progress', due_date: '2024-11-28', category: 'Frontend' },
            { id: '3', title: 'Build Dashboard', status: 'pending', due_date: '2024-11-30', category: 'Frontend' },
            { id: '4', title: 'Optimize Page Load', status: 'in_progress', due_date: '2024-12-05', category: 'Performance' },
            { id: '5', title: 'Cross-Browser Testing', status: 'pending', due_date: '2024-12-06', category: 'QA' },
        ];

        const teamMembers: TeamMemberRow[] = [
            { id: '1', name: 'Alexandra Deff', role: 'Dev', avatar_url: 'https://i.pravatar.cc/150?u=1', current_task: 'Github Project Repository', status: 'completed' },
            { id: '2', name: 'Edwin Adenike', role: 'Dev', avatar_url: 'https://i.pravatar.cc/150?u=2', current_task: 'Integrate User Authentication System', status: 'in_progress' },
            { id: '3', name: 'Isaac Oluwatemilorun', role: 'Designer', avatar_url: 'https://i.pravatar.cc/150?u=3', current_task: 'Develop Search and Filter Functionality', status: 'pending' },
            { id: '4', name: 'David Oshodi', role: 'Fullstack', avatar_url: 'https://i.pravatar.cc/150?u=4', current_task: 'Responsive Layout for Homepage', status: 'in_progress' },
        ];

        const stats = {
            total: 24,
            ended: 10,
            running: 12,
            pending: 2,
            gaugeStats: { completed: 10, inProgress: 12, pending: 2 }
        };

        return { projects, teamMembers, stats };
    },

    async fetchGrafanaData() {
        // Placeholder for Grafana integration
        console.log('Fetching Grafana metrics...');
        return [];
    },

    async fetchExternalMetrics() {
        // Placeholder for other external APIs
        console.log('Fetching external metrics...');
        return {};
    }
};
