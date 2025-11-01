import type { Transaction } from "../types/transaction";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface TransactionsResponse {
  status: string;
  data: {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface TransactionResponse {
  status: string;
  data: Transaction;
}

export const transactionService = {
  getAll: async (
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>
  ): Promise<TransactionsResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    // Add filters to query params
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/transactions?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }
    return response.json();
  },

  getById: async (id: string): Promise<TransactionResponse> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch transaction");
    }
    return response.json();
  },

  create: async (data: Partial<Transaction>): Promise<TransactionResponse> => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create transaction");
    }
    return response.json();
  },

  update: async (
    id: string,
    data: Partial<Transaction>
  ): Promise<TransactionResponse> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to update transaction");
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete transaction");
    }
  },
};
