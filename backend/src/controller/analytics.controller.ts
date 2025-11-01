import { Request, Response, NextFunction } from "express";
import { getAnalytics } from "../services/analytics.services";
import { asyncHandler } from "../middleware/error.middleware";

export const getAnalyticsHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const dateRange = (req.query.dateRange as string) || "last_7_days";
    const frequency = (req.query.frequency as string) || "daily";
    const compareOption = (req.query.compareOption as string) || "previous_period";
    
    // Support custom date ranges
    let customStart: Date | undefined;
    let customEnd: Date | undefined;
    
    if (req.query.startDate) {
      customStart = new Date(req.query.startDate as string);
      customStart.setHours(0, 0, 0, 0);
    }
    
    if (req.query.endDate) {
      customEnd = new Date(req.query.endDate as string);
      customEnd.setHours(23, 59, 59, 999);
    }

    const analytics = await getAnalytics(
      dateRange,
      frequency,
      customStart,
      customEnd,
      compareOption
    );

    res.status(200).json({
      status: "success",
      data: analytics,
    });
  }
);

