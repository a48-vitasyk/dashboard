import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'user';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: () => boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            isAdmin: () => {
                const user = get().user;
                return user?.role === 'admin';
            },

            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

// Mock login for development
export const mockLogin = (role: UserRole = 'admin') => {
    useAuthStore.getState().setUser({
        id: '1',
        email: 'tmichael20@gmail.com',
        name: 'Totok Michael',
        role,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Totok',
    });
};
