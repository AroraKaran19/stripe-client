import { Request, Response, NextFunction } from "express";
import {
  getTopCustomersCardByDate,
  getTopCustomersCardByDateRange,
  createOrUpdateTopCustomersCard,
  deleteTopCustomersCard,
} from "../services/top-customers-card.services";
import { asyncHandler } from "../middleware/error.middleware";

export const getTopCustomersCard = asyncHandler(
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

    const card = await getTopCustomersCardByDate(dateObj);

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const getTopCustomersCardRange = asyncHandler(
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

    const cards = await getTopCustomersCardByDateRange(start, end);

    return res.status(200).json({
      status: "success",
      data: cards,
    });
  }
);

export const createOrUpdateTopCustomersCardHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date, customers, notes, updatedBy } = req.body;

    if (!date || !customers) {
      return res.status(400).json({
        status: "error",
        message: "Date and customers array are required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const card = await createOrUpdateTopCustomersCard(dateObj, {
      customers,
      notes,
      updatedBy,
    });

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const deleteTopCustomersCardHandler = asyncHandler(
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

    await deleteTopCustomersCard(dateObj);

    return res.status(200).json({
      status: "success",
      message: "Top customers card deleted successfully",
    });
  }
);
