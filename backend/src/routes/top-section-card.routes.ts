import { Router } from "express";
import {
  getTopSectionCard,
  getTopSectionCardRange,
  createOrUpdateTopSectionCardHandler,
  deleteTopSectionCardHandler,
} from "../controller/top-section-card.controller";

const router = Router();

// GET /api/top-section-card?date=2025-11-02
router.get("/", getTopSectionCard);

// GET /api/top-section-card/range?startDate=2025-11-01&endDate=2025-11-30
router.get("/range", getTopSectionCardRange);

// POST /api/top-section-card - Create or update
router.post("/", createOrUpdateTopSectionCardHandler);

// DELETE /api/top-section-card?date=2025-11-02
router.delete("/", deleteTopSectionCardHandler);

export default router;
