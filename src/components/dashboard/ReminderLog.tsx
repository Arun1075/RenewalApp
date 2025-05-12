import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Bell, 
  Mail, 
  MessageSquare, 
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface ReminderLogEntry {
  id: string;
  renewal_id: string;
  service_name: string;
  type: 'email' | 'sms' | 'in-app';
  sent_at: string;
  status: 'delivered' | 'failed' | 'pending';
  recipient: string;
  message: string;
}

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  days_before: number[];
}

interface ReminderLogProps {
  logs?: ReminderLogEntry[];
  settings?: NotificationSettings;
  isLoading?: boolean;
  onSettingsChange?: (settings: Partial<NotificationSettings>) => Promise<void>;
  onFetchLogs?: (filters: { 
    type?: string; 
    dateFrom?: string; 
    dateTo?: string; 
    status?: string;
  }) => Promise<void>;
}

const ReminderLog: React.FC<ReminderLogProps> = ({
  logs = [],
  settings = {
    email_enabled: true,
    sms_enabled: false,
    in_app_enabled: true,
    days_before: [1, 7, 30]
  },
  isLoading = false,
  onSettingsChange = async () => {},
  onFetchLogs = async () => {},
}) => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0] // today
  });
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingsUpdating, setIsSettingsUpdating] = useState(false);

  // Filter logs based on current filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const logDate = new Date(log.sent_at).toISOString().split('T')[0];
    const matchesDateRange = 
      logDate >= dateRange.from && 
      logDate <= dateRange.to;
    
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    return matchesSearch && matchesDateRange && matchesType && matchesStatus;
  });

  useEffect(() => {
    // Load logs based on initial filters
    handleFetchLogs();
  }, []);

  const handleFetchLogs = async () => {
    await onFetchLogs({
      type: typeFilter !== 'all' ? typeFilter : undefined,
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      status: statusFilter !== 'all' ? statusFilter : undefined
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingToggle = async (setting: keyof Omit<NotificationSettings, 'days_before'>) => {
    try {
      setIsSettingsUpdating(true);
      await onSettingsChange({
        [setting]: !settings[setting]
      });
    } catch (error) {
      console.error(`Error toggling ${setting} setting:`, error);
    } finally {
      setIsSettingsUpdating(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'in-app':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-success/20 text-success-foreground border-success/30';
      case 'failed':
        return 'bg-destructive/20 text-destructive-foreground border-destructive/30';
      case 'pending':
        return 'bg-warning/20 text-warning-foreground border-warning/30';
      default:
        return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-card border border-border rounded-[var(--radius)] p-6">
        <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive renewal reminders via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email_enabled}
                onCheckedChange={() => handleSettingToggle('email_enabled')}
                disabled={isSettingsUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive renewal reminders via SMS
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.sms_enabled}
                onCheckedChange={() => handleSettingToggle('sms_enabled')}
                disabled={isSettingsUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive renewal reminders within the app
                </p>
              </div>
              <Switch
                id="in-app-notifications"
                checked={settings.in_app_enabled}
                onCheckedChange={() => handleSettingToggle('in_app_enabled')}
                disabled={isSettingsUpdating}
              />
            </div>
          </div>
          
          <div className="border-t md:border-t-0 md:border-l border-border md:pl-6 pt-4 md:pt-0 flex-1">
            <p className="text-sm font-medium mb-3">Reminder Schedule</p>
            <div className="flex flex-wrap gap-2">
              {settings.days_before.map(days => (
                <div 
                  key={days}
                  className="px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary border border-primary/20"
                >
                  {days} {days === 1 ? 'day' : 'days'} before expiry
                </div>
              ))}
            </div>
            <Button variant="link" size="sm" className="mt-2 px-0">
              Customize schedule
            </Button>
          </div>
        </div>
      </div>
      
      {/* Reminder Logs */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Reminder Log History</h3>
        
        {/* Filters */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4 bg-muted/30 p-4 rounded-lg">
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60">
              <Search className="h-4 w-4" />
            </div>
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-9 border-primary/20 rounded-[var(--radius)] focus-visible:ring-primary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <Label htmlFor="date-from" className="w-16 text-sm">From:</Label>
              <Input
                id="date-from"
                name="from"
                type="date"
                className="w-auto"
                value={dateRange.from}
                onChange={handleDateChange}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Label htmlFor="date-to" className="w-16 text-sm">To:</Label>
              <Input
                id="date-to"
                name="to"
                type="date"
                className="w-auto"
                value={dateRange.to}
                onChange={handleDateChange}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter By Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('email')}>
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('sms')}>
                  SMS
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('in-app')}>
                  In-App
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter By Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('delivered')}>
                  Delivered
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('failed')}>
                  Failed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Pending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={handleFetchLogs} size="sm">
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Log Table */}
        <div className="border border-border rounded-[var(--radius)] overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Service
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Recipient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                    <p className="text-muted-foreground">Loading logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{format(new Date(log.sent_at), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(log.sent_at), 'h:mm a')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{log.service_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 rounded-full bg-primary/10 text-primary">
                          {getNotificationIcon(log.type)}
                        </span>
                        <span className="capitalize">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.recipient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={cn(
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border",
                          getStatusStyle(log.status)
                        )}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No notification logs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder - can be implemented as needed */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderLog;