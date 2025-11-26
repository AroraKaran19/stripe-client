const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface TopCustomer {
  customerId?: string;
  email?: string;
  name?: string;
  totalSpend: number;
  transactionCount: number;
}

export interface TopCustomersCardData {
  _id?: string;
  date: Date;
  customers: TopCustomer[];
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
  createdAt?: string;
}

export interface TopCustomersCardResponse {
  status: string;
  data: TopCustomersCardData | TopCustomersCardData[];
}

export const topCustomersCardService = {
  getByDate: async (date: Date): Promise<TopCustomersCardResponse> => {
    const dateStr = date.toISOString().split("T")[0];
    const response = await fetch(
      `${API_BASE_URL}/top-customers-card?date=${dateStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch top customers card data");
    }
    return response.json();
  },

  getByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<TopCustomersCardResponse> => {
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];
    const response = await fetch(
      `${API_BASE_URL}/top-customers-card/range?startDate=${startStr}&endDate=${endStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch top customers card data");
    }
    return response.json();
  },

  createOrUpdate: async (
    date: Date,
    data: Omit<TopCustomersCardData, "_id" | "createdAt" | "updatedAt" | "date">
  ): Promise<TopCustomersCardResponse> => {
    const dateStr = date.toISOString().split("T")[0];

    const response = await fetch(`${API_BASE_URL}/top-customers-card`, {
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
      throw new Error("Failed to create/update top customers card");
    }
    return response.json();
  },

  delete: async (date: Date): Promise<void> => {
    const dateStr = date.toISOString().split("T")[0];

    const response = await fetch(
      `${API_BASE_URL}/top-customers-card?date=${dateStr}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete top customers card");
    }
  },
};
