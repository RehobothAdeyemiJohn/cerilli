
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { defectReportsApi } from '@/api/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DefectStatsProps {
  dateFrom?: Date;
  dateTo?: Date;
}

const DefectStats: React.FC<DefectStatsProps> = ({ dateFrom, dateTo }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['defectStats', dateFrom?.toISOString(), dateTo?.toISOString()],
    queryFn: () => defectReportsApi.getStats(dateFrom, dateTo),
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats?.openReports || 0}</div>
          <div className="text-muted-foreground">Segnalazioni Aperte</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats?.closedReports || 0}</div>
          <div className="text-muted-foreground">Segnalazioni Chiuse</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats?.approvedReports || 0}</div>
          <div className="text-muted-foreground">Segnalazioni Approvate</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalPaid || 0)}</div>
          <div className="text-muted-foreground">Valore Totale Approvato</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DefectStats;
