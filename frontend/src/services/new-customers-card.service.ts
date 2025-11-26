const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface NewCustomersCardData {
  _id?: string;
  date: Date;
  count: number;
  change: number;
  changePercent: number;
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
  createdAt?: string;
}

export interface NewCustomersCardResponse {
  status: string;
  data: NewCustomersCardData | NewCustomersCardData[];
}

export const newCustomersCardService = {
  getByDate: async (date: Date): Promise<NewCustomersCardResponse> => {
    const dateStr = date.toISOString().split("T")[0];
    const response = await fetch(
      `${API_BASE_URL}/new-customers-card?date=${dateStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch new customers card data");
    }
    return response.json();
  },

  getByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<NewCustomersCardResponse> => {
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];
    const response = await fetch(
      `${API_BASE_URL}/new-customers-card/range?startDate=${startStr}&endDate=${endStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch new customers card data");
    }
    return response.json();
  },

  createOrUpdate: async (
    date: Date,
    data: Omit<NewCustomersCardData, "_id" | "createdAt" | "updatedAt" | "date">
  ): Promise<NewCustomersCardResponse> => {
    const dateStr = date.toISOString().split("T")[0];

    const response = await fetch(`${API_BASE_URL}/new-customers-card`, {
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
      throw new Error("Failed to create/update new customers card");
    }
    return response.json();
  },

  delete: async (date: Date): Promise<void> => {
    const dateStr = date.toISOString().split("T")[0];

    const response = await fetch(
      `${API_BASE_URL}/new-customers-card?date=${dateStr}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete new customers card");
    }
  },
};
