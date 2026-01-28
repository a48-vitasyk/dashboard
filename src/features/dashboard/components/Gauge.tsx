import { motion } from 'framer-motion';

interface GaugeProps {
    completed?: number;
    inProgress?: number;
    pending?: number;
}

export function Gauge({
    completed = 41,
    inProgress = 35,
    pending = 24,
}: GaugeProps) {
    const size = 200;
    const strokeWidth = 34; // Chunkier stroke
    const radius = 65; // Reduced radius to fit stroke
    const c = size / 2;

    // 1. Calculate angles
    const total = completed + inProgress + pending;
    const totalDegrees = 180;
    const gap = 2; // Slightly larger gap

    const deg1 = (completed / total) * totalDegrees;
    const deg2 = (inProgress / total) * totalDegrees;
    // const deg3 = (pending / total) * totalDegrees; // Unused

    // Start angles (Clockwise from 180)
    const start1 = 180;
    const end1 = start1 + deg1 - gap;
    const start2 = end1 + gap;
    const end2 = start2 + deg2 - gap;
    const start3 = end2 + gap;
    const end3 = 360;

    const getPoint = (deg: number) => {
        const rad = (deg * Math.PI) / 180;
        return {
            x: c + radius * Math.cos(rad),
            y: c + radius * Math.sin(rad)
        };
    };

    const makeArc = (startDeg: number, endDeg: number) => {
        const start = getPoint(startDeg);
        const end = getPoint(endDeg);
        const diff = endDeg - startDeg;
        const largeArc = diff > 180 ? 1 : 0;
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
    };

    // Custom Motion Path component to handle drawing animation
    const Segment = ({ d, stroke, delay = 0 }: any) => (
        <motion.path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
                pathLength: { duration: 0.8, ease: "circOut", delay },
                opacity: { duration: 0.2, delay }
            }}
        />
    );

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="relative w-full aspect-[200/120] max-w-[280px] overflow-hidden">
                <svg
                    viewBox="0 0 200 200"
                    className="absolute top-0 left-0 w-full h-[166%]"
                    preserveAspectRatio="xMidYMin meet"
                >
                    <defs>
                        <pattern
                            id="patternStripes"
                            patternUnits="userSpaceOnUse"
                            width="6"
                            height="6"
                            patternTransform="rotate(45)"
                        >
                            <rect width="6" height="6" fill="#fff" />
                            <line x1="0" y1="0" x2="0" y2="6" stroke="#9ca3af" strokeWidth="3" />
                        </pattern>
                    </defs>

                    {/* Track Background - Fade In */}
                    <motion.path
                        d={makeArc(180, 360)}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />

                    {/* Segment 1: Completed (Green 700) */}
                    <Segment d={makeArc(start1, end1)} stroke="#15803d" delay={0.2} />

                    {/* Start Cap - Scale In */}
                    <motion.circle
                        cx={getPoint(180).x} cy={getPoint(180).y} r={strokeWidth / 2} fill="#15803d"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    />

                    {/* Segment 2: In Progress (Emerald 900) */}
                    <Segment d={makeArc(start2, end2)} stroke="#064e3b" delay={0.5} />

                    {/* Segment 3: Pending (Striped) */}
                    <Segment d={makeArc(start3, end3)} stroke="url(#patternStripes)" delay={0.8} />

                    {/* End Cap - Scale In */}
                    <motion.circle
                        cx={getPoint(360).x} cy={getPoint(360).y} r={strokeWidth / 2} fill="#e5e7eb"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0, duration: 0.3 }}
                    />

                    {/* Separators - Fade In */}
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                        <path
                            d={`M ${c + (radius - 18) * Math.cos(end1 * Math.PI / 180)} ${c + (radius - 18) * Math.sin(end1 * Math.PI / 180)} L ${c + (radius + 18) * Math.cos(end1 * Math.PI / 180)} ${c + (radius + 18) * Math.sin(end1 * Math.PI / 180)}`}
                            stroke="white" strokeWidth="2"
                        />
                        <path
                            d={`M ${c + (radius - 18) * Math.cos(end2 * Math.PI / 180)} ${c + (radius - 18) * Math.sin(end2 * Math.PI / 180)} L ${c + (radius + 18) * Math.cos(end2 * Math.PI / 180)} ${c + (radius + 18) * Math.sin(end2 * Math.PI / 180)}`}
                            stroke="white" strokeWidth="2"
                        />
                    </motion.g>

                </svg>

                {/* Labels - Fade & Slide Up */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-[10%]">
                    <motion.span
                        className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                    >
                        {completed}%
                    </motion.span>
                    <motion.p
                        className="text-[8px] md:text-[10px] text-muted-foreground font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                    >
                        Project Ended
                    </motion.p>
                </div>
            </div>

            {/* Legend - Staggered Fade */}
            <motion.div
                className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
            >
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#15803d]" />
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#064e3b]" />
                    <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full border border-dashed border-gray-400 bg-[url(#patternStripes)]" />
                    <span>Pending</span>
                </div>
            </motion.div>
        </div>
    );
}
