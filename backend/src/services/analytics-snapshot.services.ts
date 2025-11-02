import { AnalyticsSnapshot, IAnalyticsSnapshot } from "../models/analytics-snapshot.model";
import { AppError } from "../middleware/error.middleware";

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
    // Normalize date to start of day
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const snapshot = await AnalyticsSnapshot.findOneAndUpdate(
      { date: normalizedDate, metric },
      {
        value,
        source,
        hourlyBreakdown: hourlyBreakdown || {},
        notes: notes || "",
        updatedBy,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return snapshot;
  } catch (error: any) {
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
    normalizedDate.setHours(0, 0, 0, 0);

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
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

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


