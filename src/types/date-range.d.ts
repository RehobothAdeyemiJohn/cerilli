
// Type definition for DateRange used in various components
export interface DateRange {
  from: Date;
  to?: Date;
}

declare global {
  interface Window {
    DateRange: DateRange;
  }
}

export {};
