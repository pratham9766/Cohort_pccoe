import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const storedTheme = window.localStorage.getItem('cohort-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  notificationPanelOpen: false,
  theme: getInitialTheme(),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setNotificationPanelOpen: (notificationPanelOpen) => set({ notificationPanelOpen }),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') window.localStorage.setItem('cohort-theme', theme);
      return { theme };
    }),
}));
