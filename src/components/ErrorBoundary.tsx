import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col p-4">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong.</h1>
                    <div className="bg-white p-4 roundedshadow border w-full max-w-lg overflow-auto">
                        <p className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
                            {this.state.error?.message}
                            {this.state.error?.stack}
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
