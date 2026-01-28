import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, GripVertical, Calendar as CalendarIcon, BarChart3, Users, Clock, PieChart, CheckSquare, Activity } from 'lucide-react';
import { useLayoutStore } from '@/stores/layout';
import { cn } from '@/lib/utils';

export function WidgetDrawer() {
    const { isWidgetDrawerOpen, setWidgetDrawerOpen } = useLayoutStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const availableWidgets = [
        {
            type: 'calendar',
            title: 'Calendar',
            icon: CalendarIcon,
            size: '4x4',
            preview: (
                <div className="w-full h-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2 border border-emerald-100 dark:border-emerald-900 flex flex-col items-center justify-center gap-1 mt-2">
                    <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Jan 2026</div>
                    <div className="grid grid-cols-7 gap-0.5 w-full px-2">
                        {[...Array(14)].map((_, i) => (
                            <div key={i} className={`h-1 w-1 rounded-full ${i === 8 ? 'bg-emerald-500' : 'bg-emerald-200 dark:bg-emerald-800'}`} />
                        ))}
                    </div>
                </div>
            )
        },
        { type: 'analytics', title: 'Analytics', icon: BarChart3, size: '6x8', isPlaceholder: true },
        { type: 'team', title: 'Team', icon: Users, size: '6x8', isPlaceholder: true },
        { type: 'reminders', title: 'Reminders', icon: Clock, size: '3x6', isPlaceholder: true },
        { type: 'gauge', title: 'Progress', icon: PieChart, size: '3x6', isPlaceholder: true },
        { type: 'project-list', title: 'Projects', icon: CheckSquare, size: '3x9', isPlaceholder: true },
        { type: 'stat-total', title: 'Total Stats', icon: Activity, size: '3x4', isPlaceholder: true },
    ];

    const filteredWidgets = availableWidgets.filter(w =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDragStart = (e: React.DragEvent, type: string) => {
        console.log('🚀 DRAG START from drawer:', type);

        // CRITICAL: Some browsers require text/plain to enable drag
        e.dataTransfer.setData("text/plain", "");
        e.dataTransfer.setData("widgetType", type);
        e.dataTransfer.effectAllowed = "move";

        console.log('✅ DataTransfer set:', {
            widgetType: type,
            effectAllowed: e.dataTransfer.effectAllowed
        });

        // HIDE-ON-DRAG: Close drawer immediately
        console.log('🚪 CLOSING DRAWER');
        setWidgetDrawerOpen(false);
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isWidgetDrawerOpen && (
                <>
                    {/* Backdrop - CRITICAL: pointer-events: none to allow drag-and-drop through */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setWidgetDrawerOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        style={{ pointerEvents: 'none' }}
                    />

                    {/* Drawer - MUST BE ABOVE GRID */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-[400px] bg-background border-l border-border shadow-2xl z-[10001] flex flex-col"
                        style={{ pointerEvents: 'auto' }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-xl">Add Widget</h2>
                                <button
                                    onClick={() => setWidgetDrawerOpen(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search widgets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-muted/50 border border-input rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Available Widgets</h3>

                            <div className="grid grid-cols-2 gap-4">
                                {filteredWidgets.map((widget) => (
                                    <div
                                        key={widget.type}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, widget.type)}
                                        className={cn(
                                            "bg-card border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all group flex flex-col gap-2 relative overflow-hidden h-40",
                                            widget.isPlaceholder
                                                ? "border-dashed border-border hover:border-emerald-400 hover:bg-emerald-50/10"
                                                : "border-border hover:border-emerald-500 hover:scale-[1.02]"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={cn(
                                                "p-1.5 rounded-md",
                                                widget.isPlaceholder ? "bg-muted" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                                            )}>
                                                <widget.icon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-sm truncate">{widget.title}</span>
                                        </div>

                                        {/* Preview Area */}
                                        <div className="flex-1 rounded border border-border/50 bg-background/50 flex items-center justify-center relative overflow-hidden">
                                            {widget.preview ? (
                                                widget.preview
                                            ) : (
                                                <div className="text-[10px] text-muted-foreground font-mono opacity-50">
                                                    {widget.size} Preview
                                                </div>
                                            )}
                                        </div>

                                        {/* Drag Indicator */}
                                        <div className="absolute top-2 right-2 text-muted-foreground/0 group-hover:text-emerald-500 transition-colors">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredWidgets.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    No widgets found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
