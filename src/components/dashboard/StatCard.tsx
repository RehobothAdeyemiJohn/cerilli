
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  loading = false,
  color = 'bg-green-100 text-green-600',
  trend
}: StatCardProps) => {
  // Ensure value is a primitive type that can be rendered
  const displayValue = () => {
    if (loading) return '-';
    if (typeof value === 'object') return '0';
    return value;
  };

  // Extract color classes
  const [bgColor, textColor] = color.split(' ');

  return (
    <Card className="p-6 border border-gray-100 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md rounded-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <div className={`${bgColor || 'bg-green-100'} p-2 rounded-full`}>
          <Icon className={`h-5 w-5 ${textColor || 'text-green-600'}`} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20 mb-1" />
      ) : (
        <p className="text-3xl font-bold mb-1 animate-fade-in">{displayValue()}</p>
      )}
      <p className="text-sm text-gray-500">{description}</p>
      {trend && (
        <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-1">
            {trend.isPositive ? '↑' : '↓'}
          </span>
          <span>{trend.value}% {trend.isPositive ? 'aumento' : 'diminuzione'}</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
