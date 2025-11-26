import { Router } from "express";
import {
  getFailedPaymentsCard,
  getFailedPaymentsCardRange,
  createOrUpdateFailedPaymentsCardHandler,
  deleteFailedPaymentsCardHandler,
} from "../controller/failed-payments-card.controller";

const router = Router();

// GET /api/failed-payments-card?date=2025-11-02
router.get("/", getFailedPaymentsCard);

// GET /api/failed-payments-card/range?startDate=2025-11-01&endDate=2025-11-30
router.get("/range", getFailedPaymentsCardRange);

// POST /api/failed-payments-card - Create or update
router.post("/", createOrUpdateFailedPaymentsCardHandler);

// DELETE /api/failed-payments-card?date=2025-11-02
router.delete("/", deleteFailedPaymentsCardHandler);

export default router;
