
import { Users } from 'lucide-react';
import DealerStockValueCard from './DealerStockValueCard';
import DealerStockCountCard from './DealerStockCountCard';
import AverageStockDaysCard from './AverageStockDaysCard';

export { Users };

export const DealerAnalysis = () => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <DealerStockValueCard dealerName="CMC" />
      <DealerStockCountCard dealerName="CMC" />
      <AverageStockDaysCard dealerName="CMC" />
    </div>
  );
};
