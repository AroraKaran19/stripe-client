import { Transaction, ITransaction } from "../models/transaction.model";
import { AppError } from "../middleware/error.middleware";
import { normalizeToUTC } from "../utils/dateUtils";
import {
  getTopSectionMetricDataRange,
  getCardDataByDateRange,
  getDefaultHomepage,
} from "./homepage.services";

interface DateRange {
  start: Date;
  end: Date;
}

interface TimeSeriesPoint {
  date: string;
  value: number;
}

interface AnalyticsResponse {
  grossVolume: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    timeSeries: {
      current: TimeSeriesPoint[];
      previous: TimeSeriesPoint[];
    };
  };
  netVolume: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    timeSeries: {
      current: TimeSeriesPoint[];
      previous: TimeSeriesPoint[];
    };
  };
  payments: ITransaction[];
  failedPayments: ITransaction[];
  newCustomers: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    timeSeries: {
      current: TimeSeriesPoint[];
      previous: TimeSeriesPoint[];
    };
  };
  successfulPayments: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    timeSeries: {
      current: TimeSeriesPoint[];
      previous: TimeSeriesPoint[];
    };
  };
  topCustomersBySpend: Array<{
    customer_id?: string;
    owner_email?: string;
    owner?: string;
    totalSpend: number;
    transactionCount: number;
  }>;
  updatedAt: Date;
}

const calculateDateRange = (
  dateRange: string,
  frequency: string,
  customStart?: Date,
  customEnd?: Date,
  compareOption: string = "previous_period"
): { current: DateRange; previous: DateRange } => {
  const now = new Date();
  let currentEnd: Date;
  let currentStart: Date;

  // Use custom dates if provided
  if (customStart && customEnd) {
    currentStart = new Date(customStart);
    currentStart.setUTCHours(0, 0, 0, 0);
    currentEnd = new Date(customEnd);
    currentEnd.setUTCHours(23, 59, 59, 999);
  } else {
    currentEnd = new Date(now);
    currentEnd.setUTCHours(23, 59, 59, 999);

    // Calculate current period start based on date range
    switch (dateRange) {
      case "today":
        currentStart = new Date(now);
        currentStart.setUTCHours(0, 0, 0, 0);
        break;
      case "last_7_days":
        currentStart = new Date(now);
        // Include today => start 6 days ago
        currentStart.setDate(currentStart.getDate() - 6);
        currentStart.setUTCHours(0, 0, 0, 0);
        break;
      case "last_4_weeks":
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 27);
        currentStart.setUTCHours(0, 0, 0, 0);
        break;
      case "last_30_days":
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 30);
        currentStart.setUTCHours(0, 0, 0, 0);
        break;
      case "month_to_date":
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentStart.setUTCHours(0, 0, 0, 0);
        break;
      case "quarter_to_date":
        const quarter = Math.floor(now.getMonth() / 3);
        currentStart = new Date(now.getFullYear(), quarter * 3, 1);
        currentStart.setUTCHours(0, 0, 0, 0);
        break;
      case "all_time":
        currentStart = new Date(2000, 0, 1);
        currentStart.setUTCHours(0, 0, 0, 0);
        break;
      case "last_90_days":
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 90);
        currentStart.setUTCHours(0, 0, 0, 0);
        break;
      case "last_12_months":
        currentStart = new Date(now);
        currentStart.setMonth(currentStart.getMonth() - 12);
        currentStart.setUTCHours(0, 0, 0, 0);
        break;
      default:
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 7);
        currentStart.setUTCHours(0, 0, 0, 0);
    }
  }

  // Calculate previous period based on compare option
  let previousStart: Date;
  let previousEnd: Date;
  const duration = currentEnd.getTime() - currentStart.getTime();

  switch (compareOption) {
    case "none":
      // No comparison - set previous period to same as current (will result in identical data)
      previousStart = new Date(currentStart);
      previousEnd = new Date(currentEnd);
      break;
    case "previous_week":
      // Previous week (7 days before current period)
      previousEnd = new Date(currentStart.getTime() - 1);
      previousEnd.setUTCHours(23, 59, 59, 999);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 6);
      previousStart.setUTCHours(0, 0, 0, 0);
      break;
    case "previous_month":
      // Previous month (same calendar month before)
      const prevMonth = new Date(currentStart);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      previousStart = new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth(),
        1
      );
      previousStart.setUTCHours(0, 0, 0, 0);
      const daysInPrevMonth = new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth() + 1,
        0
      ).getDate();
      previousEnd = new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth(),
        daysInPrevMonth
      );
      previousEnd.setUTCHours(23, 59, 59, 999);
      break;
    case "previous_year":
      // Previous year (same period last year)
      previousStart = new Date(currentStart);
      previousStart.setFullYear(previousStart.getFullYear() - 1);
      previousEnd = new Date(currentEnd);
      previousEnd.setFullYear(previousEnd.getFullYear() - 1);
      break;
    case "custom":
      // Custom - for now, same as previous_period (would need separate UI for custom dates)
      previousStart = new Date(currentStart.getTime() - duration);
      previousEnd = new Date(currentStart.getTime() - 1);
      break;
    case "previous_period":
    default:
      // Overlay previous period: go back duration from current start
      // Calculate properly for day boundaries
      previousEnd = new Date(currentStart.getTime() - 1000); // 1 second before current start
      // Set to end of that day (23:59:59.999)
      previousEnd.setUTCHours(23, 59, 59, 999);
      previousStart = new Date(previousEnd.getTime() - duration);
      // Set to start of that day (00:00:00.000)
      previousStart.setUTCHours(0, 0, 0, 0);
      break;
  }

  return {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
  };
};

const formatLocalDate = (d: Date): string => {
  // Use UTC methods to avoid timezone conversion issues
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

const formatLocalHourKey = (d: Date): string => {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hour = String(d.getUTCHours()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:00:00.000Z`;
};

const generateTimeSeries = (
  transactions: ITransaction[],
  dateRange: DateRange,
  frequency: string
): TimeSeriesPoint[] => {
  const points: TimeSeriesPoint[] = [];
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);

  if (frequency === "hourly") {
    // For hourly, generate hourly data for all days in the range
    const hourlyMap = new Map<string, number>();

    // Process transactions and group by hour
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const txDate = new Date(tx.admin_date);
        // Create hourly key: YYYY-MM-DDTHH:00:00.000Z
        const hourKey = new Date(
          Date.UTC(
            txDate.getUTCFullYear(),
            txDate.getUTCMonth(),
            txDate.getUTCDate(),
            txDate.getUTCHours(),
            0,
            0,
            0
          )
        ).toISOString();
        hourlyMap.set(
          hourKey,
          (hourlyMap.get(hourKey) || 0) + (tx.amount || 0)
        );
      }
    });

    // Generate hourly data points for entire date range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      for (let hour = 0; hour < 24; hour++) {
        const hourDate = new Date(
          Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth(),
            currentDate.getUTCDate(),
            hour,
            0,
            0,
            0
          )
        );

        // Only include if within range
        if (hourDate >= start && hourDate <= end) {
          points.push({
            date: hourDate.toISOString(),
            value: hourlyMap.get(hourDate.toISOString()) || 0,
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (frequency === "daily") {
    // Group by day
    const dailyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        const dateKey = formatLocalDate(date);
        dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + (tx.amount || 0));
      }
    });

    // Normalize dates to start of day for proper comparison
    const startDate = new Date(start);
    startDate.setUTCHours(0, 0, 0, 0);
    // For end date, we want to include the full day, so normalize to start of next day for comparison
    const endDate = new Date(end);
    endDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCDate(endDate.getUTCDate() + 1); // Add one day so we include the end date
    const currentDate = new Date(startDate);

    // Loop until we reach the day after endDate (exclusive)
    while (currentDate < endDate) {
      const dateKey = formatLocalDate(currentDate);
      points.push({
        date: dateKey,
        value: dailyMap.get(dateKey) || 0,
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
  } else if (frequency === "weekly") {
    // Group by week
    const weeklyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        const weekKey = getWeekKey(date);
        weeklyMap.set(
          weekKey,
          (weeklyMap.get(weekKey) || 0) + (tx.amount || 0)
        );
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const weekKey = getWeekKey(currentDate);
      if (!points.find((p) => p.date === weekKey)) {
        points.push({
          date: weekKey,
          value: weeklyMap.get(weekKey) || 0,
        });
      }
      currentDate.setDate(currentDate.getDate() + 7);
    }
  } else if (frequency === "monthly") {
    // Monthly
    const monthlyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthlyMap.set(
          monthKey,
          (monthlyMap.get(monthKey) || 0) + (tx.amount || 0)
        );
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const monthKey = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!points.find((p) => p.date === monthKey)) {
        points.push({
          date: monthKey,
          value: monthlyMap.get(monthKey) || 0,
        });
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  } else if (frequency === "yearly") {
    // Yearly
    const yearlyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        const yearKey = `${date.getFullYear()}`;
        yearlyMap.set(
          yearKey,
          (yearlyMap.get(yearKey) || 0) + (tx.amount || 0)
        );
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const yearKey = `${currentDate.getFullYear()}`;
      if (!points.find((p) => p.date === yearKey)) {
        points.push({
          date: yearKey,
          value: yearlyMap.get(yearKey) || 0,
        });
      }
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
};

const getWeekKey = (date: Date): string => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
  return d.toISOString().split("T")[0];
};

const generateCustomerTimeSeries = (
  transactions: ITransaction[],
  dateRange: DateRange,
  frequency: string
): TimeSeriesPoint[] => {
  const points: TimeSeriesPoint[] = [];
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);

  if (frequency === "hourly") {
    // For hourly, generate hourly data for all days in the range
    const hourlyMap = new Map<string, Set<string>>();

    // Process transactions and group customers by hour
    transactions.forEach((tx) => {
      if (tx.admin_date && (tx.customer_id || tx.owner_email)) {
        const txDate = new Date(tx.admin_date);
        // Create hourly key: YYYY-MM-DDTHH:00:00.000Z
        const hourKey = new Date(
          Date.UTC(
            txDate.getUTCFullYear(),
            txDate.getUTCMonth(),
            txDate.getUTCDate(),
            txDate.getUTCHours(),
            0,
            0,
            0
          )
        ).toISOString();
        const customerKey = tx.customer_id || tx.owner_email || "";
        if (!hourlyMap.has(hourKey)) {
          hourlyMap.set(hourKey, new Set());
        }
        hourlyMap.get(hourKey)!.add(customerKey);
      }
    });

    // Generate hourly data points for entire date range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      for (let hour = 0; hour < 24; hour++) {
        const hourDate = new Date(
          Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth(),
            currentDate.getUTCDate(),
            hour,
            0,
            0,
            0
          )
        );

        // Only include if within range
        if (hourDate >= start && hourDate <= end) {
          points.push({
            date: hourDate.toISOString(),
            value: hourlyMap.get(hourDate.toISOString())?.size || 0,
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (frequency === "daily") {
    const dailyMap = new Map<string, Set<string>>();
    transactions.forEach((tx) => {
      if (tx.admin_date && (tx.customer_id || tx.owner_email)) {
        const date = new Date(tx.admin_date);
        const dateKey = formatLocalDate(date);
        const customerKey = tx.customer_id || tx.owner_email || "";
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, new Set());
        }
        dailyMap.get(dateKey)!.add(customerKey);
      }
    });

    // Normalize dates to start of day for proper comparison
    const startDate = new Date(start);
    startDate.setUTCHours(0, 0, 0, 0);
    // For end date, we want to include the full day, so normalize to start of next day for comparison
    const endDate = new Date(end);
    endDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCDate(endDate.getUTCDate() + 1); // Add one day so we include the end date
    const currentDate = new Date(startDate);

    // Loop until we reach the day after endDate (exclusive)
    while (currentDate < endDate) {
      const dateKey = formatLocalDate(currentDate);
      points.push({
        date: dateKey,
        value: dailyMap.get(dateKey)?.size || 0,
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
  } else if (frequency === "weekly") {
    const weeklyMap = new Map<string, Set<string>>();
    transactions.forEach((tx) => {
      if (tx.admin_date && (tx.customer_id || tx.owner_email)) {
        const date = new Date(tx.admin_date);
        const weekKey = getWeekKey(date);
        const customerKey = tx.customer_id || tx.owner_email || "";
        if (!weeklyMap.has(weekKey)) {
          weeklyMap.set(weekKey, new Set());
        }
        weeklyMap.get(weekKey)!.add(customerKey);
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const weekKey = getWeekKey(currentDate);
      if (!points.find((p) => p.date === weekKey)) {
        points.push({
          date: weekKey,
          value: weeklyMap.get(weekKey)?.size || 0,
        });
      }
      currentDate.setDate(currentDate.getDate() + 7);
    }
  } else if (frequency === "monthly") {
    // Monthly
    const monthlyMap = new Map<string, Set<string>>();
    transactions.forEach((tx) => {
      if (tx.admin_date && (tx.customer_id || tx.owner_email)) {
        const date = new Date(tx.admin_date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        const customerKey = tx.customer_id || tx.owner_email || "";
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, new Set());
        }
        monthlyMap.get(monthKey)!.add(customerKey);
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const monthKey = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!points.find((p) => p.date === monthKey)) {
        points.push({
          date: monthKey,
          value: monthlyMap.get(monthKey)?.size || 0,
        });
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  } else if (frequency === "yearly") {
    // Yearly
    const yearlyMap = new Map<string, Set<string>>();
    transactions.forEach((tx) => {
      if (tx.admin_date && (tx.customer_id || tx.owner_email)) {
        const date = new Date(tx.admin_date);
        const yearKey = `${date.getFullYear()}`;
        const customerKey = tx.customer_id || tx.owner_email || "";
        if (!yearlyMap.has(yearKey)) {
          yearlyMap.set(yearKey, new Set());
        }
        yearlyMap.get(yearKey)!.add(customerKey);
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const yearKey = `${currentDate.getFullYear()}`;
      if (!points.find((p) => p.date === yearKey)) {
        points.push({
          date: yearKey,
          value: yearlyMap.get(yearKey)?.size || 0,
        });
      }
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
};

const generatePaymentCountTimeSeries = (
  transactions: ITransaction[],
  dateRange: DateRange,
  frequency: string
): TimeSeriesPoint[] => {
  const points: TimeSeriesPoint[] = [];
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);

  if (frequency === "hourly") {
    // For hourly, generate hourly data for all days in the range
    const hourlyMap = new Map<string, number>();

    // Process transactions and count payments by hour
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const txDate = new Date(tx.admin_date);
        // Create hourly key: YYYY-MM-DDTHH:00:00.000Z
        const hourKey = new Date(
          Date.UTC(
            txDate.getUTCFullYear(),
            txDate.getUTCMonth(),
            txDate.getUTCDate(),
            txDate.getUTCHours(),
            0,
            0,
            0
          )
        ).toISOString();
        hourlyMap.set(hourKey, (hourlyMap.get(hourKey) || 0) + 1);
      }
    });

    // Generate hourly data points for entire date range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      for (let hour = 0; hour < 24; hour++) {
        const hourDate = new Date(
          Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth(),
            currentDate.getUTCDate(),
            hour,
            0,
            0,
            0
          )
        );

        // Only include if within range
        if (hourDate >= start && hourDate <= end) {
          points.push({
            date: hourDate.toISOString(),
            value: hourlyMap.get(hourDate.toISOString()) || 0,
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (frequency === "daily") {
    const dailyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        const dateKey = formatLocalDate(date);
        dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
      }
    });

    // Normalize dates to start of day for proper comparison
    const startDate = new Date(start);
    startDate.setUTCHours(0, 0, 0, 0);
    // For end date, we want to include the full day, so normalize to start of next day for comparison
    const endDate = new Date(end);
    endDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCDate(endDate.getUTCDate() + 1); // Add one day so we include the end date
    const currentDate = new Date(startDate);

    // Loop until we reach the day after endDate (exclusive)
    while (currentDate < endDate) {
      const dateKey = formatLocalDate(currentDate);
      points.push({
        date: dateKey,
        value: dailyMap.get(dateKey) || 0,
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
  } else if (frequency === "weekly") {
    const weeklyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        const weekKey = getWeekKey(date);
        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1);
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const weekKey = getWeekKey(currentDate);
      if (!points.find((p) => p.date === weekKey)) {
        points.push({
          date: weekKey,
          value: weeklyMap.get(weekKey) || 0,
        });
      }
      currentDate.setDate(currentDate.getDate() + 7);
    }
  } else if (frequency === "monthly") {
    // Monthly
    const monthlyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const monthKey = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!points.find((p) => p.date === monthKey)) {
        points.push({
          date: monthKey,
          value: monthlyMap.get(monthKey) || 0,
        });
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  } else if (frequency === "yearly") {
    // Yearly
    const yearlyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        const yearKey = `${date.getFullYear()}`;
        yearlyMap.set(yearKey, (yearlyMap.get(yearKey) || 0) + 1);
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const yearKey = `${currentDate.getFullYear()}`;
      if (!points.find((p) => p.date === yearKey)) {
        points.push({
          date: yearKey,
          value: yearlyMap.get(yearKey) || 0,
        });
      }
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
};

export const getAnalytics = async (
  dateRange: string = "last_7_days",
  frequency: string = "daily",
  customStart?: Date,
  customEnd?: Date,
  compareOption: string = "previous_period",
  username?: string | null
): Promise<AnalyticsResponse> => {
  try {
    const ranges = calculateDateRange(
      dateRange,
      frequency,
      customStart,
      customEnd,
      compareOption
    );

    // Fetch transactions for current period
    const currentTransactions = await Transaction.find({
      admin_date: {
        $gte: ranges.current.start,
        $lte: ranges.current.end,
      },
    }).sort({ admin_date: 1 });

    // Fetch transactions for previous period
    const previousTransactions = await Transaction.find({
      admin_date: {
        $gte: ranges.previous.start,
        $lte: ranges.previous.end,
      },
    }).sort({ admin_date: 1 });

    // Get username (use default if not provided)
    let targetUsername = username;
    if (!targetUsername) {
      const defaultHomepage = await getDefaultHomepage();
      targetUsername = defaultHomepage?.username || "default";
    }

    // Fetch homepage data for current period if available (for daily frequency)
    let homepageGrossVolumeData: any[] = [];
    let homepageNetVolumeData: any[] = [];
    let homepageNewCustomersData: any[] = [];
    let homepageSuccessfulPaymentsData: any[] = [];
    let homepagePaymentsData: any[] = [];
    let homepageFailedPaymentsData: any[] = [];
    let homepageTopCustomersData: any[] = [];

    if (frequency === "daily" && targetUsername) {
      try {
        homepageGrossVolumeData = await getTopSectionMetricDataRange(
          targetUsername,
          "Gross Volume",
          ranges.current.start,
          ranges.current.end
        );
        homepageNetVolumeData = await getTopSectionMetricDataRange(
          targetUsername,
          "Net Volume",
          ranges.current.start,
          ranges.current.end
        );
        homepageNewCustomersData = await getTopSectionMetricDataRange(
          targetUsername,
          "New Customers",
          ranges.current.start,
          ranges.current.end
        );
        homepageSuccessfulPaymentsData = await getTopSectionMetricDataRange(
          targetUsername,
          "Successful Payments",
          ranges.current.start,
          ranges.current.end
        );
        homepagePaymentsData = await getCardDataByDateRange(
          targetUsername,
          "Payment Card",
          ranges.current.start,
          ranges.current.end
        );
        homepageFailedPaymentsData = await getCardDataByDateRange(
          targetUsername,
          "Failed Payments Card",
          ranges.current.start,
          ranges.current.end
        );
        homepageTopCustomersData = await getCardDataByDateRange(
          targetUsername,
          "Top Customers Card",
          ranges.current.start,
          ranges.current.end
        );
      } catch (err) {
        // If homepage data fetch fails, continue with transaction data
        console.log("Failed to fetch homepage data:", err);
      }
    }

    // Calculate Gross Volume (use manual snapshots if available, otherwise calculate from transactions)
    let currentGrossVolume = currentTransactions
      .filter((tx) => tx.status === "succeeded")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    // Override with homepage data if available
    if (homepageGrossVolumeData.length > 0) {
      currentGrossVolume = homepageGrossVolumeData.reduce((sum, entry) => {
        return sum + (entry.data?.current || 0);
      }, 0);
    }

    let previousGrossVolume = previousTransactions
      .filter((tx) => tx.status === "succeeded")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const grossVolumeChange = currentGrossVolume - previousGrossVolume;
    const grossVolumeChangePercent =
      previousGrossVolume !== 0
        ? (grossVolumeChange / previousGrossVolume) * 100
        : currentGrossVolume !== 0
        ? 100
        : 0;

    // Calculate Net Volume (use manual snapshots if available, otherwise calculate from transactions)
    const currentRefundedAmount = currentTransactions
      .filter((tx) => tx.status === "refunded")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const previousRefundedAmount = previousTransactions
      .filter((tx) => tx.status === "refunded")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    let currentNetVolume = currentGrossVolume - currentRefundedAmount;

    // Override with homepage data if available
    if (homepageNetVolumeData.length > 0) {
      currentNetVolume = homepageNetVolumeData.reduce((sum, entry) => {
        return sum + (entry.data?.current || 0);
      }, 0);
    }

    let previousNetVolume = previousGrossVolume - previousRefundedAmount;

    const netVolumeChange = currentNetVolume - previousNetVolume;
    const netVolumeChangePercent =
      previousNetVolume !== 0
        ? (netVolumeChange / previousNetVolume) * 100
        : currentNetVolume !== 0
        ? 100
        : 0;

    // Get recent payments (succeeded transactions, latest first)
    let payments = currentTransactions
      .filter((tx) => tx.status === "succeeded")
      .slice(0, 10)
      .reverse();

    // Override with homepage data if available
    if (homepagePaymentsData.length > 0) {
      const allPayments: ITransaction[] = [];
      homepagePaymentsData.forEach((entry) => {
        if (entry.data?.transactions) {
          entry.data.transactions.forEach((t: any, index: number) => {
            allPayments.push({
              _id: t.id,
              amount: t.amount,
              currency: "USD",
              number: `#${allPayments.length + 1}`,
              owner: "Customer",
              owner_email: "customer@example.com",
              fingerprint: "",
              expires: "",
              type: "card",
              issuer: "Visa",
              cvc_check: true,
              origin: "online",
              address: "",
              status: t.status === "successful" ? "succeeded" : "failed",
              activity_history: [],
              payment_id: t.id,
              payment_method: {
                card_type: "Visa",
                cart_last_four: "4242",
              },
              description: t.description,
              statement_descriptor: t.description,
              risk_evaluation: {
                score: 0,
                level: "low",
              },
              country: "US",
              items: [],
              createdAt: new Date(t.date),
              admin_date: new Date(t.date),
            } as unknown as ITransaction);
          });
        }
      });
      payments = allPayments.slice(0, 10).reverse() as any;
    }

    // Get failed payments
    let failedPayments = currentTransactions.filter(
      (tx) => tx.status === "failed"
    );

    // Override with homepage data if available
    if (homepageFailedPaymentsData.length > 0) {
      const allFailedPayments: ITransaction[] = [];
      homepageFailedPaymentsData.forEach((entry) => {
        if (entry.data?.transactions) {
          entry.data.transactions.forEach((t: any, index: number) => {
            allFailedPayments.push({
              _id: t.id,
              amount: t.amount,
              currency: "USD",
              number: `#${allFailedPayments.length + 1}`,
              owner: "Customer",
              owner_email: "customer@example.com",
              fingerprint: "",
              expires: "",
              type: "card",
              issuer: "Visa",
              cvc_check: true,
              origin: "online",
              address: "",
              status: "failed",
              activity_history: [],
              payment_id: t.id,
              payment_method: {
                card_type: "Visa",
                cart_last_four: "4242",
              },
              description: t.description,
              statement_descriptor: t.description,
              decline_reason: t.reason,
              risk_evaluation: {
                score: 0,
                level: "low",
              },
              country: "US",
              items: [],
              createdAt: new Date(t.date),
              admin_date: new Date(t.date),
            } as unknown as ITransaction);
          });
        }
      });
      failedPayments = allFailedPayments as any;
    }

    // Calculate New Customers (unique customers in current period)
    const currentCustomerSet = new Set<string>();
    currentTransactions.forEach((tx) => {
      if (tx.customer_id) {
        currentCustomerSet.add(tx.customer_id);
      } else if (tx.owner_email) {
        currentCustomerSet.add(tx.owner_email);
      }
    });

    const previousCustomerSet = new Set<string>();
    previousTransactions.forEach((tx) => {
      if (tx.customer_id) {
        previousCustomerSet.add(tx.customer_id);
      } else if (tx.owner_email) {
        previousCustomerSet.add(tx.owner_email);
      }
    });

    // New customers = customers in current period that weren't in previous period
    let newCustomersCount = Array.from(currentCustomerSet).filter(
      (customer) => !previousCustomerSet.has(customer)
    ).length;

    // Override with homepage data if available
    if (homepageNewCustomersData.length > 0) {
      newCustomersCount = homepageNewCustomersData.reduce((sum, entry) => {
        return sum + (entry.data?.current || 0);
      }, 0);
    }

    let previousNewCustomersCount = Array.from(previousCustomerSet).length;
    const newCustomersChange = newCustomersCount - previousNewCustomersCount;
    const newCustomersChangePercent =
      previousNewCustomersCount !== 0
        ? (newCustomersChange / previousNewCustomersCount) * 100
        : newCustomersCount !== 0
        ? 100
        : 0;

    // Calculate Top Customers by Spend
    const customerSpendMap = new Map<
      string,
      {
        customer_id?: string;
        owner_email?: string;
        owner?: string;
        totalSpend: number;
        transactionCount: number;
      }
    >();

    currentTransactions
      .filter((tx) => tx.status === "succeeded")
      .forEach((tx) => {
        const customerKey = tx.customer_id || tx.owner_email || "";
        if (customerKey) {
          const existing = customerSpendMap.get(customerKey) || {
            customer_id: tx.customer_id,
            owner_email: tx.owner_email,
            owner: tx.owner,
            totalSpend: 0,
            transactionCount: 0,
          };
          existing.totalSpend += tx.amount || 0;
          existing.transactionCount += 1;
          customerSpendMap.set(customerKey, existing);
        }
      });

    let topCustomersBySpend = Array.from(customerSpendMap.values())
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);

    // Override with homepage data if available
    if (homepageTopCustomersData.length > 0) {
      const allTopCustomers: any[] = [];
      homepageTopCustomersData.forEach((entry) => {
        if (entry.data?.customers) {
          entry.data.customers.forEach((c: any) => {
            allTopCustomers.push({
              customer_id: c.customerId,
              owner_email: c.email,
              owner: c.name,
              totalSpend: c.totalSpend,
              transactionCount: c.transactionCount,
            });
          });
        }
      });
      topCustomersBySpend = allTopCustomers
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 10);
    }

    // Generate time series data
    const currentSucceededTransactions = currentTransactions.filter(
      (tx) => tx.status === "succeeded"
    );
    const previousSucceededTransactions = previousTransactions.filter(
      (tx) => tx.status === "succeeded"
    );

    // Build time series from homepage data if available (for daily frequency)
    let grossVolumeTimeSeries = {
      current: generateTimeSeries(
        currentSucceededTransactions,
        ranges.current,
        frequency
      ),
      previous: generateTimeSeries(
        previousSucceededTransactions,
        ranges.previous,
        frequency
      ),
    };

    if (frequency === "daily" && homepageGrossVolumeData.length > 0) {
      // Build time series from homepage data
      const dailyMap = new Map<string, number>();
      homepageGrossVolumeData.forEach((entry) => {
        const dateKey = new Date(entry.date).toISOString().split("T")[0];
        dailyMap.set(dateKey, entry.data?.current || 0);
      });

      const dailyTimeSeries: TimeSeriesPoint[] = [];
      const startDate = new Date(ranges.current.start);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(ranges.current.end);
      endDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      const currentDate = new Date(startDate);

      while (currentDate < endDate) {
        const dateKey = currentDate.toISOString().split("T")[0];
        dailyTimeSeries.push({
          date: `${dateKey}T00:00:00.000Z`,
          value: dailyMap.get(dateKey) || 0,
        });
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      grossVolumeTimeSeries.current = dailyTimeSeries;
    }

    const currentNetTransactions = currentTransactions.map((tx) => {
      if (tx.status === "refunded") {
        return { ...tx.toObject(), amount: -(tx.amount || 0) };
      }
      return tx;
    });

    const previousNetTransactions = previousTransactions.map((tx) => {
      if (tx.status === "refunded") {
        return { ...tx.toObject(), amount: -(tx.amount || 0) };
      }
      return tx;
    });

    let netVolumeTimeSeries = {
      current: generateTimeSeries(
        currentNetTransactions as ITransaction[],
        ranges.current,
        frequency
      ),
      previous: generateTimeSeries(
        previousNetTransactions as ITransaction[],
        ranges.previous,
        frequency
      ),
    };

    if (frequency === "daily" && homepageNetVolumeData.length > 0) {
      // Build time series from homepage data
      const dailyMap = new Map<string, number>();
      homepageNetVolumeData.forEach((entry) => {
        const dateKey = new Date(entry.date).toISOString().split("T")[0];
        dailyMap.set(dateKey, entry.data?.current || 0);
      });

      const dailyTimeSeries: TimeSeriesPoint[] = [];
      const startDate = new Date(ranges.current.start);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(ranges.current.end);
      endDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      const currentDate = new Date(startDate);

      while (currentDate < endDate) {
        const dateKey = currentDate.toISOString().split("T")[0];
        dailyTimeSeries.push({
          date: `${dateKey}T00:00:00.000Z`,
          value: dailyMap.get(dateKey) || 0,
        });
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      netVolumeTimeSeries.current = dailyTimeSeries;
    }

    let newCustomersTimeSeries = {
      current: generateCustomerTimeSeries(
        currentTransactions,
        ranges.current,
        frequency
      ),
      previous: generateCustomerTimeSeries(
        previousTransactions,
        ranges.previous,
        frequency
      ),
    };

    if (frequency === "daily" && homepageNewCustomersData.length > 0) {
      // Build time series from homepage data
      const dailyMap = new Map<string, number>();
      homepageNewCustomersData.forEach((entry) => {
        const dateKey = new Date(entry.date).toISOString().split("T")[0];
        dailyMap.set(dateKey, entry.data?.current || 0);
      });

      const dailyTimeSeries: TimeSeriesPoint[] = [];
      const startDate = new Date(ranges.current.start);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(ranges.current.end);
      endDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      const currentDate = new Date(startDate);

      while (currentDate < endDate) {
        const dateKey = currentDate.toISOString().split("T")[0];
        dailyTimeSeries.push({
          date: `${dateKey}T00:00:00.000Z`,
          value: dailyMap.get(dateKey) || 0,
        });
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      newCustomersTimeSeries.current = dailyTimeSeries;
    }

    // Calculate Successful Payments count
    let currentSuccessfulPaymentsCount = currentSucceededTransactions.length;

    // Override with homepage data if available
    if (homepageSuccessfulPaymentsData.length > 0) {
      currentSuccessfulPaymentsCount = homepageSuccessfulPaymentsData.reduce(
        (sum, entry) => sum + (entry.data?.current || 0),
        0
      );
    }

    const previousSuccessfulPaymentsCount =
      previousSucceededTransactions.length;
    const successfulPaymentsChange =
      currentSuccessfulPaymentsCount - previousSuccessfulPaymentsCount;
    const successfulPaymentsChangePercent =
      previousSuccessfulPaymentsCount !== 0
        ? (successfulPaymentsChange / previousSuccessfulPaymentsCount) * 100
        : currentSuccessfulPaymentsCount !== 0
        ? 100
        : 0;

    // Generate time series for successful payments count
    let successfulPaymentsTimeSeries = {
      current: generatePaymentCountTimeSeries(
        currentSucceededTransactions,
        ranges.current,
        frequency
      ),
      previous: generatePaymentCountTimeSeries(
        previousSucceededTransactions,
        ranges.previous,
        frequency
      ),
    };

    if (frequency === "daily" && homepageSuccessfulPaymentsData.length > 0) {
      // Build time series from homepage data
      const dailyMap = new Map<string, number>();
      homepageSuccessfulPaymentsData.forEach((entry) => {
        const dateKey = new Date(entry.date).toISOString().split("T")[0];
        dailyMap.set(dateKey, entry.data?.current || 0);
      });

      const dailyTimeSeries: TimeSeriesPoint[] = [];
      const startDate = new Date(ranges.current.start);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(ranges.current.end);
      endDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      const currentDate = new Date(startDate);

      while (currentDate < endDate) {
        const dateKey = currentDate.toISOString().split("T")[0];
        dailyTimeSeries.push({
          date: `${dateKey}T00:00:00.000Z`,
          value: dailyMap.get(dateKey) || 0,
        });
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      successfulPaymentsTimeSeries.current = dailyTimeSeries;
    }

    return {
      grossVolume: {
        current: currentGrossVolume,
        previous: previousGrossVolume,
        change: grossVolumeChange,
        changePercent: grossVolumeChangePercent,
        timeSeries: grossVolumeTimeSeries,
      },
      netVolume: {
        current: currentNetVolume,
        previous: previousNetVolume,
        change: netVolumeChange,
        changePercent: netVolumeChangePercent,
        timeSeries: netVolumeTimeSeries,
      },
      payments: payments as ITransaction[],
      failedPayments: failedPayments as ITransaction[],
      newCustomers: {
        current: newCustomersCount,
        previous: previousNewCustomersCount,
        change: newCustomersChange,
        changePercent: newCustomersChangePercent,
        timeSeries: newCustomersTimeSeries,
      },
      successfulPayments: {
        current: currentSuccessfulPaymentsCount,
        previous: previousSuccessfulPaymentsCount,
        change: successfulPaymentsChange,
        changePercent: successfulPaymentsChangePercent,
        timeSeries: successfulPaymentsTimeSeries,
      },
      topCustomersBySpend,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error calculating analytics:", error);
    throw new AppError("Failed to calculate analytics", 500);
  }
};
