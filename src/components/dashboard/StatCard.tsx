
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
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  loading = false,
  color = 'bg-blue-100 text-blue-600'
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
    <Card className="p-6 border border-gray-100 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className={`${bgColor || 'bg-blue-100'} p-2 rounded-full`}>
          <Icon className={`h-5 w-5 ${textColor || 'text-blue-600'}`} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20 mb-1" />
      ) : (
        <p className="text-3xl font-bold mb-1 animate-fade-in">{displayValue()}</p>
      )}
      <p className="text-sm text-gray-500">{description}</p>
    </Card>
  );
};

export default StatCard;
