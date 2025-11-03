import { Request, Response, NextFunction } from "express";
import {
  getAnalyticsSnapshot,
  createOrUpdateAnalyticsSnapshot,
  deleteAnalyticsSnapshot,
  getAnalyticsSnapshotByDateRange,
} from "../services/analytics-snapshot.services";
import { asyncHandler } from "../middleware/error.middleware";

export const getSnapshot = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const date = req.query.date as string;
    const metric = req.query.metric as string | undefined;

    if (!date) {
      return res.status(400).json({
        status: "error",
        message: "Date parameter is required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const snapshots = await getAnalyticsSnapshot(dateObj, metric);

    return res.status(200).json({
      status: "success",
      data: snapshots,
    });
  }
);

export const createOrUpdateSnapshot = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date, metric, value, source, hourlyBreakdown, notes, updatedBy } =
      req.body;

    if (!date || !metric || value === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Date, metric, and value are required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const snapshot = await createOrUpdateAnalyticsSnapshot(
      dateObj,
      metric,
      value,
      source || "manual",
      hourlyBreakdown,
      notes,
      updatedBy
    );

    return res.status(200).json({
      status: "success",
      data: snapshot,
    });
  }
);

export const deleteSnapshot = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date, metric } = req.query;

    if (!date || !metric) {
      return res.status(400).json({
        status: "error",
        message: "Date and metric parameters are required",
      });
    }

    const dateObj = new Date(date as string);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    await deleteAnalyticsSnapshot(dateObj, metric as string);

    return res.status(200).json({
      status: "success",
      message: "Analytics snapshot deleted successfully",
    });
  }
);

export const getSnapshotsByRange = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate, metric } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const snapshots = await getAnalyticsSnapshotByDateRange(
      start,
      end,
      metric as string | undefined
    );

    return res.status(200).json({
      status: "success",
      data: snapshots,
    });
  }
);



