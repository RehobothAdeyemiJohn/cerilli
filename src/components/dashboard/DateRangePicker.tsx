
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date | undefined; to: Date | undefined }>>;
  darkMode?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, setDateRange, darkMode = false }) => {
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const { from, to } = dateRange;
    
    if (!from) {
      setDateRange({ from: date, to: undefined });
    } else if (from && !to && date > from) {
      setDateRange({ from, to: date });
    } else {
      setDateRange({ from: date, to: undefined });
    }
  };

  return (
    <div className={`grid gap-2 ${darkMode ? 'text-white' : ''}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground",
              darkMode ? "bg-gray-800 text-white border-gray-700" : ""
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "PPP", { locale: it })} -{" "}
                  {format(dateRange.to, "PPP", { locale: it })}
                </>
              ) : (
                format(dateRange.from, "PPP", { locale: it })
              )
            ) : (
              <span>Seleziona un intervallo di date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`w-auto p-0 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`} align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={(selected) => {
              setDateRange({
                from: selected?.from,
                to: selected?.to,
              });
            }}
            numberOfMonths={2}
            locale={it}
            className={darkMode ? "bg-gray-800 text-white" : ""}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
