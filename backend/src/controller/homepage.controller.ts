import { Request, Response, NextFunction } from "express";
import {
  getHomepageByUsername,
  getOrCreateHomepage,
  getDefaultHomepage,
  getAllHomepages,
  setDefaultHomepage,
  getCardDataByDate,
  getTopSectionMetricData,
  getCardDataByDateRange,
  getTopSectionMetricDataRange,
  createOrUpdateCardData,
  createOrUpdateTopSectionMetricData,
  deleteCardData,
  deleteTopSectionMetricData,
  deleteHomepage,
  resolveBusinessName,
  updateBusinessName,
} from "../services/homepage.services";
import { IHomepage, BUSINESS_NAME_MAX_LENGTH } from "../models/homepage.model";
import { asyncHandler } from "../middleware/error.middleware";

/**
 * Get entire homepage data by username
 * GET /api/homepage?username=john_doe
 * If no username provided, returns the default homepage
 */
export const getHomepage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username as string;

    let homepage: IHomepage | null;

    if (!username) {
      // If no username, get the default homepage
      homepage = await getDefaultHomepage();
      if (!homepage) {
        return res.status(404).json({
          status: "error",
          message: "No default homepage found",
        });
      }
    } else {
      homepage = await getOrCreateHomepage(username);
    }

    return res.status(200).json({
      status: "success",
      data: homepage,
    });
  }
);

/**
 * Get specific card data by username, card name, and date
 * GET /api/homepage/card?username=john_doe&cardName=Payment Card&date=2025-01-15
 * If no username, uses the default homepage
 */
export const getCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username as string | undefined;
    const cardName = req.query.cardName as string;
    const date = req.query.date as string;

    if (!cardName || !date) {
      return res.status(400).json({
        status: "error",
        message: "cardName and date parameters are required",
      });
    }

    // If no username, get default homepage username
    let targetUsername = username;
    if (!targetUsername) {
      const defaultHomepage = await getDefaultHomepage();
      if (!defaultHomepage) {
        return res.status(404).json({
          status: "error",
          message: "No default homepage found",
        });
      }
      targetUsername = defaultHomepage.username;
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const cardData = await getCardDataByDate(targetUsername, cardName, dateObj);

    // If no data exists for this date, return an empty entry structure
    if (!cardData) {
      return res.status(200).json({
        status: "success",
        data: {
          date: dateObj,
          data: null, // Empty data structure
        },
      });
    }

    return res.status(200).json({
      status: "success",
      data: cardData,
    });
  }
);

/**
 * Get top section metric data
 * GET /api/homepage/top-section?username=john_doe&metricName=Gross Volume&date=2025-01-15
 * If no username, uses the default homepage
 */
export const getTopSectionMetric = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username as string | undefined;
    const metricName = req.query.metricName as string;
    const date = req.query.date as string;

    if (!metricName || !date) {
      return res.status(400).json({
        status: "error",
        message: "metricName and date parameters are required",
      });
    }

    // If no username, get default homepage username
    let targetUsername = username;
    if (!targetUsername) {
      const defaultHomepage = await getDefaultHomepage();
      if (!defaultHomepage) {
        return res.status(404).json({
          status: "error",
          message: "No default homepage found",
        });
      }
      targetUsername = defaultHomepage.username;
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const metricData = await getTopSectionMetricData(
      targetUsername,
      metricName,
      dateObj
    );

    if (!metricData) {
      return res.status(404).json({
        status: "error",
        message: "Metric data not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: metricData,
    });
  }
);

/**
 * Get card data by date range
 * GET /api/homepage/card/range?username=john_doe&cardName=Payment Card&startDate=2025-01-01&endDate=2025-01-31
 */
export const getCardRange = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username as string;
    const cardName = req.query.cardName as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!username || !cardName || !startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        message:
          "Username, cardName, startDate, and endDate parameters are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const cardData = await getCardDataByDateRange(
      username,
      cardName,
      start,
      end
    );

    return res.status(200).json({
      status: "success",
      data: cardData,
    });
  }
);

/**
 * Get top section metric data by date range
 * GET /api/homepage/top-section/range?username=john_doe&metricName=Gross Volume&startDate=2025-01-01&endDate=2025-01-31
 */
export const getTopSectionMetricRange = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username as string;
    const metricName = req.query.metricName as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!username || !metricName || !startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        message:
          "Username, metricName, startDate, and endDate parameters are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const metricData = await getTopSectionMetricDataRange(
      username,
      metricName,
      start,
      end
    );

    return res.status(200).json({
      status: "success",
      data: metricData,
    });
  }
);

/**
 * Create or update card data
 * POST /api/homepage/card
 * Body: { username, cardName, date, data, updatedBy? }
 */
export const createOrUpdateCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, cardName, date, data, updatedBy } = req.body;

    if (!username || !cardName || !date || data === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Username, cardName, date, and data are required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const homepage = await createOrUpdateCardData(
      username,
      cardName,
      dateObj,
      data,
      updatedBy
    );

    return res.status(200).json({
      status: "success",
      data: homepage,
    });
  }
);

/**
 * Create or update top section metric data
 * POST /api/homepage/top-section
 * Body: { username, metricName, date, data, updatedBy? }
 */
export const createOrUpdateTopSectionMetric = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, metricName, date, data, updatedBy } = req.body;

    if (!username || !metricName || !date || data === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Username, metricName, date, and data are required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    const homepage = await createOrUpdateTopSectionMetricData(
      username,
      metricName,
      dateObj,
      data,
      updatedBy
    );

    return res.status(200).json({
      status: "success",
      data: homepage,
    });
  }
);

/**
 * Delete card data
 * DELETE /api/homepage/card?username=john_doe&cardName=Payment Card&date=2025-01-15
 */
export const deleteCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username as string;
    const cardName = req.query.cardName as string;
    const date = req.query.date as string;

    if (!username || !cardName || !date) {
      return res.status(400).json({
        status: "error",
        message: "Username, cardName, and date parameters are required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    await deleteCardData(username, cardName, dateObj);

    return res.status(200).json({
      status: "success",
      message: "Card data deleted successfully",
    });
  }
);

/**
 * Delete top section metric data
 * DELETE /api/homepage/top-section?username=john_doe&metricName=Gross Volume&date=2025-01-15
 */
export const deleteTopSectionMetric = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username as string;
    const metricName = req.query.metricName as string;
    const date = req.query.date as string;

    if (!username || !metricName || !date) {
      return res.status(400).json({
        status: "error",
        message: "Username, metricName, and date parameters are required",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format",
      });
    }

    await deleteTopSectionMetricData(username, metricName, dateObj);

    return res.status(200).json({
      status: "success",
      message: "Metric data deleted successfully",
    });
  }
);

/**
 * Get all homepages
 * GET /api/homepage/all
 */
export const getAllHomepagesHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const homepages = await getAllHomepages();

    return res.status(200).json({
      status: "success",
      data: homepages,
    });
  }
);

/**
 * Set a homepage as default
 * POST /api/homepage/set-default
 * Body: { username: "john_doe" }
 */
export const setDefaultHomepageHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        status: "error",
        message: "Username is required",
      });
    }

    const homepage = await setDefaultHomepage(username);

    return res.status(200).json({
      status: "success",
      data: homepage,
      message: "Default homepage updated successfully",
    });
  }
);

/**
 * Get the business name to display for a username
 * GET /api/homepage/business-name?username=john_doe
 */
export const getBusinessNameHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username as string | undefined;
    const businessName = await resolveBusinessName(username);

    return res.status(200).json({
      status: "success",
      data: { businessName },
    });
  }
);

/**
 * Update a homepage's business name
 * PUT /api/homepage/business-name
 * Body: { username: "john_doe", businessName: "Acme Inc." }
 */
export const updateBusinessNameHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, businessName } = req.body;
    const trimmedName =
      typeof businessName === "string" ? businessName.trim() : "";

    if (!username || !trimmedName) {
      return res.status(400).json({
        status: "error",
        message: "Username and businessName are required",
      });
    }

    if (trimmedName.length > BUSINESS_NAME_MAX_LENGTH) {
      return res.status(400).json({
        status: "error",
        message: `Business name must be ${BUSINESS_NAME_MAX_LENGTH} characters or fewer`,
      });
    }

    const homepage = await updateBusinessName(username, trimmedName);

    return res.status(200).json({
      status: "success",
      data: {
        username: homepage.username,
        businessName: homepage.businessName,
      },
      message: "Business name updated successfully",
    });
  }
);

/**
 * Delete entire homepage
 * DELETE /api/homepage?username=john_doe
 */
export const deleteHomepageHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username as string;

    if (!username) {
      return res.status(400).json({
        status: "error",
        message: "Username parameter is required",
      });
    }

    await deleteHomepage(username);

    return res.status(200).json({
      status: "success",
      message: "Homepage deleted successfully",
    });
  }
);

