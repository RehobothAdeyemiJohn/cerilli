
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

const StatCard = ({ title, value, description, icon: Icon, loading = false }: StatCardProps) => {
  // Ensure value is a primitive type that can be rendered
  const displayValue = () => {
    if (loading) return '-';
    if (typeof value === 'object') return '0';
    return value;
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="bg-blue-100 p-2 rounded-full">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20 mb-1" />
      ) : (
        <p className="text-3xl font-bold mb-1">{displayValue()}</p>
      )}
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default StatCard;
