
import React from 'react';
import { ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  loading?: boolean;
}

export const StatCard = ({ title, value, description, icon: Icon, loading = false }: StatCardProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-2 animate-pulse">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default StatCard;
