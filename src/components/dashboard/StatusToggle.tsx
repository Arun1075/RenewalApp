import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

interface StatusToggleProps {
  currentStatus: string;
  renewalId: string;
  startDate: string;
  endDate: string;
  onStatusChange: (renewalId: string, newStatus: string, dates?: { startDate?: string; endDate?: string }) => Promise<void>;
}

const StatusToggle: React.FC<StatusToggleProps> = ({
  currentStatus,
  renewalId,
  startDate,
  endDate,
  onStatusChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [datesData, setDatesData] = useState({
    startDate: startDate,
    endDate: endDate,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success hover:bg-success/10';
      case 'expiring-soon':
        return 'text-warning hover:bg-warning/10';
      case 'expired':
        return 'text-destructive hover:bg-destructive/10';
      case 'pending':
        return 'text-info hover:bg-info/10';
      case 'canceled':
        return 'text-muted-foreground hover:bg-muted/10';
      default:
        return '';
    }
  };

  const getButtonStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-success/30 text-success';
      case 'expiring-soon':
        return 'border-warning/30 text-warning';
      case 'expired':
        return 'border-destructive/30 text-destructive';
      case 'pending':
        return 'border-info/30 text-info';
      case 'canceled':
        return 'border-muted/30 text-muted-foreground';
      default:
        return 'border-primary/30 text-primary';
    }
  };

  const formatStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    
    // If status is renewed, we need to update dates
    if (status === 'active' || status === 'renewed') {
      setIsModalOpen(true);
    } else {
      handleSubmitStatusChange(status);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatesData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitStatusChange = async (status?: string) => {
    try {
      setIsSubmitting(true);
      const statusToSubmit = status || selectedStatus;
      
      // If modal is open, include dates in the update
      if (isModalOpen) {
        await onStatusChange(renewalId, statusToSubmit, {
          startDate: datesData.startDate,
          endDate: datesData.endDate
        });
      } else {
        await onStatusChange(renewalId, statusToSubmit);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "flex items-center shadow-sm hover:shadow-md transition-shadow",
              getButtonStyle(currentStatus)
            )}
          >
            <span>{formatStatusLabel(currentStatus)}</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-secondary/20 rounded-[var(--radius)]">
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleStatusSelect('active')}
            className={getStatusStyle('active')}
          >
            Active
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusSelect('renewed')}
            className={getStatusStyle('active')}
          >
            Renewed
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusSelect('expiring-soon')}
            className={getStatusStyle('expiring-soon')}
          >
            Expiring Soon
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusSelect('expired')}
            className={getStatusStyle('expired')}
          >
            Expired
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusSelect('canceled')}
            className={getStatusStyle('canceled')}
          >
            Canceled
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date update modal when status is changed to active/renewed */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Renewal Dates</DialogTitle>
            <DialogDescription>
              {selectedStatus === 'renewed' 
                ? 'Update the service dates for this renewed subscription.'
                : 'Update the service dates for this active subscription.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={datesData.startDate}
                onChange={handleDateChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={datesData.endDate}
                onChange={handleDateChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleSubmitStatusChange()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StatusToggle;