import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  UserCircle,
  Edit,
  Trash,
  Clock,
  Check,
  X,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface RenewalLogEntry {
  id: string;
  renewal_id: string;
  service_name?: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'renewed';
  performed_by: string;
  user_email?: string;
  timestamp: string;
  changes?: {
    field: string;
    old_value?: string | number;
    new_value?: string | number;
  }[];
  notes?: string;
}

interface RenewalHistoryProps {
  logs?: RenewalLogEntry[];
  renewalId?: string;
  isLoading?: boolean;
  onFetchLogs?: (filters: { 
    renewalId?: string;
    dateFrom?: string;
    dateTo?: string;
    action?: string;
  }) => Promise<void>;
}

const RenewalHistory: React.FC<RenewalHistoryProps> = ({
  logs = [],
  renewalId,
  isLoading = false,
  onFetchLogs = async () => {}
}) => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
    to: new Date().toISOString().split('T')[0] // today
  });
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter logs based on current filters
  const filteredLogs = logs.filter(log => {
    const matchesRenewalId = !renewalId || log.renewal_id === renewalId;
    
    const matchesSearch = 
      (log.service_name && log.service_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    const matchesDateRange = 
      logDate >= dateRange.from && 
      logDate <= dateRange.to;
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesRenewalId && (searchTerm === '' || matchesSearch) && matchesDateRange && matchesAction;
  });

  useEffect(() => {
    // Load logs based on initial filters
    handleFetchLogs();
  }, [renewalId]);

  const handleFetchLogs = async () => {
    await onFetchLogs({
      renewalId,
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      action: actionFilter !== 'all' ? actionFilter : undefined
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <PlusCircle className="h-4 w-4" />;
      case 'updated':
        return <Edit className="h-4 w-4" />;
      case 'deleted':
        return <Trash className="h-4 w-4" />;
      case 'status_changed':
        return <RefreshCw className="h-4 w-4" />;
      case 'renewed':
        return <Check className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-success/20 text-success border-success/30';
      case 'updated':
        return 'bg-info/20 text-info border-info/30';
      case 'deleted':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'status_changed':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'renewed':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-secondary/20 text-secondary border-secondary/30';
    }
  };
  
  const formatActionLabel = (action: string) => {
    return action
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatChanges = (changes: { field: string; old_value?: string | number; new_value?: string | number }[]) => {
    if (!changes || changes.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-1 text-sm">
        {changes.map((change, idx) => {
          // Format dates if they appear to be ISO strings
          const oldValue = typeof change.old_value === 'string' && 
            change.old_value.match(/^\d{4}-\d{2}-\d{2}/) ? 
            format(new Date(change.old_value), 'MMM d, yyyy') : 
            change.old_value;
            
          const newValue = typeof change.new_value === 'string' && 
            change.new_value.match(/^\d{4}-\d{2}-\d{2}/) ? 
            format(new Date(change.new_value), 'MMM d, yyyy') : 
            change.new_value;

          return (
            <div key={idx} className="flex items-start">
              <span className="font-medium capitalize mr-1">{change.field.replace('_', ' ')}:</span>
              <div>
                {change.old_value !== undefined && (
                  <div className="flex items-center">
                    <X className="h-3 w-3 text-destructive mr-1" />
                    <span className="line-through text-destructive/80">{oldValue}</span>
                  </div>
                )}
                {change.new_value !== undefined && (
                  <div className="flex items-center">
                    <Check className="h-3 w-3 text-success mr-1" />
                    <span className="text-success/80">{newValue}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="search"
            placeholder="Search history..."
            className="pl-9 border-primary/20 rounded-[var(--radius)] focus-visible:ring-primary/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
          
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <Input
              name="from"
              type="date"
              className="w-auto"
              value={dateRange.from}
              onChange={handleDateChange}
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              name="to"
              type="date"
              className="w-auto"
              value={dateRange.to}
              onChange={handleDateChange}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {actionFilter === 'all' ? 'All Actions' : formatActionLabel(actionFilter)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter By Action</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActionFilter('all')}>
                All Actions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActionFilter('created')}>
                Created
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActionFilter('updated')}>
                Updated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActionFilter('deleted')}>
                Deleted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActionFilter('status_changed')}>
                Status Changed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActionFilter('renewed')}>
                Renewed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handleFetchLogs} size="sm">
            Apply Filters
          </Button>
        </div>
      </div>
        
      {/* Timeline view */}
      <div className="relative border-l-2 border-primary/20 pl-6 space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-10 h-40">
            <div className="flex flex-col items-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          </div>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map(log => (
            <div key={log.id} className="relative">
              {/* Timeline dot */}
              <div 
                className={cn(
                  "absolute -left-[30px] p-1.5 rounded-full border-2 border-[4px]",
                  getActionStyle(log.action).replace('text-', 'border-')
                )}
              ></div>
              
              {/* Content card */}
              <div className={cn(
                "rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow",
                "bg-card/50 backdrop-blur-sm"
              )}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    <div className={cn(
                      "p-2 rounded-full",
                      getActionStyle(log.action)
                    )}>
                      {getActionIcon(log.action)}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {formatActionLabel(log.action)}
                        {log.service_name && !renewalId && (
                          <span className="ml-1 text-muted-foreground">
                            - {log.service_name}
                          </span>
                        )}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        <time dateTime={log.timestamp}>
                          {format(new Date(log.timestamp), 'MMMM d, yyyy - h:mm a')}
                        </time>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UserCircle className="h-4 w-4 mr-1" />
                    <span>{log.performed_by || 'System'}</span>
                    {log.user_email && (
                      <span className="ml-1 text-xs">({log.user_email})</span>
                    )}
                  </div>
                </div>

                {/* Change details */}
                {log.changes && formatChanges(log.changes)}
                
                {/* Notes */}
                {log.notes && (
                  <div className="mt-3 text-sm bg-muted/30 p-3 rounded-lg border border-border">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Notes:</p>
                    <p>{log.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground opacity-40 mb-2" />
            <p className="text-muted-foreground">No history records found</p>
            <Button variant="link" onClick={handleFetchLogs} className="mt-2">
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RenewalHistory;