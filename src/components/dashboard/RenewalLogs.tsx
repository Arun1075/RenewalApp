import React, { useState, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { 
  Search, 
  RefreshCw, 
  UserCircle, 
  Clock, 
  Check, 
  PlusCircle, 
  Edit, 
  Trash, 
  AlertTriangle 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import type { RenewalLog } from '../../types';
import renewalService from '../../services/renewalService';
import { cn } from '../../lib/utils';

interface RenewalLogsProps {
  renewalId: string;
  className?: string;
}

const RenewalLogs: React.FC<RenewalLogsProps> = ({ renewalId, className }) => {
  const [logs, setLogs] = useState<RenewalLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (renewalId) {
      fetchLogs();
    }
  }, [renewalId]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await renewalService.getRenewalLogs(renewalId);
      if (response.success) {
        setLogs(response.data);
      } else {
        setError('Failed to fetch logs');
      }
    } catch (err) {
      console.error('Error fetching renewal logs:', err);
      setError('An error occurred while fetching logs');
    } finally {
      setIsLoading(false);
    }
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
        return 'bg-success/20 text-success';
      case 'updated':
        return 'bg-info/20 text-info';
      case 'deleted':
        return 'bg-destructive/20 text-destructive';
      case 'status_changed':
        return 'bg-warning/20 text-warning';
      case 'renewed':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-secondary/20 text-secondary';
    }
  };

  const formatActionLabel = (action: string) => {
    return action
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return 'Unknown date';
    
    const date = parseISO(timestamp);
    if (!isValid(date)) return 'Invalid date';
    
    return format(date, 'MMMM d, yyyy - h:mm a');
  };

  // Filter logs based on search term
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    
    return (
      (log.performed_by && log.performed_by.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Renewal Logs</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchLogs} 
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="relative">
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

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="flex flex-col items-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
            <p className="text-muted-foreground">Loading logs...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <AlertTriangle className="h-4 w-4 inline mr-2" />
          {error}
          <Button 
            variant="link" 
            className="ml-2 text-destructive p-0 h-auto" 
            onClick={fetchLogs}
          >
            Retry
          </Button>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex space-x-3 items-start">
                  <div className={cn(
                    "p-2 rounded-full flex items-center justify-center",
                    getActionStyle(log.action)
                  )}>
                    {getActionIcon(log.action)}
                  </div>
                  <div>
                    <h4 className="font-medium">{formatActionLabel(log.action)}</h4>
                    <time className="text-sm text-muted-foreground" dateTime={log.timestamp}>
                      {formatTimestamp(log.timestamp)}
                    </time>
                    {log.notes && (
                      <p className="mt-2 text-sm border-l-2 border-muted pl-2 italic">
                        {log.notes}
                      </p>
                    )}
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
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-md">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground opacity-40 mb-2" />
          <p className="text-muted-foreground">No logs found for this renewal</p>
        </div>
      )}
    </div>
  );
};

export default RenewalLogs;