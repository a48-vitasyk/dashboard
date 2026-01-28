import { CalendarWidget } from './CalendarWidget';
import { Gauge } from '@/features/dashboard/components/Gauge';
import { ProjectList } from '@/features/dashboard/components/ProjectList';
import { TimeTracker } from '@/features/dashboard/components/TimeTracker';
import { Reminders } from '@/features/dashboard/components/Reminders';
import { StatContent } from '@/features/dashboard/components/StatContent';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetType } from '@/stores/layout';

// Inline components from DraggableGrid that we need to keep rendering
// Ideally these would be separate files too, but putting here for now
const TotalProjectsWidget = ({ stats }: any) => (
    <div className="p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <h3 className="text-white/80 text-sm font-medium">Total Projects</h3>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><ArrowUpRight className="w-4 h-4" /></div>
        </div>
        <div>
            <p className="text-5xl font-bold mb-2">{stats?.total || 0}</p>
            <div className="flex items-center gap-2 text-xs text-white/80">
                <div className="bg-white/20 rounded px-1.5 py-0.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" /><span>5%</span></div>
                <span>Increased</span>
            </div>
        </div>
    </div>
);

const AnalyticsWidget = () => (
    <div className="p-6 h-full flex flex-col">
        <h3 className="text-base font-semibold mb-4">Project Analytics</h3>
        <div className="flex items-end justify-between flex-1 gap-2">
            {[
                { day: 'S', height: '60%', type: 'striped' },
                { day: 'M', height: '85%', type: 'solid' },
                { day: 'T', height: '75%', type: 'solid-light' },
                { day: 'W', height: '100%', type: 'solid' },
                { day: 'T', height: '65%', type: 'striped' },
                { day: 'F', height: '60%', type: 'striped' },
                { day: 'S', height: '70%', type: 'striped' },
            ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                    <div
                        className={cn(
                            'w-full rounded-t-[20px] transition-all duration-300',
                            item.type === 'striped' && 'bg-striped',
                            item.type === 'solid' && 'bg-emerald-800 dark:bg-emerald-700',
                            item.type === 'solid-light' && 'bg-emerald-600 dark:bg-emerald-500'
                        )}
                        style={{ height: item.height }}
                    ></div>
                    <span className="text-[11px] font-medium mt-2 text-muted-foreground">{item.day}</span>
                </div>
            ))}
        </div>
    </div>
);

const TeamWidget = ({ teamMembers }: any) => (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Team</h3>
            <button className="text-xs border px-2 py-1 rounded-full">+ Add</button>
        </div>
        <div className="space-y-4 overflow-y-auto h-[85%]">
            {teamMembers.map((member: any) => (
                <div key={member.id} className="flex items-center gap-3">
                    <img src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.name}`} className="w-8 h-8 rounded-full" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{member.name}</p>
                        <p className="text[10px] text-muted-foreground truncate">{member.current_task}</p>
                    </div>
                    <div className={cn("w-2 h-2 rounded-full", member.status === 'completed' ? 'bg-emerald-500' : member.status === 'in_progress' ? 'bg-orange-500' : 'bg-rose-500')} />
                </div>
            ))}
        </div>
    </div>
);

const GaugeWidget = ({ stats }: any) => {
    const realTotal = (stats?.gaugeStats.completed || 0) + (stats?.gaugeStats.inProgress || 0) + (stats?.gaugeStats.pending || 0) || 1;
    const valC = Math.round(((stats?.gaugeStats.completed || 0) / realTotal) * 100);
    const valP = Math.round(((stats?.gaugeStats.inProgress || 0) / realTotal) * 100);
    const valPend = Math.round(((stats?.gaugeStats.pending || 0) / realTotal) * 100);

    return (
        <div className="p-4 flex flex-col items-center justify-center h-full">
            <h3 className="text-sm font-semibold w-full text-left mb-2">Project Progress</h3>
            <Gauge
                completed={isNaN(valC) ? 0 : valC}
                inProgress={isNaN(valP) ? 0 : valP}
                pending={isNaN(valPend) ? 0 : valPend}
            />
        </div>
    );
}


interface WidgetRegistryProps {
    type: WidgetType;
    data: any;
}

export function WidgetRegistry({ type, data }: WidgetRegistryProps) {
    const stats = data?.stats;
    const projects = data?.projects || [];
    const teamMembers = data?.teamMembers || [];

    switch (type) {
        case 'calendar':
            return <CalendarWidget />;
        case 'stat-total':
            return <TotalProjectsWidget stats={stats} />;
        case 'stat-ended':
            return <StatContent label="Ended Projects" value={stats?.ended} trend="6%" />;
        case 'stat-running':
            return <StatContent label="Running Projects" value={stats?.running} trend="2%" />;
        case 'stat-pending':
            return <StatContent label="Pending Projects" value={stats?.pending} status="On Discuss" />;
        case 'analytics':
            return <AnalyticsWidget />;
        case 'team':
            return <TeamWidget teamMembers={teamMembers} />;
        case 'reminders':
            return <div className="h-full"><Reminders /></div>; // Removed p-0 as it's handled by wrapper or component
        case 'gauge':
            return <GaugeWidget stats={stats} />;
        case 'project-list':
            return <ProjectList projects={projects} />;
        case 'time-tracker':
            return <TimeTracker />;
        default:
            return <div>Unknown Widget Type: {type}</div>;
    }
}
