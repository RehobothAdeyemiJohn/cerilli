
import { Users } from 'lucide-react';
import DealerStockValueCard from './DealerStockValueCard';

export { Users };

export const DealerAnalysis = () => {
  return (
    <div className="grid gap-4">
      <DealerStockValueCard dealerName="CMC" />
    </div>
  );
};
