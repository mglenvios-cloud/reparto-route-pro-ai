import { create } from 'zustand';

interface AppState {
  darkMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  darkMode: localStorage.getItem('darkMode') !== 'false',
  sidebarOpen: true,

  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode;
    localStorage.setItem('darkMode', String(newMode));
    return { darkMode: newMode };
  }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
