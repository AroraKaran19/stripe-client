import { Request, Response, NextFunction } from "express";
import {
  getFailedPaymentsCardByDate,
  getFailedPaymentsCardByDateRange,
  createOrUpdateFailedPaymentsCard,
  deleteFailedPaymentsCard,
} from "../services/failed-payments-card.services";
import { asyncHandler } from "../middleware/error.middleware";

export const getFailedPaymentsCard = asyncHandler(
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

    const card = await getFailedPaymentsCardByDate(dateObj);

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const getFailedPaymentsCardRange = asyncHandler(
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

    const cards = await getFailedPaymentsCardByDateRange(start, end);

    return res.status(200).json({
      status: "success",
      data: cards,
    });
  }
);

export const createOrUpdateFailedPaymentsCardHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date, transactions, count, totalAmount, averageAmount, notes, updatedBy } = req.body;

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

    const card = await createOrUpdateFailedPaymentsCard(dateObj, {
      transactions: transactions || [],
      count,
      totalAmount: totalAmount || 0,
      averageAmount: averageAmount || 0,
      notes,
      updatedBy,
    });

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const deleteFailedPaymentsCardHandler = asyncHandler(
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

    await deleteFailedPaymentsCard(dateObj);

    return res.status(200).json({
      status: "success",
      message: "Failed payments card deleted successfully",
    });
  }
);
