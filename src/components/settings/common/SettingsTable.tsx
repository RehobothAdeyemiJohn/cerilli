import React from 'react';
import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SettingsTableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface SettingsTableProps<T extends { id: string }> {
  data: T[];
  columns: SettingsTableColumn<T>[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
}

function SettingsTable<T extends { id: string }>({ 
  data, 
  columns, 
  onEdit, 
  onDelete 
}: SettingsTableProps<T>) {
  const getCellValue = (item: T, accessor: keyof T | ((item: T) => React.ReactNode)): React.ReactNode => {
    if (typeof accessor === 'function') {
      return accessor(item);
    }
    const value = item[accessor];
    return value != null ? String(value) : '';
  };

  return (
    <div className="rounded-md border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Azioni
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((column, index) => (
                <td key={index} className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}>
                  {getCellValue(item, column.accessor)}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SettingsTable;
