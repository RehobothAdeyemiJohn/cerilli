
import React from 'react';
import { 
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Dealer } from '@/types';
import FilterItem from './FilterItem';

interface DealerFilterProps {
  dealers: Dealer[];
  selectedDealers: string[];
  onToggleDealer: (dealerName: string) => void;
}

const DealerFilter = ({ dealers, selectedDealers, onToggleDealer }: DealerFilterProps) => {
  return (
    <AccordionItem value="dealer">
      <AccordionTrigger>Dealer</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          {dealers
            .filter(dealer => dealer.isActive)
            .sort((a, b) => a.companyName.localeCompare(b.companyName))
            .map((dealer) => (
              <FilterItem
                key={dealer.id}
                id={dealer.id}
                name={dealer.companyName}
                isSelected={selectedDealers.includes(dealer.companyName)}
                onToggle={onToggleDealer}
              />
            ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default DealerFilter;
