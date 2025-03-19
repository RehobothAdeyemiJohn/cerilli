
import React from 'react';
import QuotesPagination from './QuotesPagination';

interface QuotesPaginationAdapterProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
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
      handlePrevPage={onPrevPage}
      handleNextPage={onNextPage}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
    />
  );
};
