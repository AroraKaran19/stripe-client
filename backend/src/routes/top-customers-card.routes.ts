import { Router } from "express";
import {
  getTopCustomersCard,
  getTopCustomersCardRange,
  createOrUpdateTopCustomersCardHandler,
  deleteTopCustomersCardHandler,
} from "../controller/top-customers-card.controller";

const router = Router();

// GET /api/top-customers-card?date=2025-11-02
router.get("/", getTopCustomersCard);

// GET /api/top-customers-card/range?startDate=2025-11-01&endDate=2025-11-30
router.get("/range", getTopCustomersCardRange);

// POST /api/top-customers-card - Create or update
router.post("/", createOrUpdateTopCustomersCardHandler);

// DELETE /api/top-customers-card?date=2025-11-02
router.delete("/", deleteTopCustomersCardHandler);

export default router;
