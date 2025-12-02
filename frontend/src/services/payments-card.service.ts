const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper to format date as YYYY-MM-DD without timezone issues
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface PaymentTransaction {
  id: string;
  description: string;
  date: string; // ISO date string
  amount: number;
  status: "successful" | "failed";
}

export interface PaymentsCardData {
  _id?: string;
  date: Date;
  transactions: PaymentTransaction[];
  // Auto-calculated fields
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  averagePaymentAmount: number;
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
  createdAt?: string;
}

export interface PaymentsCardResponse {
  status: string;
  data: PaymentsCardData | PaymentsCardData[];
}

export const paymentsCardService = {
  getByDate: async (date: Date): Promise<PaymentsCardResponse> => {
    const dateStr = formatDateString(date);
    const response = await fetch(
      `${API_BASE_URL}/payments-card?date=${dateStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch payments card data");
    }
    return response.json();
  },

  getByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<PaymentsCardResponse> => {
    const startStr = formatDateString(startDate);
    const endStr = formatDateString(endDate);
    const response = await fetch(
      `${API_BASE_URL}/payments-card/range?startDate=${startStr}&endDate=${endStr}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch payments card data");
    }
    return response.json();
  },

  createOrUpdate: async (
    date: Date,
    data: Omit<PaymentsCardData, "_id" | "createdAt" | "updatedAt" | "date">
  ): Promise<PaymentsCardResponse> => {
    const dateStr = formatDateString(date);

    const response = await fetch(`${API_BASE_URL}/payments-card`, {
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
      throw new Error("Failed to create/update payments card");
    }
    return response.json();
  },

  delete: async (date: Date): Promise<void> => {
    const dateStr = formatDateString(date);

    const response = await fetch(
      `${API_BASE_URL}/payments-card?date=${dateStr}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete payments card");
    }
  },
};
