import { Router } from "express";
import {
  getNetVolumeCard,
  getNetVolumeCardRange,
  createOrUpdateNetVolumeCardHandler,
  deleteNetVolumeCardHandler,
} from "../controller/net-volume-card.controller";

const router = Router();

// GET /api/net-volume-card?date=2025-11-02
router.get("/", getNetVolumeCard);

// GET /api/net-volume-card/range?startDate=2025-11-01&endDate=2025-11-30
router.get("/range", getNetVolumeCardRange);

// POST /api/net-volume-card - Create or update
router.post("/", createOrUpdateNetVolumeCardHandler);

// DELETE /api/net-volume-card?date=2025-11-02
router.delete("/", deleteNetVolumeCardHandler);

export default router;
