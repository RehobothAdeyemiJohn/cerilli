
// Type definition for DateRange used in various components
export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

declare global {
  interface Window {
    DateRange: DateRange;
  }
}

export {};
