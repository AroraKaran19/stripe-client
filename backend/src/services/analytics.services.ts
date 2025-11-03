import { Transaction, ITransaction } from "../models/transaction.model";
import { AppError } from "../middleware/error.middleware";

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
    currentStart.setHours(0, 0, 0, 0);
    currentEnd = new Date(customEnd);
    currentEnd.setHours(23, 59, 59, 999);
  } else {
    currentEnd = new Date(now);
    currentEnd.setHours(23, 59, 59, 999);

    // Calculate current period start based on date range
    switch (dateRange) {
      case "today":
        currentStart = new Date(now);
        currentStart.setHours(0, 0, 0, 0);
        break;
      case "last_7_days":
        currentStart = new Date(now);
        // Include today => start 6 days ago
        currentStart.setDate(currentStart.getDate() - 6);
        currentStart.setHours(0, 0, 0, 0);
        break;
      case "last_4_weeks":
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 27);
        currentStart.setHours(0, 0, 0, 0);
        break;
      case "last_30_days":
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 30);
        currentStart.setHours(0, 0, 0, 0);
        break;
      case "month_to_date":
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentStart.setHours(0, 0, 0, 0);
        break;
      case "quarter_to_date":
        const quarter = Math.floor(now.getMonth() / 3);
        currentStart = new Date(now.getFullYear(), quarter * 3, 1);
        currentStart.setHours(0, 0, 0, 0);
        break;
      case "all_time":
        currentStart = new Date(2000, 0, 1);
        currentStart.setHours(0, 0, 0, 0);
        break;
      case "last_90_days":
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 90);
        currentStart.setHours(0, 0, 0, 0);
        break;
      case "last_12_months":
        currentStart = new Date(now);
        currentStart.setMonth(currentStart.getMonth() - 12);
        currentStart.setHours(0, 0, 0, 0);
        break;
      default:
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 7);
        currentStart.setHours(0, 0, 0, 0);
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
      previousEnd.setHours(23, 59, 59, 999);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 6);
      previousStart.setHours(0, 0, 0, 0);
      break;
    case "previous_month":
      // Previous month (same calendar month before)
      const prevMonth = new Date(currentStart);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      previousStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
      previousStart.setHours(0, 0, 0, 0);
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
      previousEnd.setHours(23, 59, 59, 999);
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
      previousEnd = new Date(currentStart.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - duration);
      break;
  }

  return {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
  };
};

const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

const formatLocalHourKey = (d: Date): string => {
  const base = formatLocalDate(d);
  const h = String(d.getHours()).padStart(2, "0");
  return `${base}T${h}:00:00`;
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
    // For hourly, only show data for one day (the end date)
    const singleDayStart = new Date(end);
    singleDayStart.setHours(0, 0, 0, 0);
    const singleDayEnd = new Date(end);
    singleDayEnd.setHours(23, 59, 59, 999);
    
    // Group by hour for the selected day only
    const hourlyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        // Only include transactions from the selected day
        if (date >= singleDayStart && date <= singleDayEnd) {
          const hourKey = formatLocalHourKey(date);
          hourlyMap.set(
            hourKey,
            (hourlyMap.get(hourKey) || 0) + (tx.amount || 0)
          );
        }
      }
    });

    // Generate all 24 hours for the selected day
    const currentDate = new Date(singleDayStart);
    while (currentDate <= singleDayEnd) {
      const hourKey = formatLocalHourKey(currentDate);
      points.push({
        date: hourKey,
        value: hourlyMap.get(hourKey) || 0,
      });
      currentDate.setHours(currentDate.getHours() + 1);
    }
  } else if (frequency === "daily") {
    // Group by day
    const dailyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        const dateKey = formatLocalDate(date);
        dailyMap.set(
          dateKey,
          (dailyMap.get(dateKey) || 0) + (tx.amount || 0)
        );
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = formatLocalDate(currentDate);
      points.push({
        date: dateKey,
        value: dailyMap.get(dateKey) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
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
  } else {
    // Monthly
    const monthlyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.admin_date) {
        const date = new Date(tx.admin_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap.set(
          monthKey,
          (monthlyMap.get(monthKey) || 0) + (tx.amount || 0)
        );
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
      if (!points.find((p) => p.date === monthKey)) {
        points.push({
          date: monthKey,
          value: monthlyMap.get(monthKey) || 0,
        });
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
};

const getWeekKey = (date: Date): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
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
    // For hourly, only show data for one day (the end date)
    const singleDayStart = new Date(end);
    singleDayStart.setHours(0, 0, 0, 0);
    const singleDayEnd = new Date(end);
    singleDayEnd.setHours(23, 59, 59, 999);
    
    const hourlyMap = new Map<string, Set<string>>();
    transactions.forEach((tx) => {
      if (tx.admin_date && (tx.customer_id || tx.owner_email)) {
        const date = new Date(tx.admin_date);
        // Only include transactions from the selected day
        if (date >= singleDayStart && date <= singleDayEnd) {
          const hourKey = formatLocalHourKey(date);
          const customerKey = tx.customer_id || tx.owner_email || "";
          if (!hourlyMap.has(hourKey)) {
            hourlyMap.set(hourKey, new Set());
          }
          hourlyMap.get(hourKey)!.add(customerKey);
        }
      }
    });

    // Generate all 24 hours for the selected day
    const currentDate = new Date(singleDayStart);
    while (currentDate <= singleDayEnd) {
      const hourKey = formatLocalHourKey(currentDate);
      points.push({
        date: hourKey,
        value: hourlyMap.get(hourKey)?.size || 0,
      });
      currentDate.setHours(currentDate.getHours() + 1);
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

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = formatLocalDate(currentDate);
      points.push({
        date: dateKey,
        value: dailyMap.get(dateKey)?.size || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
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
  } else {
    // Monthly
    const monthlyMap = new Map<string, Set<string>>();
    transactions.forEach((tx) => {
      if (tx.admin_date && (tx.customer_id || tx.owner_email)) {
        const date = new Date(tx.admin_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const customerKey = tx.customer_id || tx.owner_email || "";
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, new Set());
        }
        monthlyMap.get(monthKey)!.add(customerKey);
      }
    });

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
      if (!points.find((p) => p.date === monthKey)) {
        points.push({
          date: monthKey,
          value: monthlyMap.get(monthKey)?.size || 0,
        });
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
};

export const getAnalytics = async (
  dateRange: string = "last_7_days",
  frequency: string = "daily",
  customStart?: Date,
  customEnd?: Date,
  compareOption: string = "previous_period"
): Promise<AnalyticsResponse> => {
  try {
    const ranges = calculateDateRange(dateRange, frequency, customStart, customEnd, compareOption);

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

    // Calculate Gross Volume (sum of all succeeded transactions)
    const currentGrossVolume = currentTransactions
      .filter((tx) => tx.status === "succeeded")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const previousGrossVolume = previousTransactions
      .filter((tx) => tx.status === "succeeded")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const grossVolumeChange = currentGrossVolume - previousGrossVolume;
    const grossVolumeChangePercent =
      previousGrossVolume !== 0
        ? (grossVolumeChange / previousGrossVolume) * 100
        : currentGrossVolume !== 0
        ? 100
        : 0;

    // Calculate Net Volume (gross volume minus refunded transactions)
    const currentRefundedAmount = currentTransactions
      .filter((tx) => tx.status === "refunded")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const previousRefundedAmount = previousTransactions
      .filter((tx) => tx.status === "refunded")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const currentNetVolume = currentGrossVolume - currentRefundedAmount;
    const previousNetVolume = previousGrossVolume - previousRefundedAmount;

    const netVolumeChange = currentNetVolume - previousNetVolume;
    const netVolumeChangePercent =
      previousNetVolume !== 0
        ? (netVolumeChange / previousNetVolume) * 100
        : currentNetVolume !== 0
        ? 100
        : 0;

    // Get recent payments (succeeded transactions, latest first)
    const payments = currentTransactions
      .filter((tx) => tx.status === "succeeded")
      .slice(0, 10)
      .reverse();

    // Get failed payments
    const failedPayments = currentTransactions.filter(
      (tx) => tx.status === "failed"
    );

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
    const newCustomersCount = Array.from(currentCustomerSet).filter(
      (customer) => !previousCustomerSet.has(customer)
    ).length;

    const previousNewCustomersCount = Array.from(previousCustomerSet).length;
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

    const topCustomersBySpend = Array.from(customerSpendMap.values())
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);

    // Generate time series data
    const currentSucceededTransactions = currentTransactions.filter(
      (tx) => tx.status === "succeeded"
    );
    const previousSucceededTransactions = previousTransactions.filter(
      (tx) => tx.status === "succeeded"
    );

    const grossVolumeTimeSeries = {
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

    const netVolumeTimeSeries = {
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

    const newCustomersTimeSeries = {
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
      topCustomersBySpend,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error calculating analytics:", error);
    throw new AppError("Failed to calculate analytics", 500);
  }
};








