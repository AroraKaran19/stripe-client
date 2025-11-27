const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
}

export interface MetricData {
  current: number;
  previous: number;
  timeSeries: {
    current: TimeSeriesData[];
    previous: TimeSeriesData[];
  };
}

export interface TopSectionCardData {
  _id?: string;
  date: Date;
  grossVolume: MetricData;
  netVolume: MetricData;
  newCustomers: MetricData;
  successfulPayments: MetricData;
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
  createdAt?: string;
}

export interface TopSectionCardResponse {
  status: string;
  data: TopSectionCardData | TopSectionCardData[];
}

export const topSectionCardService = {
  getByDate: async (date: Date): Promise<TopSectionCardResponse> => {
    const dateStr = formatDateString(date);
    const response = await fetch(
      `${API_BASE_URL}/top-section-card?date=${dateStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch top section card data");
    }
    return response.json();
  },

  getByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<TopSectionCardResponse> => {
    const startStr = formatDateString(startDate);
    const endStr = formatDateString(endDate);
    const response = await fetch(
      `${API_BASE_URL}/top-section-card/range?startDate=${startStr}&endDate=${endStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch top section card data");
    }
    return response.json();
  },

  createOrUpdate: async (
    date: Date,
    data: Omit<TopSectionCardData, "_id" | "createdAt" | "updatedAt" | "date">
  ): Promise<TopSectionCardResponse> => {
    const dateStr = formatDateString(date);

    const response = await fetch(`${API_BASE_URL}/top-section-card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: dateStr,
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create/update top section card");
    }
    return response.json();
  },

  delete: async (date: Date): Promise<void> => {
    const dateStr = formatDateString(date);

    const response = await fetch(
      `${API_BASE_URL}/top-section-card?date=${dateStr}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete top section card");
    }
  },
};
