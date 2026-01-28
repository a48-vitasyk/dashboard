import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function StatContent({ label, value, trend, status }: any) {
    return (
        <div className="p-6 h-full flex flex-col justify-between">
            <motion.div
                className="flex justify-between items-start"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h3 className="text-muted-foreground text-sm font-medium">{label}</h3>
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center"><ArrowUpRight className="w-4 h-4" /></div>
            </motion.div>
            <div>
                <motion.p
                    className="text-4xl font-bold mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                >
                    {value || 0}
                </motion.p>
                {trend ? (
                    <motion.div
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        <div className="bg-emerald-100 text-emerald-700 rounded px-1.5 py-0.5 flex items-center gap-1 font-medium"><TrendingUp className="w-3 h-3" /><span>{trend}</span></div>
                    </motion.div>
                ) : (
                    <motion.p
                        className="text-xs text-emerald-600 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        {status}
                    </motion.p>
                )}
            </div>
        </div>
    );
}
