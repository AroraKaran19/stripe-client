import { Router } from "express";
import {
  getNewCustomersCard,
  getNewCustomersCardRange,
  createOrUpdateNewCustomersCardHandler,
  deleteNewCustomersCardHandler,
} from "../controller/new-customers-card.controller";

const router = Router();

// GET /api/new-customers-card?date=2025-11-02
router.get("/", getNewCustomersCard);

// GET /api/new-customers-card/range?startDate=2025-11-01&endDate=2025-11-30
router.get("/range", getNewCustomersCardRange);

// POST /api/new-customers-card - Create or update
router.post("/", createOrUpdateNewCustomersCardHandler);

// DELETE /api/new-customers-card?date=2025-11-02
router.delete("/", deleteNewCustomersCardHandler);

export default router;
