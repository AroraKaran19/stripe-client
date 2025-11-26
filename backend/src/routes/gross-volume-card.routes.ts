import { Router } from "express";
import {
  getGrossVolumeCard,
  getGrossVolumeCardRange,
  createOrUpdateGrossVolumeCardHandler,
  deleteGrossVolumeCardHandler,
} from "../controller/gross-volume-card.controller";

const router = Router();

// GET /api/gross-volume-card?date=2025-11-02
router.get("/", getGrossVolumeCard);

// GET /api/gross-volume-card/range?startDate=2025-11-01&endDate=2025-11-30
router.get("/range", getGrossVolumeCardRange);

// POST /api/gross-volume-card - Create or update
router.post("/", createOrUpdateGrossVolumeCardHandler);

// DELETE /api/gross-volume-card?date=2025-11-02
router.delete("/", deleteGrossVolumeCardHandler);

export default router;
