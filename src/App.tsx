import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { TasksView } from '@/features/tasks/TasksView';
import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme';
import { mockLogin } from '@/stores/auth';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});

// Placeholder components for routes
function ComingSoon({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <p className="text-muted-foreground">Coming soon...</p>
        </div>
    );
}

function App() {
    const { theme, setTheme } = useThemeStore();

    // Initialize theme and mock user on mount
    useEffect(() => {
        setTheme(theme);
        // Auto-login as admin for development
        mockLogin('admin');
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <MainLayout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/tasks" element={<TasksView />} />
                        <Route path="/calendar" element={<ComingSoon title="Calendar" />} />
                        <Route path="/team" element={<ComingSoon title="Team" />} />
                        <Route path="/projects" element={<ComingSoon title="Projects" />} />
                        <Route path="/reports" element={<ComingSoon title="Reports" />} />
                        <Route path="/analytics" element={<ComingSoon title="Analytics" />} />
                        <Route path="/integrations" element={<ComingSoon title="Integrations" />} />
                        <Route path="/user-access" element={<ComingSoon title="User Access" />} />
                        <Route path="/settings" element={<ComingSoon title="Settings" />} />
                        <Route path="/logout" element={<Navigate to="/" replace />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </MainLayout>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
