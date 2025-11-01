import type { Transaction } from "../types/transaction";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface AnalyticsData {
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
  payments: Transaction[];
  failedPayments: Transaction[];
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
  updatedAt: string;
}

export interface AnalyticsResponse {
  status: string;
  data: AnalyticsData;
}

export const analyticsService = {
  getAnalytics: async (
    dateRange: string = "last_7_days",
    frequency: string = "daily",
    customStart?: Date,
    customEnd?: Date,
    compareOption: string = "previous_period"
  ): Promise<AnalyticsResponse> => {
    const params = new URLSearchParams();
    params.append("dateRange", dateRange);
    params.append("frequency", frequency);
    params.append("compareOption", compareOption);

    if (customStart) {
      params.append("startDate", customStart.toISOString());
    }
    if (customEnd) {
      params.append("endDate", customEnd.toISOString());
    }

    const response = await fetch(`${API_BASE_URL}/analytics?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch analytics");
    }
    return response.json();
  },
};

