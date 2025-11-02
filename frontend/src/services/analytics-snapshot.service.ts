const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface AnalyticsSnapshot {
  _id?: string;
  date: string;
  metric: string;
  value: number;
  source: "calculated" | "manual";
  hourlyBreakdown?: { [hour: number]: number };
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
  createdAt?: string;
}

export interface AnalyticsSnapshotResponse {
  status: string;
  data: AnalyticsSnapshot[];
}

export interface SingleSnapshotResponse {
  status: string;
  data: AnalyticsSnapshot;
}

export const analyticsSnapshotService = {
  // Get snapshots for a specific date
  getByDate: async (
    date: Date,
    metric?: string
  ): Promise<AnalyticsSnapshotResponse> => {
    const params = new URLSearchParams();
    const dateStr = date.toISOString().split("T")[0];
    params.append("date", dateStr);
    if (metric) {
      params.append("metric", metric);
    }

    const response = await fetch(
      `${API_BASE_URL}/analytics-snapshots?${params}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch analytics snapshots");
    }
    return response.json();
  },

  // Create or update a snapshot
  createOrUpdate: async (
    date: Date,
    metric: string,
    value: number,
    source: "calculated" | "manual" = "manual",
    hourlyBreakdown?: { [hour: number]: number },
    notes?: string
  ): Promise<SingleSnapshotResponse> => {
    const dateStr = date.toISOString().split("T")[0];

    const response = await fetch(`${API_BASE_URL}/analytics-snapshots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: dateStr,
        metric,
        value,
        source,
        hourlyBreakdown,
        notes,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create/update analytics snapshot");
    }
    return response.json();
  },

  // Delete a snapshot
  delete: async (date: Date, metric: string): Promise<void> => {
    const params = new URLSearchParams();
    const dateStr = date.toISOString().split("T")[0];
    params.append("date", dateStr);
    params.append("metric", metric);

    const response = await fetch(
      `${API_BASE_URL}/analytics-snapshots?${params}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete analytics snapshot");
    }
  },

  // Get snapshots by date range
  getByDateRange: async (
    startDate: Date,
    endDate: Date,
    metric?: string
  ): Promise<AnalyticsSnapshotResponse> => {
    const params = new URLSearchParams();
    params.append("startDate", startDate.toISOString().split("T")[0]);
    params.append("endDate", endDate.toISOString().split("T")[0]);
    if (metric) {
      params.append("metric", metric);
    }

    const response = await fetch(
      `${API_BASE_URL}/analytics-snapshots/range?${params}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch analytics snapshots");
    }
    return response.json();
  },
};

