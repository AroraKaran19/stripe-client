const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper to format date as YYYY-MM-DD without timezone issues
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

export interface NetVolumeCardData {
  _id?: string;
  date: Date;
  value: number;
  change: number;
  changePercent: number;
  timeSeries?: TimeSeriesData[]; // Hourly breakdown
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
  createdAt?: string;
}

export interface NetVolumeCardResponse {
  status: string;
  data: NetVolumeCardData | NetVolumeCardData[];
}

export const netVolumeCardService = {
  getByDate: async (date: Date): Promise<NetVolumeCardResponse> => {
    const dateStr = formatDateString(date);
    const response = await fetch(
      `${API_BASE_URL}/net-volume-card?date=${dateStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch net volume card data");
    }
    return response.json();
  },

  getByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<NetVolumeCardResponse> => {
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];
    const response = await fetch(
      `${API_BASE_URL}/net-volume-card/range?startDate=${startStr}&endDate=${endStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch net volume card data");
    }
    return response.json();
  },

  createOrUpdate: async (
    date: Date,
    data: Omit<NetVolumeCardData, "_id" | "createdAt" | "updatedAt" | "date">
  ): Promise<NetVolumeCardResponse> => {
    const dateStr = formatDateString(date);

    const response = await fetch(`${API_BASE_URL}/net-volume-card`, {
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
      throw new Error("Failed to create/update net volume card");
    }
    return response.json();
  },

  delete: async (date: Date): Promise<void> => {
    const dateStr = formatDateString(date);

    const response = await fetch(
      `${API_BASE_URL}/net-volume-card?date=${dateStr}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete net volume card");
    }
  },
};
