import { Router } from "express";
import {
  getSnapshot,
  createOrUpdateSnapshot,
  deleteSnapshot,
  getSnapshotsByRange,
} from "../controller/analytics-snapshot.controller";

const router = Router();

// GET /api/analytics-snapshots?date=2025-11-02&metric=gross_volume
router.get("/", getSnapshot);

// POST /api/analytics-snapshots - Create or update snapshot
router.post("/", createOrUpdateSnapshot);

// DELETE /api/analytics-snapshots?date=2025-11-02&metric=gross_volume
router.delete("/", deleteSnapshot);

// GET /api/analytics-snapshots/range?startDate=2025-11-01&endDate=2025-11-30
router.get("/range", getSnapshotsByRange);

export default router;



