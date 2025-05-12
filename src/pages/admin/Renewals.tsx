import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Button } from '../../components/ui/button';
import RenewalsTable from '../../components/dashboard/RenewalsTable';
import RenewalForm from '../../components/dashboard/RenewalForm';
import type { Renewal } from '../../types';
import renewalService from '../../services/renewalService';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../components/ui/dialog';
import { useAuth } from '../../contexts/AuthContext';

const AdminRenewals: React.FC = () => {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  
  // Load all renewals on component mount
  useEffect(() => {
    const fetchRenewals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await renewalService.getRenewals();
        if (response.success) {
          setRenewals(response.data);
        } else {
          setError("Failed to fetch renewals");
        }
      } catch (err) {
        setError("An error occurred while fetching renewals");
        console.error("Error fetching renewals:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRenewals();
  }, []);

  // Handle adding a new renewal
  const handleAddRenewal = async (renewalData: Partial<Renewal>) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Attempting to add renewal with data:", renewalData);
      
      // Add user ID if not provided
      if (currentUser && !renewalData.user_id) {
        renewalData.user_id = currentUser.id;
      }
      
      // Format dates correctly for API
      if (renewalData.start_date) {
        renewalData.start_date = new Date(renewalData.start_date).toISOString().split('T')[0];
      }
      
      if (renewalData.start_date) {
        renewalData.start_date = new Date(renewalData.start_date).toISOString().split('T')[0];
      }
      
      // Remove any undefined or null fields
      const cleanedData = Object.fromEntries(
        Object.entries(renewalData)
          .filter(([_, value]) => value !== undefined && value !== null)
      ) as Omit<Renewal, 'id'>;
      
      console.log("Sending cleaned data to API:", cleanedData);
      
      const response = await renewalService.createRenewal(cleanedData);
      console.log("API response for add renewal:", response);
      
      if (response.success) {
        // Show success message
        alert("Renewal added successfully!");
        
        // Refresh renewals list
        const renewalsResponse = await renewalService.getRenewals();
        if (renewalsResponse.success) {
          setRenewals(renewalsResponse.data);
        }
        setIsAddFormOpen(false);
      } else {
        setError(response.message || "Failed to add renewal");
      }
    } catch (err: any) {
      console.error("Error adding renewal:", err);
      setError(err.message || "An error occurred while adding the renewal");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing an existing renewal
  const handleEditRenewal = async (renewalData: Partial<Renewal>) => {
    if (!renewalData.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await renewalService.updateRenewal(renewalData.id, renewalData);
      
      if (response.success) {
        // Refresh renewals list
        const renewalsResponse = await renewalService.getRenewals();
        if (renewalsResponse.success) {
          setRenewals(renewalsResponse.data);
        }
        setIsEditFormOpen(false);
        setSelectedRenewal(null);
      } else {
        setError("Failed to update renewal");
      }
    } catch (err) {
      setError("An error occurred while updating the renewal");
      console.error("Error updating renewal:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the edit form
  const handleEdit = (renewal: Renewal) => {
    setSelectedRenewal(renewal);
    setIsEditFormOpen(true);
  };

  // Handle viewing renewal details
  const handleView = (renewal: Renewal) => {
    setSelectedRenewal(renewal);
    setIsViewDialogOpen(true);
  };

  // Handle deleting a renewal
  const handleDelete = (id: string) => {
    const renewalToDelete = renewals.find(r => r.id === id);
    if (renewalToDelete) {
      setSelectedRenewal(renewalToDelete);
      setIsDeleteDialogOpen(true);
    }
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!selectedRenewal) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await renewalService.deleteRenewal(selectedRenewal.id);
      
      if (response.success) {
        // Refresh renewals list
        const renewalsResponse = await renewalService.getRenewals();
        if (renewalsResponse.success) {
          setRenewals(renewalsResponse.data);
        }
        setIsDeleteDialogOpen(false);
        setSelectedRenewal(null);
      } else {
        setError("Failed to delete renewal");
      }
    } catch (err) {
      setError("An error occurred while deleting the renewal");
      console.error("Error deleting renewal:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate days remaining until expiration
  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const expiryDate = new Date(endDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md">
            {error}
            <button 
              className="ml-2 underline" 
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Renewals Management</h1>
            <p className="text-muted-foreground">
              Manage all service renewals in one place
            </p>
          </div>
          <Button 
            onClick={() => setIsAddFormOpen(true)} 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Renewal
          </Button>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {/* Renewals table with filter functionality */}
        {!isLoading && (
          <RenewalsTable 
            renewals={renewals}
            onRenewalClick={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        
        {/* Add Renewal Form */}
        <RenewalForm 
          isOpen={isAddFormOpen} 
          onClose={() => {
            setIsAddFormOpen(false);
            setError(null); // Clear any errors when closing
          }}
          onSubmit={handleAddRenewal}
          title="Add New Renewal"
        />
        
        {/* Edit Renewal Form */}
        {selectedRenewal && (
          <RenewalForm 
            isOpen={isEditFormOpen} 
            onClose={() => {
              setIsEditFormOpen(false);
              setSelectedRenewal(null);
            }}
            onSubmit={handleEditRenewal}
            renewal={selectedRenewal}
            title="Edit Renewal"
          />
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this renewal? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedRenewal && (
              <div className="py-4">
                <p className="font-medium">{selectedRenewal.item_name}</p>
                <p className="text-sm text-muted-foreground">Vendor: {selectedRenewal.vendor}</p>
                <p className="text-sm text-muted-foreground">
                  Expires: {format(new Date(selectedRenewal.end_date), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* View Renewal Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Renewal Details</DialogTitle>
            </DialogHeader>
            
            {selectedRenewal && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Item</h3>
                    <p className="font-semibold">{selectedRenewal.item_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                    <p className="font-semibold capitalize">{selectedRenewal.category}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Vendor</h3>
                  <p className="font-semibold">{selectedRenewal.vendor}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                    <p className="font-semibold">
                      {format(new Date(selectedRenewal.start_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                    <p className="font-semibold">
                      {format(new Date(selectedRenewal.end_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Cost</h3>
                    <p className="font-semibold">${selectedRenewal.cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Days Remaining</h3>
                    {(() => {
                      const daysRemaining = getDaysRemaining(selectedRenewal.end_date);
                      return (
                        <p className={cn(
                          "font-semibold flex items-center",
                          daysRemaining <= 0 ? "text-red-500" :
                          daysRemaining <= 30 ? "text-yellow-500" :
                          "text-green-500"
                        )}>
                          {daysRemaining <= 0 ? (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Expired
                            </>
                          ) : (
                            `${daysRemaining} days`
                          )}
                        </p>
                      );
                    })()}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="mt-1">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      selectedRenewal.status === 'active' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                      selectedRenewal.status === 'expiring-soon' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
                      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    )}>
                      {selectedRenewal.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Reminder</h3>
                  <p className="font-semibold">{selectedRenewal.reminder_days_before} days before expiration</p>
                </div>
                
                {selectedRenewal.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                      {selectedRenewal.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setSelectedRenewal(null);
                }}
              >
                Close
              </Button>
              {selectedRenewal && (
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEdit(selectedRenewal);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminRenewals;