
import React from 'react';
import { Loader2 } from 'lucide-react';

const VirtualReservationLoading = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default VirtualReservationLoading;
