import { CalendarWidget } from './CalendarWidget';
import { Gauge } from '@/features/dashboard/components/Gauge';
import { ProjectList } from '@/features/dashboard/components/ProjectList';
import { TimeTracker } from '@/features/dashboard/components/TimeTracker';
import { Reminders } from '@/features/dashboard/components/Reminders';
import { StatContent } from '@/features/dashboard/components/StatContent';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetType } from '@/stores/layout';
import { motion } from 'framer-motion';

// Inline components from DraggableGrid that we need to keep rendering
// Ideally these would be separate files too, but putting here for now
const TotalProjectsWidget = ({ stats }: any) => (
    <div className="p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <h3 className="text-white/80 text-sm font-medium">Total Projects</h3>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><ArrowUpRight className="w-4 h-4" /></div>
        </div>
        <div>
            <motion.p
                className="text-5xl font-bold mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "backOut" }}
            >
                {stats?.total || 0}
            </motion.p>
            <motion.div
                className="flex items-center gap-2 text-xs text-white/80"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <div className="bg-white/20 rounded px-1.5 py-0.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" /><span>5%</span></div>
                <span>Increased</span>
            </motion.div>
        </div>
    </div>
);

const AnalyticsWidget = () => (
    <div className="p-6 h-full flex flex-col">
        <motion.h3
            className="text-base font-semibold mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            Project Analytics
        </motion.h3>
        <div className="flex items-end justify-between flex-1 gap-3">
            {[
                { day: 'S', height: '60%', type: 'striped' },
                { day: 'M', height: '85%', type: 'solid-medium' },
                { day: 'T', height: '75%', type: 'active', label: '74%' },
                { day: 'W', height: '100%', type: 'solid-dark' },
                { day: 'T', height: '85%', type: 'striped' },
                { day: 'F', height: '65%', type: 'striped' },
                { day: 'S', height: '70%', type: 'striped' },
            ].map((item, idx) => (
                <motion.div
                    key={idx}
                    className="flex flex-col items-center flex-1 h-full justify-end group clickable relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                >

                    {/* Active Label Popup */}
                    {item.type === 'active' && (
                        <motion.div
                            className="absolute -top-10 flex flex-col items-center z-10"
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.4, ease: "backOut" }}
                        >
                            <div className="bg-[#ECFDF5] text-[#047857] text-[10px] font-bold px-2 py-1 rounded-[6px] border border-[#A7F3D0] shadow-sm mb-1 relative">
                                {item.label}
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        className="relative w-full flex items-end justify-center"
                        style={{ height: item.height, originY: 1 }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: idx * 0.1 + 0.2, duration: 0.6, ease: "circOut" }}
                    >

                        {/* The Bar */}
                        <div
                            className={cn(
                                'w-full h-full rounded-full transition-all duration-300',
                                item.type === 'striped' && 'bg-striped',
                                item.type === 'solid-medium' && 'bg-[#15803d]', // green-700
                                item.type === 'solid-dark' && 'bg-[#064e3b]', // green-900
                                item.type === 'active' && 'bg-[#34d399]' // emerald-400
                            )}
                        ></div>

                        {/* Active Ring Indicator */}
                        {item.type === 'active' && (
                            <motion.div
                                className="absolute -top-[5px] w-3 h-3 bg-white border-[2.5px] border-[#34d399] rounded-full z-20"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1, duration: 0.3, ease: "backOut" }}
                            ></motion.div>
                        )}
                    </motion.div>

                    <motion.span
                        className="text-[11px] font-medium mt-3 text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 + 0.4, duration: 0.3 }}
                    >
                        {item.day}
                    </motion.span>
                </motion.div>
            ))}
        </div>
    </div>
);

const TeamWidget = ({ teamMembers }: any) => (
    <div className="p-6">
        <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h3 className="text-lg font-semibold">Team</h3>
            <button className="text-xs border px-2 py-1 rounded-full">+ Add</button>
        </motion.div>
        <div className="space-y-4 overflow-y-auto h-[85%]">
            {teamMembers.map((member: any, idx: number) => (
                <motion.div
                    key={member.id}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                >
                    <motion.img
                        src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.name}`}
                        className="w-8 h-8 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 + 0.3, duration: 0.3, ease: "backOut" }}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{member.name}</p>
                        <p className="text[10px] text-muted-foreground truncate">{member.current_task}</p>
                    </div>
                    <motion.div
                        className={cn("w-2 h-2 rounded-full", member.status === 'completed' ? 'bg-emerald-500' : member.status === 'in_progress' ? 'bg-orange-500' : 'bg-rose-500')}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 + 0.4, duration: 0.3, type: "spring" }}
                    />
                </motion.div>
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
        <Gauge
            completed={isNaN(valC) ? 0 : valC}
            inProgress={isNaN(valP) ? 0 : valP}
            pending={isNaN(valPend) ? 0 : valPend}
        />
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
