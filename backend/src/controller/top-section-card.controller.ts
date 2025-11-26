import { Request, Response, NextFunction } from "express";
import {
  getTopSectionCardByDate,
  getTopSectionCardByDateRange,
  createOrUpdateTopSectionCard,
  deleteTopSectionCard,
} from "../services/top-section-card.services";
import { asyncHandler } from "../middleware/error.middleware";

export const getTopSectionCard = asyncHandler(
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

    const card = await getTopSectionCardByDate(dateObj);

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const getTopSectionCardRange = asyncHandler(
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

    const cards = await getTopSectionCardByDateRange(start, end);

    return res.status(200).json({
      status: "success",
      data: cards,
    });
  }
);

export const createOrUpdateTopSectionCardHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date, grossVolume, netVolume, newCustomers, successfulPayments, notes, updatedBy } = req.body;

    if (!date || !grossVolume || !netVolume || !newCustomers || !successfulPayments) {
      return res.status(400).json({
        status: "error",
        message: "Date and all metric data are required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const card = await createOrUpdateTopSectionCard(dateObj, {
      grossVolume,
      netVolume,
      newCustomers,
      successfulPayments,
      notes,
      updatedBy,
    });

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const deleteTopSectionCardHandler = asyncHandler(
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

    await deleteTopSectionCard(dateObj);

    return res.status(200).json({
      status: "success",
      message: "Top section card deleted successfully",
    });
  }
);
