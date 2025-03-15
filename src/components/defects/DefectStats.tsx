
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { defectReportsApi } from '@/api/supabase';
import { Loader2 } from 'lucide-react';

const DefectStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['defectStats'],
    queryFn: defectReportsApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Pratiche Aperte</p>
            <p className="text-2xl font-bold">{stats?.openReports || 0}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Pratiche Chiuse</p>
            <p className="text-2xl font-bold">{stats?.closedReports || 0}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Pratiche Approvate</p>
            <p className="text-2xl font-bold">{stats?.approvedReports || 0}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valore Pagato</p>
            <p className="text-2xl font-bold">€{(stats?.totalPaid || 0).toLocaleString('it-IT')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DefectStats;
