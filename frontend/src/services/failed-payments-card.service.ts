const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper to format date as YYYY-MM-DD without timezone issues
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface FailedPaymentTransaction {
  id: string;
  description: string;
  date: string; // ISO date string
  amount: number;
  reason?: string; // Failure reason
}

export interface FailedPaymentsCardData {
  _id?: string;
  date: Date;
  transactions: FailedPaymentTransaction[];
  // Auto-calculated fields
  count: number;
  totalAmount: number;
  averageAmount: number;
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
  createdAt?: string;
}

export interface FailedPaymentsCardResponse {
  status: string;
  data: FailedPaymentsCardData | FailedPaymentsCardData[];
}

export const failedPaymentsCardService = {
  getByDate: async (date: Date): Promise<FailedPaymentsCardResponse> => {
    const dateStr = formatDateString(date);
    const response = await fetch(
      `${API_BASE_URL}/failed-payments-card?date=${dateStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch failed payments card data");
    }
    return response.json();
  },

  getByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<FailedPaymentsCardResponse> => {
    const startStr = formatDateString(startDate);
    const endStr = formatDateString(endDate);
    const response = await fetch(
      `${API_BASE_URL}/failed-payments-card/range?startDate=${startStr}&endDate=${endStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch failed payments card data");
    }
    return response.json();
  },

  createOrUpdate: async (
    date: Date,
    data: Omit<FailedPaymentsCardData, "_id" | "createdAt" | "updatedAt" | "date">
  ): Promise<FailedPaymentsCardResponse> => {
    const dateStr = formatDateString(date);

    const response = await fetch(`${API_BASE_URL}/failed-payments-card`, {
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
      throw new Error("Failed to create/update failed payments card");
    }
    return response.json();
  },

  delete: async (date: Date): Promise<void> => {
    const dateStr = formatDateString(date);

    const response = await fetch(
      `${API_BASE_URL}/failed-payments-card?date=${dateStr}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete failed payments card");
    }
  },
};
