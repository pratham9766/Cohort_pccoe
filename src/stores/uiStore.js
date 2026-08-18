import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  notificationPanelOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setNotificationPanelOpen: (notificationPanelOpen) => set({ notificationPanelOpen }),
}));
