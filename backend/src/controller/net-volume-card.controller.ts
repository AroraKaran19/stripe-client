import { Request, Response, NextFunction } from "express";
import {
  getNetVolumeCardByDate,
  getNetVolumeCardByDateRange,
  createOrUpdateNetVolumeCard,
  deleteNetVolumeCard,
} from "../services/net-volume-card.services";
import { asyncHandler } from "../middleware/error.middleware";

export const getNetVolumeCard = asyncHandler(
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

    const card = await getNetVolumeCardByDate(dateObj);

    return res.status(200).json({
      status: "success",
      data: card,
    });
  }
);

export const getNetVolumeCardRange = asyncHandler(
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

    const cards = await getNetVolumeCardByDateRange(start, end);

    return res.status(200).json({
      status: "success",
      data: cards,
    });
  }
);

export const createOrUpdateNetVolumeCardHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date, value, change, changePercent, notes, updatedBy } = req.body;

    if (!date || value === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Date and value are required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const card = await createOrUpdateNetVolumeCard(dateObj, {
      value,
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

export const deleteNetVolumeCardHandler = asyncHandler(
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

    await deleteNetVolumeCard(dateObj);

    return res.status(200).json({
      status: "success",
      message: "Net volume card deleted successfully",
    });
  }
);
