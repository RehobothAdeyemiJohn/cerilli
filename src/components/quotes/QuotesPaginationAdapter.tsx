
import React, { Dispatch, SetStateAction } from 'react';
import QuotesPagination from './QuotesPagination';

interface QuotesPaginationAdapterProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  itemsPerPage: number;
  setItemsPerPage: Dispatch<SetStateAction<number>>;
}

export const QuotesPaginationAdapter: React.FC<QuotesPaginationAdapterProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  itemsPerPage,
  setItemsPerPage
}) => {
  return (
    <QuotesPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPrevious={onPrevPage}
      onNext={onNextPage}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
    />
  );
};
