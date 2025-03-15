import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { defectReportsApi } from '@/api/supabase';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import DefectCard from '@/components/defects/DefectCard';
import DefectFormDialog from '@/components/defects/DefectFormDialog';
import DefectDetailsDialog from '@/components/defects/DefectDetailsDialog';
import DefectDeleteDialog from '@/components/defects/DefectDeleteDialog';
import DefectFilters from '@/components/defects/DefectFilters';
import DefectStats from '@/components/defects/DefectStats';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Defects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isDealer = user?.type === 'dealer';
  const dealerId = user?.dealerId;

  const [selectedDefectId, setSelectedDefectId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
    dealerId?: string;
    search?: string;
  }>({});

  const {
    data: defectReports = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['defectReports', dealerId, filters],
    queryFn: async () => {
      console.log("Fetching defect reports with filters:", filters);
      try {
        // Check authentication first to fail early
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError || !authData.session) {
          console.error('Authentication error:', authError || 'No session found');
          toast({
            title: "Errore di autenticazione",
            description: "Effettua il login per continuare",
            variant: "destructive",
          });
          return [];
        }
        
        if (isDealer) {
          const reports = await defectReportsApi.getByDealerId(dealerId!);
          console.log("Fetched dealer reports:", reports);
          
          return reports.filter(report => {
            if (filters.status && report.status !== filters.status) {
              return false;
            }
            
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              const matchesNumber = report.caseNumber.toString().includes(filters.search);
              const matchesDescription = report.description.toLowerCase().includes(searchLower);
              if (!matchesNumber && !matchesDescription) {
                return false;
              }
            }
            
            return true;
          });
        } else {
          let reports = await defectReportsApi.getAll();
          console.log("Fetched all reports:", reports);
          
          return reports.filter(report => {
            if (filters.status && report.status !== filters.status) {
              return false;
            }
            
            if (filters.dealerId && report.dealerId !== filters.dealerId) {
              return false;
            }
            
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              const matchesNumber = report.caseNumber.toString().includes(filters.search);
              const matchesDescription = report.description.toLowerCase().includes(searchLower);
              const matchesDealer = report.dealerName.toLowerCase().includes(searchLower);
              if (!matchesNumber && !matchesDescription && !matchesDealer) {
                return false;
              }
            }
            
            return true;
          });
        }
      } catch (err) {
        console.error("Error fetching defect reports:", err);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il caricamento delle segnalazioni: " + (err as Error).message,
          variant: "destructive",
        });
        return [];
      }
    },
    refetchOnWindowFocus: false
  });

  const handleFilterChange = (newFilters: {
    status?: string;
    dealerId?: string;
    search?: string;
  }) => {
    setFilters(newFilters);
  };

  const handleCreateNew = () => {
    setSelectedDefectId(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedDefectId(id);
    setFormDialogOpen(true);
  };

  const handleView = (id: string) => {
    setSelectedDefectId(id);
    setDetailsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedDefectId(id);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = useCallback(() => {
    console.log("Defect operation successful, refetching data...");
    refetch();
    toast({
      title: "Operazione completata",
      description: "I dati sono stati aggiornati con successo.",
    });
  }, [refetch, toast]);

  const selectedDefect = selectedDefectId
    ? defectReports.find(d => d.id === selectedDefectId)
    : undefined;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Segnalazioni Difformità</h1>
        <Button onClick={handleCreateNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuova Segnalazione
        </Button>
      </div>

      <DefectStats />

      <div className="mb-6">
        <DefectFilters onFilterChange={handleFilterChange} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center text-red-500">
          Si è verificato un errore durante il caricamento delle segnalazioni.
        </Card>
      ) : defectReports.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          Nessuna segnalazione di difformità trovata.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {defectReports.map((defect) => (
            <DefectCard
              key={defect.id}
              defect={defect}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {formDialogOpen && (
        <DefectFormDialog
          isOpen={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          defectId={selectedDefectId || undefined}
          onSuccess={handleSuccess}
        />
      )}

      {detailsDialogOpen && selectedDefectId && (
        <DefectDetailsDialog
          isOpen={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          defectId={selectedDefectId}
        />
      )}

      {deleteDialogOpen && selectedDefectId && (
        <DefectDeleteDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          defectId={selectedDefectId}
          caseNumber={selectedDefect?.caseNumber}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Defects;
