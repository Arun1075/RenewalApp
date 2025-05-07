import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';
import type { Renewal } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface RenewalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (renewal: Partial<Renewal>) => void;
  renewal?: Renewal;
  title: string;
}

const RenewalForm: React.FC<RenewalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  renewal,
  title
}) => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState<Partial<Renewal>>({
    service_name: '',
    service_type: 'domain',
    provider: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split('T')[0],
    cost: 0,
    reminder_type: 'email',
    notes: '',
    user_id: '',
    status: 'active'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Populate form with renewal data if editing
  useEffect(() => {
    if (renewal) {
      // Format dates from API (YYYY-MM-DD) to input field format
      const formattedRenewal = {
        ...renewal,
        id: renewal.id,
        user_id: renewal.user_id || renewal.user_id,
        service_name: renewal.service_name || renewal.service_name,
        service_type: renewal.service_type || renewal.service_type,
        start_date: (renewal.start_date || renewal.start_date)?.split('T')[0] || '', 
        end_date: (renewal.end_date || renewal.end_date)?.split('T')[0] || '',
        reminder_type: renewal.reminder_type || renewal.reminder_type
      };
      
      setFormData(formattedRenewal);
    } else {
      // Reset form for new renewals
      setFormData({
        service_name: '',
        service_type: 'domain',
        provider: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split('T')[0],
        cost: 0,
        reminder_type: 'email',
        notes: '',
        user_id: currentUser?.id || '',
        status: 'active'
      });
    }
  }, [renewal, currentUser, isOpen]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.service_name?.trim()) {
      newErrors.service_name = 'Service name is required';
    }
    
    if (!formData.provider?.trim()) {
      newErrors.provider = 'Provider is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (formData.end_date && formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    if (formData.cost === undefined || formData.cost <= 0) {
      newErrors.cost = 'Cost must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Parse numeric values
    if (name === 'cost') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make a copy of form data to transform
    const apiFormData = { ...formData };
    
    // Ensure dates are in YYYY-MM-DD format
    if (formData.start_date) {
      // Ensure date is in YYYY-MM-DD format
      apiFormData.start_date = formData.start_date.split('T')[0];
    }
    
    if (formData.end_date) {
      // Ensure date is in YYYY-MM-DD format
      apiFormData.end_date = formData.end_date.split('T')[0];
    }
    
    // Validate cost as a number
    if (typeof formData.cost === 'string') {
      apiFormData.cost = parseFloat(formData.cost) || 0;
    }
    
    if (validateForm()) {
      console.log('Submitting form data:', apiFormData);
      onSubmit(apiFormData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_name">Service Name *</Label>
              <Input
                id="service_name"
                name="service_name"
                value={formData.service_name}
                onChange={handleChange}
                className={errors.service_name ? "border-destructive" : ""}
              />
              {errors.service_name && (
                <p className="text-xs text-destructive">{errors.service_name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type *</Label>
              <Select 
                value={formData.service_type} 
                onValueChange={(value) => handleSelectChange('service_type', value)}
              >
                <SelectTrigger className={errors.service_type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="antivirus">Antivirus</SelectItem>
                  <SelectItem value="hosting">Hosting</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.service_type && (
                <p className="text-xs text-destructive">{errors.service_type}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="provider">Provider *</Label>
            <Input
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className={errors.provider ? "border-destructive" : ""}
            />
            {errors.provider && (
              <p className="text-xs text-destructive">{errors.provider}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <div className="relative">
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`pr-8 ${errors.start_date ? "border-destructive" : ""}`}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.start_date && (
                <p className="text-xs text-destructive">{errors.start_date}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <div className="relative">
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={errors.end_date ? "border-destructive" : ""}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.end_date && (
                <p className="text-xs text-destructive">{errors.end_date}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($) *</Label>
              <div className="relative">
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={handleChange}
                  className={errors.cost ? "border-destructive" : ""}
                />
              </div>
              {errors.cost && (
                <p className="text-xs text-destructive">{errors.cost}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder_type">Reminder Type</Label>
              <Select 
                value={formData.reminder_type} 
                onValueChange={(value) => handleSelectChange('reminder_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reminder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {renewal && (
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Add any additional information about this renewal"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {renewal ? 'Update Renewal' : 'Add Renewal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenewalForm;