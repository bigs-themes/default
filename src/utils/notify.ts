// Type definitions for notification system
type SweetAlertIcon = 'success' | 'warning' | 'error' | 'info' | 'question';

export interface NotifyOptions {
  state?: boolean;
  level?: SweetAlertIcon;
  message?: string;
  title?: string;
  html?: string;
  timer?: number;
  customClass?: {
    popup?: string;
    container?: string;
    icon?: string;
    title?: string;
    text?: string;
  };
  showConfirmButton?: boolean;
  showCloseButton?: boolean;
}

// Global type declarations
declare global {
  interface Window {
    app: {
      toggleNotification: (options: NotifyOptions) => void;
    };
    Swal: any;
  }
}

// Export the function type for use in components
export const toggleNotification = (options: NotifyOptions): void => {
  if (typeof window !== 'undefined' && window.app?.toggleNotification) {
    window.app.toggleNotification(options);
  } else {
    console.warn('Notification system not initialized yet');
    // Fallback to alert
    if (options.message) {
      alert(options.message);
    }
  }
};

// Export default for backward compatibility
export default toggleNotification;