export type ProjectStatus = 'completed' | 'in_progress' | 'pending';

export interface ProjectRow {
    id: string;
    title: string;
    status: ProjectStatus;
    due_date: string;
    category: string | null;
    created_at?: string;
}

export interface TeamMemberRow {
    id: string;
    name: string;
    role: string;
    avatar_url: string | null;
    current_task: string | null;
    status: ProjectStatus;
    created_at?: string;
}

export interface TimeLogRow {
    id: string;
    project_id: string;
    duration: number;
    logged_at: string;
    notes: string | null;
}

// Derived types for UI
export interface GaugeStats {
    completed: number;
    inProgress: number;
    pending: number;
}
