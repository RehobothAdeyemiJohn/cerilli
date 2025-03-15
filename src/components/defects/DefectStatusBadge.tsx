
import React from 'react';
import { Badge } from '@/components/ui/badge';

type DefectStatusProps = {
  status: 'Aperta' | 'Approvata' | 'Approvata Parzialmente' | 'Respinta';
};

const DefectStatusBadge = ({ status }: DefectStatusProps) => {
  const variants = {
    'Aperta': 'bg-blue-100 text-blue-800 border-blue-200',
    'Approvata': 'bg-green-100 text-green-800 border-green-200',
    'Approvata Parzialmente': 'bg-amber-100 text-amber-800 border-amber-200',
    'Respinta': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <Badge className={`${variants[status]} border px-2 py-1 text-xs font-medium`}>
      {status}
    </Badge>
  );
};

export default DefectStatusBadge;
