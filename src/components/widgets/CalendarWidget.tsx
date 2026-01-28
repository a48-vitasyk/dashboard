import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CalendarWidget() {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const currentDate = new Date();
    const currentDay = currentDate.getDate();

    // Simple mock calendar generation
    const generateDays = () => {
        const items = [];
        // Just filling 35 slots for a generic month view
        for (let i = 1; i <= 31; i++) {
            items.push(i);
        }
        return items;
    };

    return (
        <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">January 2026</h3>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-accent rounded-md"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-accent rounded-md"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {days.map(day => (
                    <div key={day} className="text-[10px] text-muted-foreground font-medium uppercase">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 flex-1">
                {/* Empty slots for start of month offset */}
                <div />
                <div />

                {generateDays().map(day => (
                    <div
                        key={day}
                        className={cn(
                            "flex items-center justify-center text-xs rounded-md aspect-square hover:bg-accent cursor-pointer transition-colors",
                            day === currentDay && "bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 border-background bg-emerald-${i * 100 + 400}`} />
                    ))}
                </div>
                <button className="text-xs text-muted-foreground hover:text-foreground">View Schedule</button>
            </div>
        </div>
    );
}
