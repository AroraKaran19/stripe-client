import { Router } from "express";
import { getAnalyticsHandler } from "../controller/analytics.controller";

const router = Router();

// GET /api/analytics - Get dashboard analytics
router.get("/", getAnalyticsHandler);

export default router;

