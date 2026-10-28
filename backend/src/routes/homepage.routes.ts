import { Router } from "express";
import {
  getHomepage,
  getAllHomepagesHandler,
  setDefaultHomepageHandler,
  getCard,
  getTopSectionMetric,
  getCardRange,
  getTopSectionMetricRange,
  createOrUpdateCard,
  createOrUpdateTopSectionMetric,
  deleteCard,
  deleteTopSectionMetric,
  deleteHomepageHandler,
  getBusinessNameHandler,
  updateBusinessNameHandler,
} from "../controller/homepage.controller";

const router = Router();

// Get entire homepage by username
// GET /api/homepage?username=john_doe
router.get("/", getHomepage);

// Get all homepages
// GET /api/homepage/all
router.get("/all", getAllHomepagesHandler);

// Set a homepage as default
// POST /api/homepage/set-default
router.post("/set-default", setDefaultHomepageHandler);

// Get the business name to display (falls back to the default homepage)
// GET /api/homepage/business-name?username=john_doe
router.get("/business-name", getBusinessNameHandler);

// Update a homepage's business name
// PUT /api/homepage/business-name
router.put("/business-name", updateBusinessNameHandler);

// Get specific card data
// GET /api/homepage/card?username=john_doe&cardName=Payment Card&date=2025-01-15
router.get("/card", getCard);

// Get card data by date range
// GET /api/homepage/card/range?username=john_doe&cardName=Payment Card&startDate=2025-01-01&endDate=2025-01-31
router.get("/card/range", getCardRange);

// Get top section metric data
// GET /api/homepage/top-section?username=john_doe&metricName=Gross Volume&date=2025-01-15
router.get("/top-section", getTopSectionMetric);

// Get top section metric data by date range
// GET /api/homepage/top-section/range?username=john_doe&metricName=Gross Volume&startDate=2025-01-01&endDate=2025-01-31
router.get("/top-section/range", getTopSectionMetricRange);

// Create or update card data
// POST /api/homepage/card
router.post("/card", createOrUpdateCard);

// Create or update top section metric data
// POST /api/homepage/top-section
router.post("/top-section", createOrUpdateTopSectionMetric);

// Delete card data
// DELETE /api/homepage/card?username=john_doe&cardName=Payment Card&date=2025-01-15
router.delete("/card", deleteCard);

// Delete top section metric data
// DELETE /api/homepage/top-section?username=john_doe&metricName=Gross Volume&date=2025-01-15
router.delete("/top-section", deleteTopSectionMetric);

// Delete entire homepage
// DELETE /api/homepage?username=john_doe
router.delete("/", deleteHomepageHandler);

export default router;

