import React, { useState } from 'react';
import { Edit, Trash, Eye, Search, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import type { Renewal } from '../../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface RenewalsTableProps {
  renewals: Renewal[];
  onRenewalClick?: (renewal: Renewal) => void;
  onEdit?: (renewal: Renewal) => void;
  onDelete?: (id: string) => void;
}

// In the date formatting function:
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  
  try {
    // Handle both ISO strings and date-only strings
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // If invalid date, return as is
    }
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return dateString;
  }
};

const RenewalsTable: React.FC<RenewalsTableProps> = ({
  renewals,
  onRenewalClick,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('endDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter renewals by search term and status
  const filteredRenewals = renewals.filter((renewal) => {
    const matchesSearch = 
      renewal.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      renewal.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      renewal.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      renewal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort renewals
  const sortedRenewals = [...filteredRenewals].sort((a, b) => {
    if (sortBy === 'endDate') {
      const dateA = new Date(a.end_date).getTime();
      const dateB = new Date(b.end_date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'serviceName') {
      return sortDirection === 'asc'
        ? a.service_name.localeCompare(b.service_name)
        : b.service_name.localeCompare(a.service_name);
    } else if (sortBy === 'provider') {
      return sortDirection === 'asc'
        ? a.provider.localeCompare(b.provider)
        : b.provider.localeCompare(a.provider);
    } else if (sortBy === 'cost') {
      return sortDirection === 'asc'
        ? a.cost - b.cost
        : b.cost - a.cost;
    }
    return 0;
  });

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
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

  // Get status badge style - updated with our new color system
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success-foreground border border-success/30 shadow-sm shadow-success/10';
      case 'expiring-soon':
        return 'bg-warning/20 text-warning-foreground border border-warning/30 shadow-sm shadow-warning/10';
      case 'expired':
        return 'bg-destructive/20 text-destructive-foreground border border-destructive/30 shadow-sm shadow-destructive/10';
      case 'pending':
        return 'bg-info/20 text-info-foreground border border-info/30 shadow-sm shadow-info/10';
      case 'canceled':
        return 'bg-muted text-muted-foreground border border-muted/30';
      default:
        return 'bg-secondary/20 text-secondary-foreground border border-secondary/30 shadow-sm shadow-secondary/10';
    }
  };

  // Get sort indicator with proper icon
  const getSortIndicator = (column: string) => {
    if (sortBy === column) {
      return sortDirection === 'asc' 
        ? <ArrowUp className="inline ml-1 h-3 w-3" /> 
        : <ArrowDown className="inline ml-1 h-3 w-3" />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="search"
            placeholder="Search renewals..."
            className="pl-9 border-primary/20 rounded-[var(--radius)] focus-visible:ring-primary/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outlineSecondary" className="flex items-center shadow-sm hover-effect">
                <span>{statusFilter === 'all'
                  ? 'All Statuses'
                  : statusFilter.charAt(0).toUpperCase() +
                    statusFilter.slice(1).replace('-', ' ')}
                </span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-secondary/20 rounded-[var(--radius)]">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusFilterChange('all')}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilterChange('active')}
                className="text-success hover:bg-success/10">
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilterChange('expiring-soon')}
                className="text-warning hover:bg-warning/10">
                Expiring Soon
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilterChange('expired')}
                className="text-destructive hover:bg-destructive/10">
                Expired
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilterChange('pending')}
                className="text-info hover:bg-info/10">
                Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outlineInfo" className="flex items-center shadow-sm hover-effect">
                <span>Sort By</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-info/20 rounded-[var(--radius)]">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSort('endDate')} className="flex justify-between">
                <span>Expiration Date</span>
                {getSortIndicator('endDate')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('serviceName')} className="flex justify-between">
                <span>Service Name</span>
                {getSortIndicator('serviceName')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('provider')} className="flex justify-between">
                <span>Provider</span>
                {getSortIndicator('provider')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('cost')} className="flex justify-between">
                <span>Cost</span>
                {getSortIndicator('cost')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-[var(--radius)] overflow-hidden shadow-md bg-gradient-to-br from-card/80 to-card">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-primary/5">
            <tr>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleSort('serviceName')}
              >
                <div className="flex items-center">
                  <span>Service Name</span>
                  {getSortIndicator('serviceName')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleSort('provider')}
              >
                <div className="flex items-center">
                  <span>Provider</span>
                  {getSortIndicator('provider')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleSort('endDate')}
              >
                <div className="flex items-center">
                  <span>Expiry Date</span>
                  {getSortIndicator('endDate')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleSort('cost')}
              >
                <div className="flex items-center">
                  <span>Cost</span>
                  {getSortIndicator('cost')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-right text-xs font-medium text-primary uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card/50 backdrop-blur-sm divide-y divide-border">
            {sortedRenewals.length > 0 ? (
              sortedRenewals.map((renewal) => (
                <tr
                  key={renewal.id}
                  className="hover:bg-accent/5 transition-colors cursor-pointer group"
                  onClick={() => onRenewalClick && onRenewalClick(renewal)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium group-hover:text-primary transition-colors">{renewal.service_name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {renewal.service_type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renewal.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{formatDate(renewal.end_date)}</div>
                    <div className="text-xs text-muted-foreground">
                      {(() => {
                        const days = getDaysRemaining(renewal.end_date);
                        return days <= 0
                          ? <span className="text-destructive">Expired</span>
                          : <span>{days} days remaining</span>;
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        getStatusBadgeStyles(renewal.status)
                      )}
                    >
                      {renewal.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    ${renewal.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="info"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRenewalClick && onRenewalClick(renewal);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      
                      {onEdit && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(renewal);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                      
                      {onDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(renewal.id);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 whitespace-nowrap text-center text-muted-foreground"
                >
                  No renewals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RenewalsTable;