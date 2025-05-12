import React from 'react';
import {
  AlertTriangle,
  Check,
  Info,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { cn } from '../../lib/utils';

export type ConfirmationVariant = 'info' | 'warning' | 'danger' | 'success' | 'question';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationVariant;
  isSubmitting?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  isSubmitting = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'info':
        return <Info className="h-6 w-6 text-info" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      case 'danger':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      case 'success':
        return <Check className="h-6 w-6 text-success" />;
      case 'question':
        return <HelpCircle className="h-6 w-6 text-primary" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-warning" />;
    }
  };
  
  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive';
      case 'success':
        return 'default';
      case 'info':
        return 'secondary';
      case 'question':
        return 'default';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const getHeaderClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-destructive/10';
      case 'success':
        return 'bg-success/10';
      case 'info':
        return 'bg-info/10';
      case 'warning':
        return 'bg-warning/10';
      case 'question':
        return 'bg-primary/10';
      default:
        return 'bg-warning/10';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className={cn('p-6 flex justify-between items-center rounded-t-lg', getHeaderClasses())}>
          <div className="flex gap-4 items-center">
            {getIcon()}
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {description && (
          <DialogDescription className="py-4">
            {description}
          </DialogDescription>
        )}
        
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button 
            variant={getButtonVariant() as any}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Please wait...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;