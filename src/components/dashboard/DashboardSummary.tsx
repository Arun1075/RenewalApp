import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';
import api from '../../services/api';
import StatsCard from './StatsCard';

interface DashboardSummaryData {
  upcoming_7_days: number;
  upcoming_30_days: number;
  overdue: number;
  recently_renewed: number;
}

const DashboardSummary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<DashboardSummaryData>({
    upcoming_7_days: 0,
    upcoming_30_days: 0,
    overdue: 0,
    recently_renewed: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get('/dashboard/summary');
        
        if (response.status === 200 && response.data) {
          // Handle different API response formats
          const data = response.data.data || response.data;
          setSummaryData(data);
        } else {
          setError('Failed to load dashboard summary data');
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
        setError('An error occurred while loading the dashboard summary');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-8 bg-muted rounded mb-2 w-1/2"></div>
            <div className="h-7 bg-muted rounded w-1/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatsCard
        title="Due in 7 Days"
        value={summaryData.upcoming_7_days}
        icon={Clock}
        description="Renewals due this week"
        variant="warning"
      />
      <StatsCard
        title="Due in 30 Days"
        value={summaryData.upcoming_30_days}
        icon={Calendar}
        description="Renewals due this month"
        variant="primary"
      />
      <StatsCard
        title="Overdue"
        value={summaryData.overdue}
        icon={AlertTriangle}
        description="Expired renewals"
        variant="destructive"
      />
      <StatsCard
        title="Recently Renewed"
        value={summaryData.recently_renewed}
        icon={CheckCircle}
        description="Renewed in the last 30 days"
        variant="success"
      />
    </div>
  );
};

export default DashboardSummary;