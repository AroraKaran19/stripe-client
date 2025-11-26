import { Request, Response, NextFunction } from "express";
import {
  getNewCustomersCardByDate,
  getNewCustomersCardByDateRange,
  createOrUpdateNewCustomersCard,
  deleteNewCustomersCard,
} from "../services/new-customers-card.services";
import { asyncHandler } from "../middleware/error.middleware";

export const getNewCustomersCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const date = req.query.date as string;

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

    const card = await getNewCustomersCardByDate(dateObj);

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const getNewCustomersCardRange = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

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

    const cards = await getNewCustomersCardByDateRange(start, end);

    return res.status(200).json({
      status: "success",
      data: cards,
    });
  }
);

export const createOrUpdateNewCustomersCardHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date, count, change, changePercent, notes, updatedBy } = req.body;

    if (!date || count === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Date and count are required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const card = await createOrUpdateNewCustomersCard(dateObj, {
      count,
      change: change || 0,
      changePercent: changePercent || 0,
      notes,
      updatedBy,
    });

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const deleteNewCustomersCardHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        status: "error",
        message: "Date parameter is required",
      });
    }

    const dateObj = new Date(date as string);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    await deleteNewCustomersCard(dateObj);

    return res.status(200).json({
      status: "success",
      message: "New customers card deleted successfully",
    });
  }
);
