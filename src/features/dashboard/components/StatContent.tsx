import { ArrowUpRight, TrendingUp } from 'lucide-react';

export function StatContent({ label, value, trend, status }: any) {
    return (
        <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <h3 className="text-muted-foreground text-sm font-medium">{label}</h3>
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center"><ArrowUpRight className="w-4 h-4" /></div>
            </div>
            <div>
                <p className="text-4xl font-bold mb-2">{value || 0}</p>
                {trend ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="bg-emerald-100 text-emerald-700 rounded px-1.5 py-0.5 flex items-center gap-1 font-medium"><TrendingUp className="w-3 h-3" /><span>{trend}</span></div>
                    </div>
                ) : <p className="text-xs text-emerald-600 font-medium">{status}</p>}
            </div>
        </div>
    );
}
