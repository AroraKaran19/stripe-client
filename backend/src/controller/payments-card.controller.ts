import { Request, Response, NextFunction } from "express";
import {
  getPaymentsCardByDate,
  getPaymentsCardByDateRange,
  createOrUpdatePaymentsCard,
  deletePaymentsCard,
} from "../services/payments-card.services";
import { asyncHandler } from "../middleware/error.middleware";

export const getPaymentsCard = asyncHandler(
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

    const card = await getPaymentsCardByDate(dateObj);

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const getPaymentsCardRange = asyncHandler(
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

    const cards = await getPaymentsCardByDateRange(start, end);

    return res.status(200).json({
      status: "success",
      data: cards,
    });
  }
);

export const createOrUpdatePaymentsCardHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date, transactions, totalPayments, successfulPayments, failedPayments, averagePaymentAmount, notes, updatedBy } =
      req.body;

    if (!date || totalPayments === undefined || successfulPayments === undefined || failedPayments === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Date, totalPayments, successfulPayments, and failedPayments are required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const card = await createOrUpdatePaymentsCard(dateObj, {
      transactions: transactions || [],
      totalPayments,
      successfulPayments,
      failedPayments,
      averagePaymentAmount: averagePaymentAmount || 0,
      notes,
      updatedBy,
    });

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const deletePaymentsCardHandler = asyncHandler(
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

    await deletePaymentsCard(dateObj);

    return res.status(200).json({
      status: "success",
      message: "Payments card deleted successfully",
    });
  }
);
