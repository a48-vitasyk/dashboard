import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Standard Grid Breakpoints
export const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
export const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

// Widget Dimensions Configuration
export const WIDGET_SIZES: Record<string, { w: number; h: number; minW: number; minH: number; maxW?: number; maxH?: number }> = {
    'kanban-board': { w: 3, h: 16, minW: 3, minH: 6, maxH: 24 },
    'calendar': { w: 3, h: 8, minW: 3, minH: 8, maxH: 16 },
    'analytics': { w: 6, h: 8, minW: 4, minH: 6 },
    'team': { w: 6, h: 8, minW: 4, minH: 6 },
    'reminders': { w: 3, h: 6, minW: 2, minH: 4, maxW: 6, maxH: 10 },
    'gauge': { w: 3, h: 6, minW: 2, minH: 4, maxW: 6, maxH: 10 },
    'project-list': { w: 3, h: 10, minW: 2, minH: 5, maxW: 6 },
    'time-tracker': { w: 3, h: 6, minW: 2, minH: 4, maxW: 6, maxH: 10 },
    'stat-total': { w: 3, h: 4, minW: 2, minH: 3, maxW: 4, maxH: 6 },
    'stat-ended': { w: 3, h: 4, minW: 2, minH: 3, maxW: 4, maxH: 6 },
    'stat-running': { w: 3, h: 4, minW: 2, minH: 3, maxW: 4, maxH: 6 },
    'stat-pending': { w: 3, h: 4, minW: 2, minH: 3, maxW: 4, maxH: 6 },
};

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

    // Dragging State
    draggingWidgetType: string | null;
    setDraggingWidgetType: (type: string | null) => void;

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

// Helper: Pack items into a grid (Bin Packing)
function packItems(items: LayoutItem[], maxCols: number): LayoutItem[] {
    // 1. Sort items by y, then x to try to preserve some relative order, 
    // but mostly we want to pack tight.
    const sortedItems = [...items].sort((a, b) => {
        if (a.y === b.y) return a.x - b.x;
        return a.y - b.y;
    });

    const packedLayout: LayoutItem[] = [];
    const occupiedSpaces: boolean[][] = []; // grid[y][x]

    const isSpaceOccupied = (x: number, y: number, w: number, h: number) => {
        for (let dy = 0; dy < h; dy++) {
            if (!occupiedSpaces[y + dy]) continue;
            for (let dx = 0; dx < w; dx++) {
                if (occupiedSpaces[y + dy][x + dx]) {
                    return true;
                }
            }
        }
        return false;
    };

    const markSpace = (x: number, y: number, w: number, h: number) => {
        for (let dy = 0; dy < h; dy++) {
            if (!occupiedSpaces[y + dy]) occupiedSpaces[y + dy] = [];
            for (let dx = 0; dx < w; dx++) {
                occupiedSpaces[y + dy][x + dx] = true;
            }
        }
    };

    sortedItems.forEach(item => {
        // Clamp width to maxCols
        let w = Math.min(item.w, maxCols);
        // Ensure min dimension constraints
        w = Math.max(w, item.minW || 2);
        const h = item.h;

        // If item is wider than maxCols (e.g. tablet), it takes full width
        if (w > maxCols) w = maxCols;

        // Find first available position
        let found = false;
        let y = 0;

        while (!found) {
            for (let x = 0; x <= maxCols - w; x++) {
                if (!isSpaceOccupied(x, y, w, h)) {
                    // Found a spot!
                    packedLayout.push({
                        ...item,
                        x,
                        y,
                        w,
                        h,
                        minW: Math.min(item.minW || 2, maxCols),
                        static: false
                    });
                    markSpace(x, y, w, h);
                    found = true;
                    break;
                }
            }
            if (!found) y++; // Try next row
        }
    });

    return packedLayout;
}

// Generate layout for smaller breakpoints
function generateBreakpointLayout(maxCols: number): LayoutItem[] {
    // Use base layout items as source
    return packItems(baseLayoutItems as LayoutItem[], maxCols);
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

            draggingWidgetType: null,
            setDraggingWidgetType: (type) => set({ draggingWidgetType: type }),

            widgets: initialWidgets,
            addWidget: (widget) => {
                const state = get();
                const newLayouts = { ...state.layouts };
                const allBreakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];

                allBreakpoints.forEach(bp => {
                    const currentBpLayout = newLayouts[bp] || [];

                    // Check if widget already exists
                    if (currentBpLayout.some(item => item.i === widget.id)) return;

                    // Calculate correct dimensions
                    const sizeConfig = WIDGET_SIZES[widget.type] || { w: 4, h: 4, minW: 2, minH: 4 };
                    const maxCols = cols[bp as keyof typeof cols] || 12;
                    const w = Math.min(sizeConfig.w, maxCols);
                    const minW = Math.min(sizeConfig.minW, maxCols);

                    const newItem: LayoutItem = {
                        i: widget.id,
                        x: 0, y: 0, // Placeholder, will be packed
                        w: w, h: sizeConfig.h,
                        minW: minW, minH: sizeConfig.minH,
                        static: false, isDraggable: true, isResizable: true
                    };
                    if (sizeConfig.maxW) newItem.maxW = sizeConfig.maxW;
                    if (sizeConfig.maxH) newItem.maxH = sizeConfig.maxH;

                    // Add new item to list and RE-PACK everything to fit nicely
                    const layoutToPack = [...currentBpLayout, newItem];
                    newLayouts[bp] = packItems(layoutToPack, maxCols);
                });

                set((state) => ({
                    widgets: [...state.widgets, widget],
                    layouts: newLayouts
                }));
                get().saveLayout();
            },

            addWidgetWithLayout: (widget, breakpoint, newLayout) => {
                const state = get();
                const newLayouts = { ...state.layouts };

                // 1. Update target breakpoint (respect drop position)
                newLayouts[breakpoint] = newLayout;

                // 2. Update OTHER breakpoints with packing
                const allBreakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
                allBreakpoints.forEach(bp => {
                    if (bp === breakpoint) return;

                    const currentBpLayout = newLayouts[bp] || [];
                    if (currentBpLayout.some(item => item.i === widget.id)) return;

                    const sizeConfig = WIDGET_SIZES[widget.type] || { w: 4, h: 4, minW: 2, minH: 4 };
                    const maxCols = cols[bp as keyof typeof cols] || 12;
                    const w = Math.min(sizeConfig.w, maxCols);
                    const minW = Math.min(sizeConfig.minW, maxCols);

                    const newItem: LayoutItem = {
                        i: widget.id,
                        x: 0, y: 0,
                        w: w, h: sizeConfig.h,
                        minW: minW, minH: sizeConfig.minH,
                        static: false, isDraggable: true, isResizable: true
                    };
                    if (sizeConfig.maxW) newItem.maxW = sizeConfig.maxW;
                    if (sizeConfig.maxH) newItem.maxH = sizeConfig.maxH;

                    const layoutToPack = [...currentBpLayout, newItem];
                    newLayouts[bp] = packItems(layoutToPack, maxCols);
                });

                set((state) => ({
                    widgets: [...state.widgets, widget],
                    layouts: newLayouts
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

