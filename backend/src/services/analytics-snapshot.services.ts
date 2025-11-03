import { AnalyticsSnapshot, IAnalyticsSnapshot } from "../models/analytics-snapshot.model";
import { Transaction } from "../models/transaction.model";
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

    // Auto-calculate hourly breakdown (and value) if not provided
    let computedHourly: { [hour: number]: number } | undefined = hourlyBreakdown;
    let computedValue: number | undefined = undefined;

    if (!computedHourly) {
      // Build hourly from transactions for the given date and metric
      const start = new Date(normalizedDate);
      const end = new Date(normalizedDate);
      end.setHours(23, 59, 59, 999);

      const txs = await Transaction.find({
        admin_date: { $gte: start, $lte: end },
      }).sort({ admin_date: 1 });

      const map = new Map<number, number>(); // hour -> value

      const inc = (hour: number, delta: number) => {
        map.set(hour, (map.get(hour) || 0) + delta);
      };

      txs.forEach((tx) => {
        if (!tx.admin_date) return;
        const h = new Date(tx.admin_date).getHours();
        switch (metric) {
          case "gross_volume":
            if (tx.status === "succeeded") inc(h, tx.amount || 0);
            break;
          case "net_volume":
            if (tx.status === "succeeded") inc(h, tx.amount || 0);
            if (tx.status === "refunded") inc(h, -(tx.amount || 0));
            break;
          case "new_customers":
            // Count unique customers per hour
            if (tx.customer_id || tx.owner_email) {
              // Use fractional increments via set of seen keys per hour
              // We'll aggregate via a temporary map of sets
            }
            break;
          case "successful_payments":
            if (tx.status === "succeeded") inc(h, 1);
            break;
          case "failed_payments":
            if (tx.status === "failed") inc(h, 1);
            break;
          default:
            break;
        }
      });

      // Special handling for new_customers (unique per hour)
      if (metric === "new_customers") {
        const hourToSet = new Map<number, Set<string>>();
        txs.forEach((tx) => {
          if (!tx.admin_date) return;
          const h = new Date(tx.admin_date).getHours();
          const key = tx.customer_id || tx.owner_email;
          if (!key) return;
          if (!hourToSet.has(h)) hourToSet.set(h, new Set());
          hourToSet.get(h)!.add(key);
        });
        map.clear();
        for (let hour = 0; hour < 24; hour++) {
          map.set(hour, hourToSet.get(hour)?.size || 0);
        }
      } else {
        // Ensure all 24 hours exist
        for (let hour = 0; hour < 24; hour++) {
          if (!map.has(hour)) map.set(hour, 0);
        }
      }

      computedHourly = Object.fromEntries(Array.from(map.entries()));
      computedValue = Array.from(map.values()).reduce((a, b) => a + b, 0);
    }

    const snapshot = await AnalyticsSnapshot.findOneAndUpdate(
      { date: normalizedDate, metric },
      {
        value: computedValue !== undefined ? computedValue : value,
        source,
        hourlyBreakdown: computedHourly || {},
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



