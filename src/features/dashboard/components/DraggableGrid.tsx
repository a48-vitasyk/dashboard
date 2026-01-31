import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as RGLNamespace from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLayoutStore, breakpoints, cols, Widget as WidgetType, WIDGET_SIZES } from '@/stores/layout';
import { WidgetRegistry } from '@/components/widgets/WidgetRegistry';
import { v4 as uuidv4 } from 'uuid';

const ResponsiveGridLayout = RGLNamespace.Responsive || RGLNamespace.ResponsiveGridLayout;

const GridWrapper = (props: any) => {
    if (!ResponsiveGridLayout) return <div>Grid Library Not Found</div>;

    const [width, setWidth] = useState(1200);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        setWidth(ref.current.offsetWidth || 1200);

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0) {
                    setWidth(entry.contentRect.width);
                }
            }
        });
        resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className="w-full"
            style={{
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 10
            }}
        >
            <ResponsiveGridLayout width={width} {...props} />
        </div>
    );
};


export default function DraggableGrid({ data, isEditMode }: any) {
    const { layouts, setLayouts, widgets, addWidgetWithLayout, removeWidget, draggingWidgetType } = useLayoutStore();
    const isInitializedRef = useRef(false);
    const hasUserInteractedRef = useRef(false);
    const gridWrapperRef = useRef<HTMLDivElement>(null);

    const processedLayouts = useMemo(() => {
        const result: { [key: string]: any[] } = {};
        if (layouts && typeof layouts === 'object') {
            Object.keys(layouts).forEach((breakpoint) => {
                const currentLayout = layouts[breakpoint];
                if (Array.isArray(currentLayout)) {
                    result[breakpoint] = currentLayout.map((item: any) => {
                        // Find widget to get type for constraints
                        const widget = widgets?.find(w => w.id === item.i);
                        const widgetType = widget?.type || '';

                        // Set min/max constraints based on widget type
                        const sizeConfig = WIDGET_SIZES[widgetType] || { minW: 2, minH: 4, maxW: 12, maxH: 20 };
                        const minW = sizeConfig.minW;
                        const maxW = sizeConfig.maxW || 12;
                        const minH = sizeConfig.minH;
                        const maxH = sizeConfig.maxH || 20;

                        return {
                            ...item,
                            static: !isEditMode,
                            isDraggable: isEditMode,
                            isResizable: isEditMode,
                            minW,
                            maxW,
                            minH,
                            maxH,
                        };
                    });
                }
            });
        }
        return result;
    }, [layouts, isEditMode, widgets]);

    // Global dragover prevention - NO stopPropagation
    useEffect(() => {
        if (!isEditMode) return;

        const preventDefaultDrag = (e: DragEvent) => {
            e.preventDefault();
            // REMOVED stopPropagation to allow events to bubble to grid
            console.log('🎯 WINDOW DRAGOVER');
        };

        const preventDefaultDragEnter = (e: DragEvent) => {
            e.preventDefault();
        };

        window.addEventListener('dragover', preventDefaultDrag);
        window.addEventListener('dragenter', preventDefaultDragEnter);

        console.log('✅ Global drag listeners attached');

        return () => {
            window.removeEventListener('dragover', preventDefaultDrag);
            window.removeEventListener('dragenter', preventDefaultDragEnter);
        };
    }, [isEditMode]);

    useEffect(() => {
        const timer = setTimeout(() => {
            isInitializedRef.current = true;
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleLayoutChange = useCallback((_currentLayout: any, allLayouts: any) => {
        if (!isInitializedRef.current) return;
        if (!allLayouts || Object.keys(allLayouts).length === 0) return;
        if (!hasUserInteractedRef.current) return;

        const cleanLayouts: { [key: string]: any[] } = {};
        Object.keys(allLayouts).forEach((bp) => {
            cleanLayouts[bp] = allLayouts[bp].map((item: any) => {
                const { static: _static, ...rest } = item;
                return rest;
            });
        });
        setLayouts(cleanLayouts);
    }, [setLayouts]);

    const handleDragStart = useCallback(() => {
        hasUserInteractedRef.current = true;
        console.log('📦 Widget drag started');
    }, []);

    const handleResizeStart = useCallback(() => {
        hasUserInteractedRef.current = true;
    }, []);

    const handleDeleteWidget = useCallback((widgetId: string) => {
        if (removeWidget) {
            console.log('🗑️ Deleting widget:', widgetId);
            removeWidget(widgetId);
            hasUserInteractedRef.current = true;
        }
    }, [removeWidget]);

    const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');

    // WRAPPER-LEVEL DRAG HANDLERS
    const handleWrapperDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        // REMOVED stopPropagation
        console.log('🔵 GRID WRAPPER DRAGOVER!!!');
    }, []);

    const handleWrapperDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        console.log('🟢 GRID WRAPPER DRAGENTER!!!');
    }, []);

    // FALLBACK DROP HANDLER
    const handleWrapperDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('💥💥💥 WRAPPER DROP FIRED!!!');

        const widgetType = e.dataTransfer.getData("widgetType");
        console.log('📋 Widget type:', widgetType);

        if (!widgetType) {
            console.error('❌ No widgetType!');
            return;
        }

        const newId = uuidv4();
        console.log('🆔 New ID:', newId);

        let w = 4;
        let h = 4;
        if (WIDGET_SIZES[widgetType]) {
            w = WIDGET_SIZES[widgetType].w;
            h = WIDGET_SIZES[widgetType].h;
        }

        const newWidget: WidgetType = {
            id: newId,
            type: widgetType as any,
            title: widgetType.charAt(0).toUpperCase() + widgetType.slice(1)
        };

        const newLayoutItem = {
            i: newId,
            x: 0,
            y: Infinity,
            w,
            h,
            static: false,
            isDraggable: true,
            isResizable: true
        };

        const currentLayout = processedLayouts[currentBreakpoint] || [];
        const updatedLayout = [...currentLayout, newLayoutItem];

        hasUserInteractedRef.current = true;

        if (addWidgetWithLayout) {
            console.log('✅ ADDING WIDGET (FALLBACK)');
            addWidgetWithLayout(newWidget, currentBreakpoint, updatedLayout);
        }
    }, [currentBreakpoint, processedLayouts, addWidgetWithLayout]);

    // LIBRARY onDrop
    const handleDrop = (layout: any, _layoutItem: any, _event: DragEvent) => {
        console.log('💥 LIBRARY DROP FIRED!');

        if (_event) {
            _event.preventDefault();
            _event.stopPropagation();
        }

        const widgetType = _event.dataTransfer?.getData("widgetType");
        console.log('📋 Widget type:', widgetType);

        if (!widgetType) {
            console.error('❌ No widgetType!');
            return;
        }

        const newId = uuidv4();
        console.log('🆔 New ID:', newId);

        let w = 4;
        let h = 4;
        if (WIDGET_SIZES[widgetType]) {
            w = WIDGET_SIZES[widgetType].w;
            h = WIDGET_SIZES[widgetType].h;
        }

        const newWidget: WidgetType = {
            id: newId,
            type: widgetType as any,
            title: widgetType.charAt(0).toUpperCase() + widgetType.slice(1)
        };

        hasUserInteractedRef.current = true;

        const newLayout = layout.map((l: any) => {
            if (l.i === "__dropping_elem__") {
                console.log('🔄 Replacing __dropping_elem__');
                return {
                    ...l,
                    i: newId,
                    w,
                    h,
                    static: false,
                    isDraggable: true,
                    isResizable: true
                };
            }
            return l;
        });

        if (addWidgetWithLayout) {
            console.log('✅ ADDING WIDGET (LIBRARY)');
            addWidgetWithLayout(newWidget, currentBreakpoint, newLayout);
        }
    };

    if (!ResponsiveGridLayout) {
        return (
            <div className="p-4 bg-red-50 text-red-500 rounded border border-red-200">
                <p>Grid Library failed to load exports.</p>
            </div>
        );
    }

    const Widget = ({ children, className, style, widgetId, ...props }: any) => (
        <div
            className={cn(
                "h-full w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col",
                isEditMode && "border-2 border-emerald-500/30 border-dashed relative",
                className
            )}
            style={{ ...style, pointerEvents: 'auto' }}
            {...props}
        >
            {isEditMode && (
                <>
                    <div className="absolute top-2 right-2 z-50 flex gap-1">
                        <button
                            onClick={() => handleDeleteWidget(widgetId)}
                            className="p-1 bg-red-100 dark:bg-red-900 rounded text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                            title="Delete widget"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="p-1 bg-emerald-100 dark:bg-emerald-900 rounded text-emerald-600 dark:text-emerald-400 grid-drag-handle opacity-70 hover:opacity-100 transition-opacity cursor-move">
                            <GripVertical className="w-4 h-4" />
                        </div>
                    </div>
                    {/* Resize Handle Indicator */}
                    <div
                        className="react-resizable-handle react-resizable-handle-se absolute bottom-2 right-2 w-4 h-4 opacity-40 hover:opacity-100 transition-opacity pointer-events-none"
                        style={{
                            cursor: 'se-resize',
                            background: 'linear-gradient(135deg, transparent 50%, currentColor 50%)',
                            color: '#10b981'
                        }}
                    />
                </>
            )}
            {children}
        </div>
    );

    return (
        <div
            ref={gridWrapperRef}
            className="w-full"
            style={{
                pointerEvents: 'all',
                position: 'relative',
                zIndex: 1,
                minHeight: '400px'
            }}
            onDragOver={handleWrapperDragOver}
            onDragEnter={handleWrapperDragEnter}
            onDrop={handleWrapperDrop}
        >
            <GridWrapper
                className="layout"
                layouts={processedLayouts}
                breakpoints={breakpoints}
                cols={cols}
                rowHeight={20}
                draggableHandle=".grid-drag-handle"
                isDraggable={isEditMode}
                isResizable={isEditMode}
                resizeHandles={['se']}
                isDroppable={true}
                compactType="vertical"
                preventCollision={false}
                margin={[24, 24]}
                containerPadding={[0, 0]}
                onLayoutChange={handleLayoutChange}
                onDragStart={handleDragStart}
                onResizeStart={handleResizeStart}
                onBreakpointChange={setCurrentBreakpoint}
                onDrop={handleDrop}
                droppingItem={{
                    i: "__dropping_elem__",
                    w: draggingWidgetType && WIDGET_SIZES[draggingWidgetType] ? WIDGET_SIZES[draggingWidgetType].w : 4,
                    h: draggingWidgetType && WIDGET_SIZES[draggingWidgetType] ? WIDGET_SIZES[draggingWidgetType].h : 4
                }}
            >
                {(widgets || []).map((widget) => {
                    let className = "";
                    // Only keep special styling for stat cards
                    if (widget.type === 'stat-total') className = "bg-emerald-800 text-white border-0";
                    // All other widgets use p-0 since they manage their own padding
                    if (widget.type !== 'stat-total') className = "p-0";

                    return (
                        <div key={widget.id} style={{ pointerEvents: 'auto' }}>
                            <Widget className={className} widgetId={widget.id}>
                                <WidgetRegistry type={widget.type} data={data} />
                            </Widget>
                        </div>
                    )
                })}
            </GridWrapper>
        </div>
    );
}
