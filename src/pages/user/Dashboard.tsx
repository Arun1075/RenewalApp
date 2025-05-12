import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  AlertTriangle, 
  Settings, 
  LogOut, 
  Plus, 
  Edit,
  Bell,
  History,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import RenewalsTable from '../../components/dashboard/RenewalsTable';
import RenewalForm from '../../components/dashboard/RenewalForm';
import ReminderLog from '../../components/dashboard/ReminderLog';
import RenewalLogs from '../../components/dashboard/RenewalLogs';
import StatsCard from '../../components/dashboard/StatsCard';
import DashboardSummary from '../../components/dashboard/DashboardSummary';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import renewalService from '../../services/renewalService';
import { toast } from 'react-hot-toast';
import type { Renewal, RenewalStats } from '../../types';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../components/ui/dialog';
import { formatDate, isValidDate } from '../../utils/dateUtils';

const UserDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [stats, setStats] = useState<RenewalStats>({ 
    total: 0, 
    active: 0, 
    expiringSoon: 0, 
    expired: 0, 
    totalCost: 0 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reminders' | 'logs'>('dashboard');
  
  // Load user renewals on component mount or when currentUser changes
  useEffect(() => {
    const fetchRenewals = async () => {
      if (currentUser) {
        setIsLoading(true);
        try {
          // Fetch user-specific renewals
          const response = await renewalService.getUserRenewals();
          if (response.success && response.data) {
            setRenewals(response.data);
            
            // Try to get stats from API or calculate locally
            try {
              const statsResponse = await renewalService.getRenewalStats();
              if (statsResponse.success && statsResponse.data) {
                setStats(statsResponse.data);
              } else {
                // Fallback to local calculation if API stats endpoint fails
                setStats(renewalService.calculateRenewalStats(response.data));
              }
            } catch (statsError) {
              console.error("Error fetching stats:", statsError);
              // Fallback to local calculation
              setStats(renewalService.calculateRenewalStats(response.data));
            }
          } else {
            toast.error('Failed to load your renewals');
          }
        } catch (error) {
          console.error('Error loading renewals:', error);
          toast.error('Error loading your renewals');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchRenewals();
  }, [currentUser]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Handle adding a new renewal
  const handleAddRenewal = async (renewalData: Partial<Renewal>) => {
    try {
      // Add current user ID to the renewal data
      if (currentUser) {
        renewalData.user_id = currentUser.id;
      }
      
      const response = await renewalService.createRenewal(renewalData as Omit<Renewal, 'id'>);
      
      if (response.success && response.data) {
        toast.success('Renewal added successfully');
        
        // Refresh renewals list
        const renewalsResponse = await renewalService.getUserRenewals();
        if (renewalsResponse.success && renewalsResponse.data) {
          setRenewals(renewalsResponse.data);
          setStats(renewalService.calculateRenewalStats(renewalsResponse.data));
        }
      } else {
        toast.error('Failed to add renewal');
      }
    } catch (error) {
      console.error('Error adding renewal:', error);
      toast.error('An error occurred while adding the renewal');
    } finally {
      setIsAddFormOpen(false);
    }
  };

  // Handle editing an existing renewal
  const handleEditRenewal = async (renewalData: Partial<Renewal>) => {
    if (selectedRenewal) {
      try {
        // Ensure we have a valid ID for the update
        const id = renewalData.id || selectedRenewal.id;
        
        console.log('Updating renewal with ID:', id);
        console.log('Update data:', renewalData);
        
        const response = await renewalService.updateRenewal(id, renewalData);
        
        if (response.success) {
          toast.success('Renewal updated successfully');
          
          // Refresh renewals list
          const renewalsResponse = await renewalService.getUserRenewals();
          if (renewalsResponse.success && renewalsResponse.data) {
            setRenewals(renewalsResponse.data);
            setStats(renewalService.calculateRenewalStats(renewalsResponse.data));
          }
        } else {
          toast.error('Failed to update renewal');
        }
      } catch (error) {
        console.error('Error updating renewal:', error);
        toast.error('An error occurred while updating the renewal');
      } finally {
        setIsEditFormOpen(false);
        setSelectedRenewal(null);
      }
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
    if (selectedRenewal) {
      try {
        const response = await renewalService.deleteRenewal(selectedRenewal.id);
        
        if (response.success) {
          toast.success('Renewal deleted successfully');
          
          // Update locally by filtering out the deleted renewal
          const updatedRenewals = renewals.filter(r => r.id !== selectedRenewal.id);
          setRenewals(updatedRenewals);
          setStats(renewalService.calculateRenewalStats(updatedRenewals));
        } else {
          toast.error('Failed to delete renewal');
        }
      } catch (error) {
        console.error('Error deleting renewal:', error);
        toast.error('An error occurred while deleting the renewal');
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedRenewal(null);
      }
    }
  };
  
  // Calculate days remaining until expiration
  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return 0;
    
    try {
      const today = new Date();
      const expiryDate = new Date(endDate);
      
      // Check if date is valid
      if (isNaN(expiryDate.getTime())) {
        console.warn(`Invalid date format: ${endDate}`);
        return 0;
      }
      
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error(`Error calculating days remaining for date: ${endDate}`, error);
      return 0;
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'reminders':
        return (
          <div className="space-y-6">
            <ReminderLog 
              isLoading={isLoading}
              onFetchLogs={async (filters) => {
                // This would be implemented to fetch reminder logs with filters
                console.log("Fetching reminder logs with filters:", filters);
                // Actual API call would be implemented here
              }}
              onSettingsChange={async (settings) => {
                // This would be implemented to update notification settings
                console.log("Updating notification settings:", settings);
                toast.success("Notification settings updated");
                // Actual API call would be implemented here
              }}
            />
          </div>
        );
        
      case 'logs':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-[var(--radius)] p-6">
              <h3 className="text-lg font-medium mb-4">Your Renewal Activity</h3>
              <p className="text-muted-foreground mb-4">
                Track all activity related to your renewals.
              </p>
              
              <div className="grid md:grid-cols-1 gap-6">
                {!isLoading && renewals.length > 0 ? (
                  renewals.slice(0, 3).map(renewal => (
                    <div key={renewal.id} className="border border-border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{renewal.item_name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {renewal.vendor} • {renewal.category}
                      </p>
                      <RenewalLogs renewalId={renewal.id} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No renewals available to show logs</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'dashboard':
      default:
        return (
          <>
            {/* Dashboard Summary */}
            <DashboardSummary />
            
            {/* Stats cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatsCard
                title="Total Renewals"
                value={stats.total}
                icon={Calendar}
                description="Your tracked services"
              />
              <StatsCard
                title="Active Renewals"
                value={stats.active}
                icon={CheckCircle2}
                description="Currently active services"
              />
              <StatsCard
                title="Expiring Soon"
                value={stats.expiringSoon}
                icon={AlertTriangle}
                description="Services expiring this month"
              />
              <StatsCard
                title="Total Cost"
                value={`$${stats.totalCost}`}
                icon={DollarSign}
                description="Monthly renewal expenses"
              />
            </div>
            
            {/* Renewals table */}
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Your Renewals</h3>
                <Button onClick={() => setIsAddFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Renewal
                </Button>
              </div>
            
              {isLoading ? (
                <div className="text-center py-8">Loading your renewals...</div>
              ) : renewals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You don't have any renewals yet.</p>
                  <p className="mt-2">Click "Add New Renewal" to create your first one.</p>
                </div>
              ) : (
                <RenewalsTable 
                  renewals={renewals}
                  onRenewalClick={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Renewal Management System</h1>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm hidden md:block">
              Welcome, {currentUser?.name}
            </div>
            <div className="relative">
              <Button variant="ghost" size="sm" className="rounded-full p-2">
                <Settings size={20} />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> 
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Your Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your service renewals and subscriptions
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-border mb-6">
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm -mb-px",
              activeTab === 'dashboard'
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm -mb-px",
              activeTab === 'reminders'
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('reminders')}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Reminder Logs
          </button>
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm -mb-px",
              activeTab === 'logs'
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('logs')}
          >
            <History className="w-4 h-4 inline mr-2" />
            Renewal Logs
          </button>
        </div>
        
        {/* Tab content */}
        {renderContent()}
        
        {/* Add Renewal Form */}
        <RenewalForm 
          isOpen={isAddFormOpen} 
          onClose={() => setIsAddFormOpen(false)}
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
                <p className="text-sm text-muted-foreground">
                  Expires: {format(new Date(selectedRenewal.end_date), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* View Renewal Details Dialog */}
        {selectedRenewal && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Renewal Details</DialogTitle>
              </DialogHeader>
              
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
                      {formatDate(selectedRenewal.start_date)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                    <p className="font-semibold">
                      {formatDate(selectedRenewal.end_date)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Days Remaining</h3>
                  {isValidDate(selectedRenewal.end_date) ? (
                    <p className={cn(
                      "font-semibold flex items-center",
                      getDaysRemaining(selectedRenewal.end_date) <= 0 ? "text-red-500" :
                      getDaysRemaining(selectedRenewal.end_date) <= 30 ? "text-yellow-500" :
                      "text-green-500"
                    )}>
                      {getDaysRemaining(selectedRenewal.end_date) <= 0 ? (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Expired
                        </>
                      ) : (
                        `${getDaysRemaining(selectedRenewal.end_date)} days`
                      )}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Invalid date</p>
                  )}
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
        )}
      </main>
    </div>
  );
};

export default UserDashboard;