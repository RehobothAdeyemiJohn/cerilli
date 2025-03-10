
import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Stat } from '@/types';

interface StatCardProps {
  stat: Stat;
}

const StatCard = ({ stat }: StatCardProps) => {
  const getChangeIcon = () => {
    if (!stat.changeType) return null;
    
    switch (stat.changeType) {
      case 'increase':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };
  
  const getChangeTextColor = () => {
    if (!stat.changeType) return 'text-gray-500';
    
    switch (stat.changeType) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      case 'neutral':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
      <p className="text-2xl font-bold mt-2">{stat.value}</p>
      
      {stat.change !== undefined && (
        <div className="flex items-center mt-2">
          {getChangeIcon()}
          <span className={`text-sm font-medium ml-1 ${getChangeTextColor()}`}>
            {stat.change}% {stat.changeType === 'increase' ? 'from last month' : 'from last month'}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
