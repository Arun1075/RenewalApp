import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Calendar, Loader2 } from 'lucide-react';
import renewalService from '../../services/renewalService';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface ReminderLogsProps {
  className?: string;
  limit?: number;
  showHeader?: boolean;
}

const ReminderLogs: React.FC<ReminderLogsProps> = ({
  className,
  limit,
  showHeader = true
}) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReminderLogs = async () => {
      setIsLoading(true);
      try {
        const response = await renewalService.getReminderLogs();
        if (response.success) {
          setLogs(response.data);
        } else {
          setError(response.message || 'Failed to fetch reminder logs');
        }
      } catch (err) {
        console.error('Error fetching reminder logs:', err);
        setError('An unexpected error occurred while fetching reminder logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminderLogs();
  }, []);

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

  // Display limited logs if limit is provided
  const displayLogs = limit ? logs.slice(0, limit) : logs;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {showHeader && (
        <CardHeader className="bg-card border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>Reminder Logs</CardTitle>
            {limit && logs.length > limit && (
              <Button variant="ghost" size="sm" className="hover-effect">
                View All
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={showHeader ? "p-0" : "px-0 pb-0 pt-4"}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading reminder logs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 px-6">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : displayLogs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground">No reminder logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {displayLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{log.item_name || log.service_name}</div>
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
                      <div className="font-medium">{format(new Date(log.sent_at), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(log.sent_at), 'h:mm a')}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReminderLogs;