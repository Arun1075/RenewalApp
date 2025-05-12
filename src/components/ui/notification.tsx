import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Define the Toast type since it's not exported from react-hot-toast
interface Toast {
  id: string;
  visible: boolean;
  type?: string;
  message?: string;
}

interface NotificationProps {
  message: string;
  type?: NotificationType;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

// Component for the toast content with different styles per notification type
const ToastContent = ({ t, type, message }: { t: Toast; type: NotificationType; message: string }) => {
  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <AlertCircle className="h-5 w-5 text-destructive" />,
    info: <Info className="h-5 w-5 text-info" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />
  };

  const bgColorMap = {
    success: 'bg-success/10 border-success/20',
    error: 'bg-destructive/10 border-destructive/20',
    info: 'bg-info/10 border-info/20',
    warning: 'bg-warning/10 border-warning/20'
  };

  const textColorMap = {
    success: 'text-success-foreground',
    error: 'text-destructive-foreground',
    info: 'text-info-foreground',
    warning: 'text-warning-foreground'
  };

  return (
    <div
      className={cn(
        'flex items-center p-4 rounded-lg shadow-md border',
        bgColorMap[type],
        textColorMap[type],
        t.visible ? 'animate-enter' : 'animate-leave'
      )}
    >
      <div className="flex-shrink-0">{iconMap[type]}</div>
      <div className="ml-3 mr-8 flex-1">{message}</div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="flex-shrink-0 rounded-md p-1 hover:bg-primary/10"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
};

// ToasterProvider component to be used at the app root level
export const ToasterProvider = () => {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerClassName="toast-container"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          maxWidth: '420px',
          width: '100%'
        }
      }}
    />
  );
};

// Function to show notifications - this is what components will import and use
export const showNotification = ({
  message,
  type = 'info',
  duration = 5000,
  position = 'top-right'
}: NotificationProps) => {
  // Set the toast position if it's different from default
  if (position !== 'top-right') {
    toast.remove();
    Toaster({ position });
  }

  return toast.custom(
    (t) => <ToastContent t={t} type={type} message={message} />,
    { duration }
  );
};

// Helper functions for common notification types
export const notifySuccess = (message: string, duration?: number) => 
  showNotification({ message, type: 'success', duration });

export const notifyError = (message: string, duration?: number) => 
  showNotification({ message, type: 'error', duration });

export const notifyInfo = (message: string, duration?: number) => 
  showNotification({ message, type: 'info', duration });

export const notifyWarning = (message: string, duration?: number) => 
  showNotification({ message, type: 'warning', duration });

// Default export for backwards compatibility
export default {
  show: showNotification,
  success: notifySuccess,
  error: notifyError,
  info: notifyInfo,
  warning: notifyWarning
};