import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Calendar } from 'lucide-react';

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  renewalId: string;
  onLogAdded?: () => void; // Callback to refresh logs
}

const AddLogModal: React.FC<AddLogModalProps> = ({
  isOpen,
  onClose,
  renewalId,
  onLogAdded
}) => {
  const [formData, setFormData] = useState({
    action: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.action.trim()) {
      setError('Action is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await api.post(`/renewals/${renewalId}/log`, {
        action: formData.action,
        date: formData.date,
        notes: formData.notes || undefined
      });
      
      if (response.data.success) {
        toast.success('Log entry added successfully');
        // Reset form
        setFormData({
          action: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        // Close modal
        onClose();
        // Refresh logs if callback provided
        if (onLogAdded) {
          onLogAdded();
        }
      } else {
        setError(response.data.message || 'Failed to add log entry');
      }
    } catch (err: any) {
      console.error('Error adding log entry:', err);
      setError(err.message || 'An error occurred while adding log entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Log Entry</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">Action *</Label>
            <Input
              id="action"
              name="action"
              value={formData.action}
              onChange={handleChange}
              placeholder="E.g., Contacted vendor, Payment processed"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <div className="relative">
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional information about this log entry"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="hover-effect"
            >
              {isSubmitting ? 'Saving...' : 'Add Log Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLogModal;