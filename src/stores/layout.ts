import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Standard Grid Breakpoints
export const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
export const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

// Define LayoutItem interface matching react-grid-layout
export interface LayoutItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
}

export type WidgetType = 'stat-total' | 'stat-ended' | 'stat-running' | 'stat-pending' | 'analytics' | 'team' | 'reminders' | 'gauge' | 'project-list' | 'time-tracker' | 'calendar' | 'stats' | 'kanban-board';

export interface Widget {
    id: string;
    type: WidgetType;
    title?: string;
}

interface LayoutState {
    isEditMode: boolean;
    toggleEditMode: () => void;
    isWidgetDrawerOpen: boolean;
    setWidgetDrawerOpen: (isOpen: boolean) => void;

    // Dynamic Widgets
    widgets: Widget[];
    addWidget: (widget: Widget) => void;
    removeWidget: (id: string) => void;

    /**
     * Atomically adds a widget and updates the layout for a specific breakpoint.
     * Prevents render tearing where the widget exists but acts as if it has no layout.
     */
    addWidgetWithLayout: (widget: Widget, breakpoint: string, layout: LayoutItem[]) => void;

    // Store layouts for different breakpoints
    layouts: { [key: string]: LayoutItem[] };
    setLayouts: (layouts: { [key: string]: LayoutItem[] }) => void;
    updateLayout: (breakpoint: string, newLayout: LayoutItem[]) => void;
    resetToDefault: () => void;

    // Persistence
    fetchLayout: () => Promise<void>;
    saveLayout: () => Promise<void>;
}

// Base layout items (will be scaled for each breakpoint)
const baseLayoutItems = [
    { i: 'stat-total', x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'stat-ended', x: 3, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'stat-running', x: 6, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'stat-pending', x: 9, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'analytics', x: 0, y: 4, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'team', x: 6, y: 4, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'reminders', x: 0, y: 12, w: 3, h: 6, minW: 2, minH: 4 },
    { i: 'gauge', x: 3, y: 12, w: 3, h: 6, minW: 2, minH: 4 },
    { i: 'project-list', x: 6, y: 12, w: 3, h: 9, minW: 2, minH: 5 },
    { i: 'time-tracker', x: 9, y: 12, w: 3, h: 6, minW: 2, minH: 4 },
];

const initialWidgets: Widget[] = [
    { id: 'stat-total', type: 'stat-total', title: 'Total Projects' },
    { id: 'stat-ended', type: 'stat-ended', title: 'Ended Projects' },
    { id: 'stat-running', type: 'stat-running', title: 'Running Projects' },
    { id: 'stat-pending', type: 'stat-pending', title: 'Pending Projects' },
    { id: 'analytics', type: 'analytics', title: 'Project Analytics' },
    { id: 'team', type: 'team', title: 'Team' },
    { id: 'reminders', type: 'reminders', title: 'Reminders' },
    { id: 'gauge', type: 'gauge', title: 'Progress' },
    { id: 'project-list', type: 'project-list', title: 'Projects' },
    { id: 'time-tracker', type: 'time-tracker', title: 'Time Tracker' },
];

// Generate layout for smaller breakpoints
function generateBreakpointLayout(maxCols: number): LayoutItem[] {
    let currentY = 0;
    return baseLayoutItems.map((item) => {
        const w = Math.min(item.w, maxCols);
        const x = Math.min(item.x, maxCols - w);
        const layout: LayoutItem = {
            i: item.i,
            x: maxCols <= 4 ? 0 : x, // Stack vertically on small screens
            y: maxCols <= 4 ? currentY : item.y,
            w: maxCols <= 4 ? maxCols : w,
            h: item.h,
            minW: Math.min(item.minW, maxCols),
            minH: item.minH,
        };
        if (maxCols <= 4) {
            currentY += item.h;
        }
        return layout;
    });
}

// Default Layout Definition for ALL breakpoints
const defaultLayouts: { [key: string]: LayoutItem[] } = {
    lg: baseLayoutItems as LayoutItem[],
    md: generateBreakpointLayout(cols.md),
    sm: generateBreakpointLayout(cols.sm),
    xs: generateBreakpointLayout(cols.xs),
    xxs: generateBreakpointLayout(cols.xxs),
};

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set, get) => ({
            isEditMode: false,
            toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
            isWidgetDrawerOpen: false,
            setWidgetDrawerOpen: (isOpen) => set({ isWidgetDrawerOpen: isOpen }),

            widgets: initialWidgets,
            addWidget: (widget) => {
                set((state) => ({ widgets: [...state.widgets, widget] }));
                get().saveLayout();
            },

            addWidgetWithLayout: (widget, breakpoint, newLayout) => {
                set((state) => ({
                    widgets: [...state.widgets, widget],
                    layouts: { ...state.layouts, [breakpoint]: newLayout }
                }));
                get().saveLayout();
            },

            removeWidget: (id) => {
                set((state) => {
                    // Remove widget from widgets array
                    const updatedWidgets = state.widgets.filter((w) => w.id !== id);

                    // Remove widget from ALL layouts
                    const updatedLayouts: { [key: string]: LayoutItem[] } = {};
                    Object.keys(state.layouts).forEach((breakpoint) => {
                        updatedLayouts[breakpoint] = state.layouts[breakpoint].filter((item) => item.i !== id);
                    });

                    return {
                        widgets: updatedWidgets,
                        layouts: updatedLayouts
                    };
                });
                get().saveLayout();
            },

            layouts: defaultLayouts,
            setLayouts: (newLayouts) => {
                // Merge with defaults to ensure all breakpoints exist
                const merged = { ...defaultLayouts };
                Object.keys(newLayouts).forEach((bp) => {
                    if (newLayouts[bp] && newLayouts[bp].length > 0) {
                        merged[bp] = newLayouts[bp];
                    }
                });
                set({ layouts: merged });
            },
            updateLayout: (breakpoint, newLayout) => {
                set((state) => ({
                    layouts: { ...state.layouts, [breakpoint]: newLayout }
                }));
                get().saveLayout();
            },

            resetToDefault: () => {
                set({ layouts: defaultLayouts, widgets: initialWidgets });
                get().saveLayout();
            },

            fetchLayout: async () => {
                try {
                    const { supabase } = await import('@/lib/supabase');
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data } = await supabase
                        .from('user_settings')
                        .select('dashboard_layout')
                        .eq('user_id', user.id)
                        .single();

                    if (data?.dashboard_layout) {
                        const { widgets, layouts } = data.dashboard_layout;
                        if (widgets && layouts) {
                            set({ widgets, layouts });
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch layout", err);
                }
            },

            saveLayout: async () => {
                try {
                    const { supabase } = await import('@/lib/supabase');
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { widgets, layouts } = get();
                    const dashboard_layout = { widgets, layouts };

                    await supabase
                        .from('user_settings')
                        .upsert({
                            user_id: user.id,
                            dashboard_layout
                        });
                } catch (err) {
                    console.error("Failed to save layout", err);
                }
            }
        }),
        {
            name: 'dashboard-layout-storage',
            version: 3, // Bump version for new widget state
            migrate: (persistedState: any, version: number) => {
                if (version < 3) {
                    return {
                        ...persistedState,
                        layouts: defaultLayouts,
                        widgets: initialWidgets
                    };
                }
                return persistedState;
            },
        }
    )
);

