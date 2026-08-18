import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore.js';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
};

export function ToastViewport() {
  const toasts = useNotificationStore((state) => state.toasts);
  const dismissToast = useNotificationStore((state) => state.dismissToast);

  return (
    <div className="toast-viewport" aria-live="polite">
      {toasts.slice(0, 3).map((toast) => {
        const Icon = icons[toast.type] ?? Info;
        return (
          <button key={toast.id} type="button" className={`toast toast-${toast.type}`} onClick={() => dismissToast(toast.id)}>
            <Icon size={18} aria-hidden="true" />
            <span>{toast.message}</span>
          </button>
        );
      })}
    </div>
  );
}
