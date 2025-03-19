
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';

interface DataTableViewOptionsProps {
  table: {
    getColumnVisibility: () => Record<string, boolean>;
    setColumnVisibility: (updater: Record<string, boolean>) => void;
  };
}

export function DataTableViewOptions({ table }: DataTableViewOptionsProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-1 items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
              <Settings2 className="mr-2 h-4 w-4" />
              <span>Visualizza</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(table.getColumnVisibility()).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => {
                  table.setColumnVisibility({
                    ...table.getColumnVisibility(),
                    [key]: !value,
                  });
                }}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
