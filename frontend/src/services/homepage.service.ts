const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper to format date as YYYY-MM-DD
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Type definitions
export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
}

export interface DateDataEntry {
  date: Date;
  data: any;
}

export interface TopSectionMetricData {
  current: number;
  previous: number;
  timeSeries: {
    current: TimeSeriesDataPoint[];
    previous: TimeSeriesDataPoint[];
  };
}

export interface HomepageData {
  _id?: string;
  username: string;
  default: boolean;
  businessName?: string;
  top_section_data: {
    "Gross Volume": DateDataEntry[];
    "Net Volume": DateDataEntry[];
    "New Customers": DateDataEntry[];
    "Successful Payments": DateDataEntry[];
  };
  "Payment Card": DateDataEntry[];
  "Gross Volume Card": DateDataEntry[];
  "Net Volume Card": DateDataEntry[];
  "Failed Payments Card": DateDataEntry[];
  "New Customers Card": DateDataEntry[];
  "Top Customers Card": DateDataEntry[];
  updatedBy?: string;
  updatedAt: string;
  createdAt?: string;
}

export interface HomepageResponse {
  status: string;
  data: HomepageData | DateDataEntry | DateDataEntry[];
  message?: string;
}

// Card names
export type CardName =
  | "Payment Card"
  | "Gross Volume Card"
  | "Net Volume Card"
  | "Failed Payments Card"
  | "New Customers Card"
  | "Top Customers Card";

// Top section metric names
export type TopSectionMetricName =
  | "Gross Volume"
  | "Net Volume"
  | "New Customers"
  | "Successful Payments";

export const homepageService = {
  /**
   * Get entire homepage data by username
   * If username is null, returns the default homepage
   */
  getHomepage: async (username: string | null = null): Promise<HomepageResponse> => {
    const url = username 
      ? `${API_BASE_URL}/homepage?username=${encodeURIComponent(username)}`
      : `${API_BASE_URL}/homepage`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch homepage data");
    }
    return response.json();
  },

  /**
   * Get specific card data by username, card name, and date
   * If username is null, uses the default homepage
   */
  getCard: async (
    username: string | null,
    cardName: CardName,
    date: Date
  ): Promise<HomepageResponse> => {
    const dateStr = formatDateString(date);
    const url = username
      ? `${API_BASE_URL}/homepage/card?username=${encodeURIComponent(
          username
        )}&cardName=${encodeURIComponent(cardName)}&date=${dateStr}`
      : `${API_BASE_URL}/homepage/card?cardName=${encodeURIComponent(cardName)}&date=${dateStr}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch card data");
    }
    return response.json();
  },

  /**
   * Get card data by date range
   */
  getCardRange: async (
    username: string,
    cardName: CardName,
    startDate: Date,
    endDate: Date
  ): Promise<HomepageResponse> => {
    const startStr = formatDateString(startDate);
    const endStr = formatDateString(endDate);
    const response = await fetch(
      `${API_BASE_URL}/homepage/card/range?username=${encodeURIComponent(
        username
      )}&cardName=${encodeURIComponent(cardName)}&startDate=${startStr}&endDate=${endStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch card data range");
    }
    return response.json();
  },

  /**
   * Get top section metric data
   * If username is null, uses the default homepage
   */
  getTopSectionMetric: async (
    username: string | null,
    metricName: TopSectionMetricName,
    date: Date
  ): Promise<HomepageResponse> => {
    const dateStr = formatDateString(date);
    const url = username
      ? `${API_BASE_URL}/homepage/top-section?username=${encodeURIComponent(
          username
        )}&metricName=${encodeURIComponent(metricName)}&date=${dateStr}`
      : `${API_BASE_URL}/homepage/top-section?metricName=${encodeURIComponent(metricName)}&date=${dateStr}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch top section metric data");
    }
    return response.json();
  },

  /**
   * Get top section metric data by date range
   */
  getTopSectionMetricRange: async (
    username: string,
    metricName: TopSectionMetricName,
    startDate: Date,
    endDate: Date
  ): Promise<HomepageResponse> => {
    const startStr = formatDateString(startDate);
    const endStr = formatDateString(endDate);
    const response = await fetch(
      `${API_BASE_URL}/homepage/top-section/range?username=${encodeURIComponent(
        username
      )}&metricName=${encodeURIComponent(
        metricName
      )}&startDate=${startStr}&endDate=${endStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch top section metric data range");
    }
    return response.json();
  },

  /**
   * Create or update card data
   */
  createOrUpdateCard: async (
    username: string,
    cardName: CardName,
    date: Date,
    data: any,
    updatedBy?: string
  ): Promise<HomepageResponse> => {
    const dateStr = formatDateString(date);
    const response = await fetch(`${API_BASE_URL}/homepage/card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        cardName,
        date: dateStr,
        data,
        updatedBy,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create/update card data");
    }
    return response.json();
  },

  /**
   * Create or update top section metric data
   */
  createOrUpdateTopSectionMetric: async (
    username: string,
    metricName: TopSectionMetricName,
    date: Date,
    data: TopSectionMetricData,
    updatedBy?: string
  ): Promise<HomepageResponse> => {
    const dateStr = formatDateString(date);
    const response = await fetch(`${API_BASE_URL}/homepage/top-section`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        metricName,
        date: dateStr,
        data,
        updatedBy,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create/update top section metric data");
    }
    return response.json();
  },

  /**
   * Delete card data
   */
  deleteCard: async (
    username: string,
    cardName: CardName,
    date: Date
  ): Promise<void> => {
    const dateStr = formatDateString(date);
    const response = await fetch(
      `${API_BASE_URL}/homepage/card?username=${encodeURIComponent(
        username
      )}&cardName=${encodeURIComponent(cardName)}&date=${dateStr}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete card data");
    }
  },

  /**
   * Delete top section metric data
   */
  deleteTopSectionMetric: async (
    username: string,
    metricName: TopSectionMetricName,
    date: Date
  ): Promise<void> => {
    const dateStr = formatDateString(date);
    const response = await fetch(
      `${API_BASE_URL}/homepage/top-section?username=${encodeURIComponent(
        username
      )}&metricName=${encodeURIComponent(metricName)}&date=${dateStr}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete top section metric data");
    }
  },

  /**
   * Get all homepages
   */
  getAllHomepages: async (): Promise<HomepageResponse> => {
    const response = await fetch(`${API_BASE_URL}/homepage/all`);
    if (!response.ok) {
      throw new Error("Failed to fetch all homepages");
    }
    return response.json();
  },

  /**
   * Set a homepage as default
   */
  setDefaultHomepage: async (username: string): Promise<HomepageResponse> => {
    const response = await fetch(`${API_BASE_URL}/homepage/set-default`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error("Failed to set default homepage");
    }
    return response.json();
  },

  /**
   * Get the business name to display for a username (default homepage if null)
   */
  getBusinessName: async (username: string | null = null): Promise<string> => {
    const url = username
      ? `${API_BASE_URL}/homepage/business-name?username=${encodeURIComponent(username)}`
      : `${API_BASE_URL}/homepage/business-name`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch business name");
    }
    const result = await response.json();
    return result.data.businessName;
  },

  /**
   * Update a homepage's business name
   */
  updateBusinessName: async (
    username: string,
    businessName: string
  ): Promise<HomepageResponse> => {
    const response = await fetch(`${API_BASE_URL}/homepage/business-name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, businessName }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Failed to update business name");
    }
    return response.json();
  },

  /**
   * Delete entire homepage
   */
  deleteHomepage: async (username: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/homepage?username=${encodeURIComponent(username)}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete homepage");
    }
  },
};

