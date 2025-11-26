const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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
    const dateStr = date.toISOString().split("T")[0];
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
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];
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
    const dateStr = date.toISOString().split("T")[0];

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
    const dateStr = date.toISOString().split("T")[0];

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
