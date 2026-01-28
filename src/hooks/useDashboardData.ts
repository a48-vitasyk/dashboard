import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import { ProjectRow, TeamMemberRow, GaugeStats } from '@/services/db/types_db';
import { useAppConfig } from '@/stores/config';

interface DashboardData {
    projects: ProjectRow[];
    teamMembers: TeamMemberRow[];
    stats: {
        total: number;
        ended: number;
        running: number;
        pending: number;
        gaugeStats: GaugeStats;
        gaugePercentage: number;
    };
}

export function useDashboardData() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Demo Mode Config
    const { isDemoMode } = useAppConfig();

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                setError(null); // Clear previous errors (e.g. connection failed)
                console.log(`🔄 Fetching dashboard data (Demo Mode: ${isDemoMode})...`);

                if (isDemoMode) {
                    // MOCK DATA PATH (Fast, Perfect Data)
                    const mockData = await dataService.getMockDashboardData();

                    // Artificial delay for "loading" animation demo
                    await new Promise(resolve => setTimeout(resolve, 800));

                    const gaugePercentage = dataService.calculateGaugePercentage(mockData.stats.gaugeStats);
                    setData({
                        projects: mockData.projects,
                        teamMembers: mockData.teamMembers,
                        stats: {
                            ...mockData.stats,
                            gaugePercentage
                        }
                    });
                    console.log('✅ Mock data loaded');

                } else {
                    // REAL DATA PATH (Supabase)
                    const [projects, teamMembers, stats] = await Promise.all([
                        dataService.getProjects(),
                        dataService.getTeamMembers(),
                        dataService.getDashboardStats()
                    ]);

                    const gaugePercentage = dataService.calculateGaugePercentage(stats.gaugeStats);

                    const fullData = {
                        projects,
                        teamMembers,
                        stats: {
                            ...stats,
                            gaugePercentage
                        }
                    };
                    console.log('✅ Real Supabase data loaded:', fullData);
                    setData(fullData);
                }
            } catch (err: any) {
                console.error('❌ Error fetching dashboard data:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [isDemoMode]); // Re-fetch when mode changes

    return { data, isLoading, error };
}
