import { useState, useEffect } from "react";

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export const useAvailableFrequencies = (
  overviewDateRange: DateRange,
  currentFrequency: string
) => {
  const [availableFrequencies, setAvailableFrequencies] = useState<string[]>([
    "daily",
  ]);

  useEffect(() => {
    const daysDiff = Math.ceil(
      (overviewDateRange.end.getTime() - overviewDateRange.start.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let frequencies: string[] = [];

    if (daysDiff === 0) {
      // Only 1 day: hourly only
      frequencies = ["hourly"];
    } else if (daysDiff < 7) {
      // Less than 7 days: hourly and daily
      frequencies = ["hourly", "daily"];
    } else if (daysDiff >= 28 && daysDiff < 90) {
      // 4 weeks to less than 3 months: daily and weekly
      frequencies = ["daily", "weekly"];
    } else if (daysDiff >= 90 && daysDiff < 365) {
      // 3 months to less than 1 year: weekly and monthly
      frequencies = ["weekly", "monthly"];
    } else if (daysDiff >= 365 && daysDiff < 1095) {
      // 1 year to less than 3 years: monthly only
      frequencies = ["monthly"];
    } else if (daysDiff >= 1095) {
      // More than 3 years: monthly and yearly
      frequencies = ["monthly", "yearly"];
    } else {
      // 7 to 27 days: daily only (fallback)
      frequencies = ["daily"];
    }
    setAvailableFrequencies(frequencies);
  }, [overviewDateRange, currentFrequency]);

  return { availableFrequencies };
};
