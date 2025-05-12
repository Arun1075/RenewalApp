import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  ClockIcon, 
  DollarSign, 
  Plus, 
  UserPlus, 
  AlertTriangle,
  Bell,
  History,
  LayoutDashboard
} from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import RenewalsTable from '../../components/dashboard/RenewalsTable';
import DashboardSummary from '../../components/dashboard/DashboardSummary';
import { Button } from '../../components/ui/button';
import RenewalForm from '../../components/dashboard/RenewalForm';
import ReminderLog from '../../components/dashboard/ReminderLog';
import RenewalLogs from '../../components/dashboard/RenewalLogs';
import renewalService from '../../services/renewalService';
import { authService } from '../../services/api';
import { defaultRenewalStats } from '../../types/runtime';
import type { User, Renewal, RenewalStats, ApiResponse } from '../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import QuickLinks from '../../components/dashboard/QuickLinks';
import { cn } from '../../lib/utils';

const AdminDashboard: React.FC = () => {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [stats, setStats] = useState<RenewalStats>(defaultRenewalStats);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('Add New Renewal');
  const [editingRenewal, setEditingRenewal] = useState<Renewal | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reminders' | 'logs'>('dashboard');
  
  useAuth();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const renewalsResponse = await renewalService.getRenewals();
        if (renewalsResponse.success && renewalsResponse.data) {
          setRenewals(renewalsResponse.data);
          try {
            const statsResponse = await renewalService.getRenewalStats();
            if (statsResponse.success && statsResponse.data) {
              setStats(statsResponse.data);
            } else {
              setStats(renewalService.calculateRenewalStats(renewalsResponse.data));
            }
          } catch (error) {
            console.error('Failed to fetch stats, calculating locally:', error);
            setStats(renewalService.calculateRenewalStats(renewalsResponse.data));
          }
        }
        const usersResponse = await authService.getUsers();
        if (usersResponse?.users) {
          setUsers(usersResponse.users);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleRenewalClick = (renewal: Renewal) => {
    setSelectedRenewal(renewal);
    setIsViewDialogOpen(true);
  };
  
  const handleAddRenewal = () => {
    setFormTitle('Add New Renewal');
    setEditingRenewal(undefined);
    setIsFormOpen(true);
  };
  
  const handleEditRenewal = (renewal: Renewal) => {
    setFormTitle('Edit Renewal');
    setEditingRenewal(renewal);
    setIsFormOpen(true);
  };
  
  const handleDeleteRenewal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this renewal?')) {
      try {
        const response = await renewalService.deleteRenewal(id);
        if (response.success) {
          toast.success('Renewal deleted successfully');
          setRenewals(prevRenewals => prevRenewals.filter(r => r.id !== id));
          setStats(renewalService.calculateRenewalStats(renewals.filter(r => r.id !== id)));
        } else {
          toast.error('Failed to delete renewal');
        }
      } catch (error) {
        console.error('Error deleting renewal:', error);
        toast.error('An error occurred while deleting the renewal');
      }
    }
  };
  
  const handleFormSubmit = async (formData: Partial<Renewal>) => {
    try {
      let response: ApiResponse<Renewal>;
      
      if (editingRenewal) {
        response = await renewalService.updateRenewal(editingRenewal.id, formData);
        if (response.success) {
          toast.success('Renewal updated successfully');
          setRenewals(prevRenewals => 
            prevRenewals.map(r => r.id === editingRenewal.id ? response.data : r)
          );
        }
      } else {
        response = await renewalService.createRenewal(formData as Omit<Renewal, 'id'>);
        if (response.success) {
          toast.success('Renewal added successfully');
          setRenewals(prevRenewals => [...prevRenewals, response.data]);
        }
      }
      
      setIsFormOpen(false);
      const updatedStats = renewalService.calculateRenewalStats(
        editingRenewal 
          ? renewals.map(r => r.id === editingRenewal.id ? response.data : r)
          : [...renewals, response.data]
      );
      setStats(updatedStats);
      
    } catch (error) {
      console.error('Error saving renewal:', error);
      toast.error('Failed to save renewal');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'reminders':
        return (
          <div className="space-y-6">
            <ReminderLog 
              isLoading={isLoading}
              onFetchLogs={async (filters) => {
                console.log("Fetching reminder logs with filters:", filters);
              }}
              onSettingsChange={async (settings) => {
                console.log("Updating notification settings:", settings);
                toast.success("Notification settings updated");
              }}
            />
          </div>
        );
        
      case 'logs':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-[var(--radius)] p-6">
              <h3 className="text-lg font-medium mb-4">System Logs</h3>
              <p className="text-muted-foreground mb-4">
                View all renewal activity across the system.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {!isLoading && renewals.length > 0 ? (
                  renewals.slice(0, 2).map(renewal => (
                    <div key={renewal.id} className="border border-border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{renewal.item_name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {renewal.vendor} • {renewal.category}
                      </p>
                      <RenewalLogs renewalId={renewal.id} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
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
            <DashboardSummary />

            <QuickLinks />

            <div className="colorful-grid">
              <StatsCard
                title="Total Renewals"
                value={stats.total}
                icon={Calendar}
                description="All tracked services"
                variant="primary"
              />
              <StatsCard
                title="Active Renewals"
                value={stats.active}
                icon={CheckCircle2}
                description="Currently active services"
                variant="success"
              />
              <StatsCard
                title="Expiring Soon"
                value={stats.expiringSoon}
                icon={AlertTriangle}
                description="Services expiring this month"
                variant="warning"
              />
              <StatsCard
                title="Total Cost"
                value={`$${stats.totalCost.toFixed(2)}`}
                icon={DollarSign}
                description="Monthly renewal expenses"
                variant="accent"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-6">
              <div className="md:col-span-6 lg:col-span-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-primary">Renewals Overview</h2>
                  <Button variant="outline" size="sm" className="hover-effect">
                    View All
                  </Button>
                </div>
                
                <div className="gradient-card rounded-[var(--radius)]">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                      <p>Loading renewals...</p>
                    </div>
                  ) : (
                    <RenewalsTable 
                      renewals={renewals} 
                      onRenewalClick={handleRenewalClick}
                      onEdit={handleEditRenewal}
                      onDelete={handleDeleteRenewal}
                    />
                  )}
                </div>
              </div>
              
              <div className="md:col-span-6 lg:col-span-2 space-y-6">
                <div className="gradient-card rounded-[var(--radius)] p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-semibold text-lg">Recent Users</h3>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-5">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                        <p>Loading users...</p>
                      </div>
                    ) : (
                      users.slice(0, 4).map(user => (
                        <div key={user.id} className="flex items-center justify-between group hover:bg-primary/5 p-2 rounded-lg transition-colors">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center mr-3 shadow-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                            {user.role}
                          </span>
                        </div>
                      ))
                    )}
                    
                    {!isLoading && users.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p>No users found</p>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-5 hover-effect">
                    <UserPlus className="mr-2 h-4 w-4" /> Add User
                  </Button>
                </div>
                
                <div className="gradient-card rounded-[var(--radius)] p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning to-destructive"></div>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-semibold text-lg">Upcoming Renewals</h3>
                    <Button variant="ghost" size="sm" className="text-warning hover:text-warning/80">
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-5">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-warning mb-2"></div>
                        <p>Loading upcoming renewals...</p>
                      </div>
                    ) : (
                      renewals
                        .filter(renewal => renewal.status === 'expiring-soon')
                        .slice(0, 3)
                        .map(renewal => (
                          <div key={renewal.id} className="flex items-center justify-between group hover:bg-warning/5 p-2 rounded-lg transition-colors">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warning to-warning/70 text-warning-foreground flex items-center justify-center mr-3 shadow-sm">
                                <ClockIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium group-hover:text-warning transition-colors">{renewal.item_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Due: {format(new Date(renewal.end_date), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-warning">
                              ${renewal.cost.toFixed(2)}
                            </span>
                          </div>
                        ))
                    )}
                    
                    {!isLoading && renewals.filter(r => r.status === 'expiring-soon').length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p>No upcoming renewals</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your service renewals and subscriptions</p>
          </div>
          <Button onClick={handleAddRenewal} className="hover-effect">
            <Plus className="mr-2 h-4 w-4" /> Add Renewal
          </Button>
        </div>

        <div className="flex border-b border-border">
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

        {renderContent()}
      
        <RenewalForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          renewal={editingRenewal}
          title={formTitle}
        />
        
        {selectedRenewal && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="colorful-popup sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle className="text-xl text-primary">{selectedRenewal.item_name}</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-5 py-4">
                <div className="bg-primary/5 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-primary mb-1">Category</h4>
                  <p className="capitalize">{selectedRenewal.category}</p>
                </div>
                <div className="bg-secondary/5 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-secondary mb-1">Vendor</h4>
                  <p>{selectedRenewal.vendor}</p>
                </div>
                <div className="bg-accent/5 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-accent mb-1">Start Date</h4>
                  <p>{formatDate(selectedRenewal.start_date)}</p>
                </div>
                <div className="bg-info/5 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-info mb-1">End Date</h4>
                  <p>{formatDate(selectedRenewal.end_date)}</p>
                </div>
                <div className="bg-success/5 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-success mb-1">Cost</h4>
                  <p>${selectedRenewal.cost.toFixed(2)}</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  selectedRenewal.status === 'active' ? 'bg-success/5' :
                  selectedRenewal.status === 'expiring-soon' ? 'bg-warning/5' :
                  selectedRenewal.status === 'expired' ? 'bg-destructive/5' : 'bg-muted/5'
                }`}>
                  <h4 className={`text-sm font-medium mb-1 ${
                    selectedRenewal.status === 'active' ? 'text-success' :
                    selectedRenewal.status === 'expiring-soon' ? 'text-warning' :
                    selectedRenewal.status === 'expired' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>Status</h4>
                  <p className="capitalize">{selectedRenewal.status?.replace('-', ' ')}</p>
                </div>
                <div className="col-span-2 bg-muted/10 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                  <p className="text-sm">{selectedRenewal.notes || 'No notes provided'}</p>
                </div>
                <div className="col-span-2 bg-muted/10 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Reminder Setting</h4>
                  <p className="text-sm">{selectedRenewal.reminder_days_before} days before expiration</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                  <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                  className="hover-effect"
                  >
                  Close
                  </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditRenewal(selectedRenewal);
                  }}
                  className="hover-effect"
                >
                  Edit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;