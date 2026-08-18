import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  toasts: [],
  unreadCount: 0,
  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [{ id, type, message }, ...state.toasts] }));
    window.setTimeout(() => get().dismissToast(id), 3000);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAllRead: () => set({ unreadCount: 0, notifications: get().notifications.map((item) => ({ ...item, is_read: true })) }),
}));
