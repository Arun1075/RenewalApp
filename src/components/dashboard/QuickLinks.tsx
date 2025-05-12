import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { formatDate } from '../../utils/dateUtils';

// Type for QuickLink item
interface QuickLinkItem {
  id: string;
  item_name: string;
  end_date: string;
  status: 'upcoming' | 'overdue';
  category: string;
}

interface QuickLinksResponse {
  data: QuickLinkItem[];
  success: boolean;
  message?: string;
}

const QuickLinks: React.FC = () => {
  const [quickLinks, setQuickLinks] = useState<QuickLinkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuickLinks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/dashboard/quick-links');
        const result = response.data as QuickLinksResponse;
        
        if (result.success) {
          setQuickLinks(result.data);
        } else {
          setError(result.message || 'Failed to fetch quick links');
        }
      } catch (err) {
        console.error('Error fetching quick links:', err);
        setError('An error occurred while fetching quick links');
      } finally {
        setLoading(false);
      }
    };

    fetchQuickLinks();
  }, []);

  // Group quick links by status (upcoming and overdue)
  const upcoming = quickLinks.filter(item => item.status === 'upcoming');
  const overdue = quickLinks.filter(item => item.status === 'overdue');

  if (loading) {
    return (
      <Card className="p-4 w-full">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 w-full">
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (quickLinks.length === 0) {
    return (
      <Card className="p-4 w-full">
        <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
        <p className="text-gray-500">No upcoming or overdue items found.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 w-full">
      <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
      
      {/* Overdue Items */}
      {overdue.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-medium text-red-600 mb-2">Overdue Items</h3>
          <div className="space-y-2">
            {overdue.map((item) => (
              <div key={item.id} className="border-l-4 border-red-500 pl-3 py-2 bg-red-50 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-gray-600">
                      End Date: <span className="text-red-600 font-medium">{formatDate(item.end_date)}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/admin/renewals/${item.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Link to={`/admin/renewals/edit/${item.id}`}>
                      <Button variant="default" size="sm">Edit</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upcoming Items */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-yellow-600 mb-2">Upcoming Items</h3>
          <div className="space-y-2">
            {upcoming.map((item) => (
              <div key={item.id} className="border-l-4 border-yellow-400 pl-3 py-2 bg-yellow-50 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-gray-600">
                      End Date: <span className="text-yellow-600 font-medium">{formatDate(item.end_date)}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/admin/renewals/${item.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Link to={`/admin/renewals/edit/${item.id}`}>
                      <Button variant="default" size="sm">Edit</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuickLinks;