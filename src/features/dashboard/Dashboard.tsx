import { Suspense, lazy, useEffect } from 'react';
import { Plus, Settings, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useLayoutStore } from '@/stores/layout';

// Lazy load the grid to isolate crashes in RGL library
const DraggableGrid = lazy(() => import('./components/DraggableGrid'));
import { WidgetDrawer } from '@/components/WidgetDrawer';

export function Dashboard() {
    const { data, isLoading, error } = useDashboardData();
    const {
        isEditMode,
        toggleEditMode,
        setWidgetDrawerOpen,
        fetchLayout
    } = useLayoutStore();

    // Load layout from Supabase on mount
    useEffect(() => {
        fetchLayout();
    }, [fetchLayout]);

    if (isLoading) return <div className="flex justify-center h-96 items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
    if (error) return <div className="text-red-500 text-center h-96 flex items-center justify-center">Error loading data.</div>;

    return (
        <div className="pb-10 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Customize your workspace.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-smooth shadow-sm",
                            // Pulse effect if in edit mode to draw attention
                            isEditMode && "animate-pulse ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-950"
                        )}
                        onClick={() => setWidgetDrawerOpen(true)}
                    >
                        <Plus className="w-4 h-4" /> Add Widget
                    </button>

                    <button
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-smooth border",
                            isEditMode
                                ? "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-card dark:text-emerald-400 dark:border-emerald-900"
                                : "bg-accent hover:bg-accent/80 text-foreground border-border"
                        )}
                        onClick={toggleEditMode}
                    >
                        {isEditMode ? <><Check className="w-4 h-4" /> Done</> : <><Settings className="w-4 h-4" /> Edit Layout</>}
                    </button>
                </div>
            </div>

            {/* Suspense Boundary protects the app if DraggableGrid module crashes */}
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Grid System...</div>}>
                <DraggableGrid data={data} isEditMode={isEditMode} />
            </Suspense>

            {/* Widget Library Drawer */}
            <WidgetDrawer />
        </div>
    );
}
