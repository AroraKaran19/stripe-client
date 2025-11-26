import { Router } from "express";
import {
  getPaymentsCard,
  getPaymentsCardRange,
  createOrUpdatePaymentsCardHandler,
  deletePaymentsCardHandler,
} from "../controller/payments-card.controller";

const router = Router();

// GET /api/payments-card?date=2025-11-02
router.get("/", getPaymentsCard);

// GET /api/payments-card/range?startDate=2025-11-01&endDate=2025-11-30
router.get("/range", getPaymentsCardRange);

// POST /api/payments-card - Create or update
router.post("/", createOrUpdatePaymentsCardHandler);

// DELETE /api/payments-card?date=2025-11-02
router.delete("/", deletePaymentsCardHandler);

export default router;
