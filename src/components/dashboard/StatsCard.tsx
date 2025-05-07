import React from 'react';
import { cn } from '../../lib/utils';

// Replace the LucideIcon import with a type definition that works with lucide-react components
import type { LucideProps } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<LucideProps>;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  variant = 'primary',
}) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'secondary':
        return {
          card: 'border-secondary/20 shadow-secondary/10 hover-effect',
          icon: 'bg-secondary text-secondary-foreground',
          value: 'text-secondary-foreground/90',
        };
      case 'accent':
        return {
          card: 'border-accent/20 shadow-accent/10 hover-effect',
          icon: 'bg-accent text-accent-foreground',
          value: 'text-accent-foreground/90',
        };
      case 'success':
        return {
          card: 'border-success/20 shadow-success/10 hover-effect',
          icon: 'bg-success text-success-foreground',
          value: 'text-success-foreground/90',
        };
      case 'warning':
        return {
          card: 'border-warning/20 shadow-warning/10 hover-effect',
          icon: 'bg-warning text-warning-foreground',
          value: 'text-warning-foreground/90',
        };
      case 'info':
        return {
          card: 'border-info/20 shadow-info/10 hover-effect',
          icon: 'bg-info text-info-foreground',
          value: 'text-info-foreground/90',
        };
      default: // primary
        return {
          card: 'border-primary/20 shadow-primary/10 hover-effect',
          icon: 'bg-primary text-primary-foreground',
          value: 'text-primary-foreground/90',
        };
    }
  };

  const variantClasses = getVariantClasses(variant);

  return (
    <div className={cn(
      "rounded-[var(--radius)] relative overflow-hidden",
      "bg-gradient-to-br from-card to-card/80 backdrop-blur-sm",
      "border shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      variantClasses.card,
      className
    )}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h3>
        <div className={cn(
          "p-3 rounded-[var(--radius)] shadow-sm", 
          variantClasses.icon
        )}>
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
      
      <div className="mt-3">
        <div className={cn("text-3xl font-bold", variantClasses.value)}>
          {value}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        
        {trend && (
          <div className="flex items-center mt-3 space-x-2">
            <span
              className={cn(
                "text-xs font-semibold px-2 py-1 rounded-full flex items-center",
                trend.isPositive 
                  ? "text-success-foreground bg-success/20 ring-1 ring-success/30" 
                  : "text-destructive-foreground bg-destructive/20 ring-1 ring-destructive/30"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;