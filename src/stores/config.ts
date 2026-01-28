import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppConfigState {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
    setDemoMode: (value: boolean) => void;
}

export const useAppConfig = create<AppConfigState>()(
    persist(
        (set) => ({
            isDemoMode: true, // Default to true as requested
            toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
            setDemoMode: (value) => set({ isDemoMode: value }),
        }),
        {
            name: 'app-config',
        }
    )
);
