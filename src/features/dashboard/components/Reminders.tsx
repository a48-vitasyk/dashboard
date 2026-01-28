import { Video } from 'lucide-react';

export function Reminders() {
    return (
        <div className="w-full h-full flex flex-col gap-4 p-5 overflow-hidden">
            {/* Header and Content */}
            <div className="shrink-0">
                <h3 className="text-base font-semibold mb-3">Reminders</h3>
                <h4 className="text-lg font-semibold mb-1">Meeting with Arc Company</h4>
                <p className="text-sm text-muted-foreground">Time : 02.00 pm - 04.00 pm</p>
            </div>

            {/* Button - Pushed to bottom */}
            <div className="mt-auto">
                <button className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 transition-smooth">
                    <Video className="w-4 h-4" />
                    <span>Start Meeting</span>
                </button>
            </div>
        </div>
    );
}
