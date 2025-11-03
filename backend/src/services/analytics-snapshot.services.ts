import { AnalyticsSnapshot, IAnalyticsSnapshot } from "../models/analytics-snapshot.model";
import { AppError } from "../middleware/error.middleware";
import { getUTCStartOfDay } from "../utils/dateUtils";

export const getAnalyticsSnapshot = async (
  date: Date,
  metric?: string
): Promise<IAnalyticsSnapshot[]> => {
  try {
    const query: any = { date };
    if (metric) {
      query.metric = metric;
    }

    const snapshots = await AnalyticsSnapshot.find(query).sort({ metric: 1 });

    return snapshots;
  } catch (error) {
    throw new AppError("Failed to fetch analytics snapshot", 500);
  }
};

export const createOrUpdateAnalyticsSnapshot = async (
  date: Date,
  metric: string,
  value: number,
  source: "calculated" | "manual" = "manual",
  hourlyBreakdown?: { [hour: number]: number },
  notes?: string,
  updatedBy?: string
): Promise<IAnalyticsSnapshot> => {
  try {
    // Normalize date to UTC start of day
    const utcStartOfDay = getUTCStartOfDay(date);

    // Find existing snapshot
    const existingSnapshot = await AnalyticsSnapshot.findOne({
      date: utcStartOfDay,
      metric,
    });

    // Calculate new values by ADDING to existing
    let finalValue = value;
    let finalHourlyBreakdown: { [hour: number]: number } = {};

    if (existingSnapshot) {
      // ADD to existing value
      finalValue = existingSnapshot.value + value;

      // MERGE hourly breakdowns
      // Convert existing Map to object if needed
      if (existingSnapshot.hourlyBreakdown) {
        // Convert Map to object
        const existingBreakdown: { [hour: number]: number } = {};
        if (existingSnapshot.hourlyBreakdown instanceof Map) {
          existingSnapshot.hourlyBreakdown.forEach((val, key) => {
            existingBreakdown[parseInt(key as any)] = val;
          });
        } else {
          Object.assign(existingBreakdown, existingSnapshot.hourlyBreakdown);
        }
        Object.assign(finalHourlyBreakdown, existingBreakdown);
      }

      if (hourlyBreakdown) {
        // Add new hourly values to existing
        for (let hour in hourlyBreakdown) {
          const h = parseInt(hour);
          finalHourlyBreakdown[h] = (finalHourlyBreakdown[h] || 0) + hourlyBreakdown[h];
        }
      }
    } else {
      // New snapshot - use provided values as-is
      if (hourlyBreakdown) {
        finalHourlyBreakdown = { ...hourlyBreakdown };
      } else {
        // If no hourly breakdown provided, create empty
        finalHourlyBreakdown = {};
      }
    }

    // Normalize hourly breakdown to ensure all 24 hours are present
    const normalizedHourlyBreakdown: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      normalizedHourlyBreakdown[i] = finalHourlyBreakdown[i] || 0;
    }

    // Update the snapshot
    const snapshot = await AnalyticsSnapshot.findOneAndUpdate(
      { date: utcStartOfDay, metric },
      {
        date: utcStartOfDay,
        metric,
        value: finalValue,
        source,
        hourlyBreakdown: normalizedHourlyBreakdown,
        notes: notes || "",
        updatedBy,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: false, // Disable validators to avoid issues with Map type
      }
    );

    if (!snapshot) {
      throw new Error("Failed to save snapshot - returned null");
    }

    return snapshot;
  } catch (error: any) {
    console.error("Analytics Snapshot Error Details:", {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });

    if (error.code === 11000) {
      // Duplicate key error - try again
      return createOrUpdateAnalyticsSnapshot(
        date,
        metric,
        value,
        source,
        hourlyBreakdown,
        notes,
        updatedBy
      );
    }
    throw new AppError("Failed to create/update analytics snapshot", 500);
  }
};

export const deleteAnalyticsSnapshot = async (
  date: Date,
  metric: string
): Promise<void> => {
  try {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const result = await AnalyticsSnapshot.deleteOne({
      date: normalizedDate,
      metric,
    });

    if (result.deletedCount === 0) {
      throw new AppError("Analytics snapshot not found", 404, "not_found");
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to delete analytics snapshot", 500);
  }
};

export const getAnalyticsSnapshotByDateRange = async (
  startDate: Date,
  endDate: Date,
  metric?: string
): Promise<IAnalyticsSnapshot[]> => {
  try {
    const start = new Date(startDate);
    // Use UTC methods to avoid timezone shift
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDate);
    // Use UTC methods to avoid timezone shift
    end.setUTCHours(23, 59, 59, 999);

    const query: any = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    if (metric) {
      query.metric = metric;
    }

    const snapshots = await AnalyticsSnapshot.find(query).sort({
      date: 1,
      metric: 1,
    });

    return snapshots;
  } catch (error) {
    throw new AppError("Failed to fetch analytics snapshots", 500);
  }
};



