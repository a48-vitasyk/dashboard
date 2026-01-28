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
    // Technique: Overlapping Arcs (Stacking) from furthest to nearest
    // Layer 1 (Bottom): Total (Pending + InProgress + Completed) -> Striped
    // Layer 2 (Middle): InProgress + Completed -> Dark Green
    // Layer 3 (Top): Completed -> Light Green

    // This creates the effect of rounded segments overlapping each other correctly.

    const size = 200;
    const strokeWidth = 34;
    const radius = 65;
    const c = size / 2;

    const total = 100; // Assume 100% total for simplicity in logic
    const totalDeg = 180;

    const degCompleted = (completed / total) * totalDeg;
    const degInProgress = (inProgress / total) * totalDeg;
    const degPending = (pending / total) * totalDeg;

    // We draw from 180 (left) to 360 (right)
    const arcTotal = 180 + degCompleted + degInProgress + degPending; // Should be around 360 if adds to 100
    const arcInProgress = 180 + degCompleted + degInProgress;
    const arcCompleted = 180 + degCompleted;

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

    const Segment = ({ endDeg, stroke, delay = 0, id }: any) => (
        <motion.path
            d={makeArc(180, endDeg)}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round" // Critical for the rounded look
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
                pathLength: { duration: 1.2, ease: "circOut", delay },
                opacity: { duration: 0.2, delay }
            }}
            style={{ zIndex: id }} // Ensure stacking order if needed
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
                            id="gaugeStripes"
                            patternUnits="userSpaceOnUse"
                            width="8"
                            height="8"
                            patternTransform="rotate(45)"
                        >
                            <rect width="8" height="8" fill="transparent" />
                            <line x1="0" y1="0" x2="0" y2="8" stroke="#9ca3af" strokeWidth="3" />
                        </pattern>
                    </defs>

                    {/* Track Background - Faint Gray */}
                    {/* <motion.path
                        d={makeArc(180, 360)}
                        fill="none"
                        stroke="#f9fafb"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    /> */}

                    {/* Layer 1: Pending (The Base - Longest) - Striped */}
                    {/* Draws full length, so the end tip is visible as 'Pending' */}
                    <Segment endDeg={arcTotal} stroke="url(#gaugeStripes)" delay={0.6} id={1} />

                    {/* Layer 2: In Progress (Middle) - Dark Green */}
                    {/* Covers the start of Pending, showing its own rounded end */}
                    <Segment endDeg={arcInProgress} stroke="#064e3b" delay={0.4} id={2} />

                    {/* Layer 3: Completed (Top) - Light Green */}
                    {/* Covers the start of In Progress */}
                    <Segment endDeg={arcCompleted} stroke="#15803d" delay={0.2} id={3} />

                </svg>

                {/* Labels */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-[5%]">
                    <motion.span
                        className="text-4xl md:text-5xl font-bold text-foreground tracking-tight"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                    >
                        {completed}%
                    </motion.span>
                    <motion.p
                        className="text-[10px] text-green-700/60 dark:text-green-400/60 font-semibold uppercase tracking-wide mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                    >
                        Project Ended
                    </motion.p>
                </div>
            </div>

            {/* Legend */}
            <motion.div
                className="flex items-center gap-5 mt-4 text-[11px] text-muted-foreground font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#15803d]" />
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#064e3b]" />
                    <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[url(#gaugeStripes)] border border-gray-300 dark:border-gray-700" />
                    <span>Pending</span>
                </div>
            </motion.div>
        </div>
    );
}
