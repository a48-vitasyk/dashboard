import { Video } from 'lucide-react';

export function Reminders() {
    return (
        <div className="glass-card rounded-2xl p-6 border h-full w-full flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Reminders</h3>
                <h4 className="text-lg font-semibold mb-1">Meeting with Arc Company</h4>
                <p className="text-sm text-muted-foreground mb-6">Time : 02.00 pm - 04.00 pm</p>
            </div>

            <button className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 transition-smooth">
                <Video className="w-4 h-4" />
                <span>Start Meeting</span>
            </button>
        </div>
    );
}
