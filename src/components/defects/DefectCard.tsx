
import React from 'react';
import { DefectReport } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import DefectStatusBadge from './DefectStatusBadge';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type DefectCardProps = {
  defect: DefectReport;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const DefectCard = ({ defect, onView, onEdit, onDelete }: DefectCardProps) => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const canEdit = isAdmin || defect.status === 'Aperta';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">Pratica #{defect.caseNumber}</h3>
            <p className="text-sm text-gray-500">{defect.dealerName}</p>
          </div>
          <DefectStatusBadge status={defect.status} />
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Motivo:</span>
            <span className="text-sm font-medium">{defect.reason}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Data ricevimento:</span>
            <span className="text-sm font-medium">
              {format(new Date(defect.vehicleReceiptDate), 'dd/MM/yyyy', { locale: it })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Costo riparazione:</span>
            <span className="text-sm font-medium">€{defect.repairCost.toLocaleString('it-IT')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Data apertura:</span>
            <span className="text-sm font-medium">
              {format(new Date(defect.createdAt), 'dd/MM/yyyy', { locale: it })}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between border-t">
        <Button variant="ghost" size="sm" onClick={() => onView(defect.id)}>
          <Eye className="h-4 w-4 mr-1" /> Visualizza
        </Button>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(defect.id)}>
              <Edit className="h-4 w-4 mr-1" /> Modifica
            </Button>
            {isAdmin && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(defect.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Elimina
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default DefectCard;
