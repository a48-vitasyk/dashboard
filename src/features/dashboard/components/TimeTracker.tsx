import { Pause, Square } from 'lucide-react';

export function TimeTracker() {
    return (
        <div className="rounded-2xl overflow-hidden h-48 relative">
            {/* Abstract wavy background */}
            <div className="absolute inset-0 bg-emerald-950">
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 400 200"
                    preserveAspectRatio="xMidYMid slice"
                >
                    {/* Multiple wavy lines */}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <path
                            key={i}
                            d={`M${-50 + i * 60} 200 Q ${50 + i * 60} 100 ${150 + i * 60} 200`}
                            fill="none"
                            stroke="rgba(16, 185, 129, 0.3)"
                            strokeWidth="25"
                            strokeLinecap="round"
                        />
                    ))}
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-5 text-white">
                <h3 className="text-sm font-medium opacity-80">Time Tracker</h3>

                <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tracking-wider font-mono">
                        01:24:08
                    </span>
                </div>

                <div className="flex justify-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-smooth">
                        <Pause className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-smooth">
                        <Square className="w-4 h-4 fill-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
