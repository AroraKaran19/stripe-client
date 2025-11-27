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

export interface GrossVolumeCardData {
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

export interface GrossVolumeCardResponse {
  status: string;
  data: GrossVolumeCardData | GrossVolumeCardData[];
}

export const grossVolumeCardService = {
  getByDate: async (date: Date): Promise<GrossVolumeCardResponse> => {
    const dateStr = formatDateString(date);
    const response = await fetch(
      `${API_BASE_URL}/gross-volume-card?date=${dateStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch gross volume card data");
    }
    return response.json();
  },

  getByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<GrossVolumeCardResponse> => {
    const startStr = formatDateString(startDate);
    const endStr = formatDateString(endDate);
    const response = await fetch(
      `${API_BASE_URL}/gross-volume-card/range?startDate=${startStr}&endDate=${endStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch gross volume card data");
    }
    return response.json();
  },

  createOrUpdate: async (
    date: Date,
    data: Omit<GrossVolumeCardData, "_id" | "createdAt" | "updatedAt" | "date">
  ): Promise<GrossVolumeCardResponse> => {
    const dateStr = formatDateString(date);

    const response = await fetch(`${API_BASE_URL}/gross-volume-card`, {
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
      throw new Error("Failed to create/update gross volume card");
    }
    return response.json();
  },

  delete: async (date: Date): Promise<void> => {
    const dateStr = formatDateString(date);

    const response = await fetch(
      `${API_BASE_URL}/gross-volume-card?date=${dateStr}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete gross volume card");
    }
  },
};
