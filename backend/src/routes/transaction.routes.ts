import { Router } from "express";
import {
  getTransactions,
  getTransaction,
  createTransactionHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
} from "../controller/transaction.controller";

const router = Router();

// GET /api/transactions - Get all transactions with pagination and filters
router.get("/", getTransactions);

// GET /api/transactions/:id - Get a single transaction by ID
router.get("/:id", getTransaction);

// POST /api/transactions - Create a new transaction
router.post("/", createTransactionHandler);

// PUT /api/transactions/:id - Update a transaction by ID
router.put("/:id", updateTransactionHandler);

// PATCH /api/transactions/:id - Partially update a transaction by ID
router.patch("/:id", updateTransactionHandler);

// DELETE /api/transactions/:id - Delete a transaction by ID
router.delete("/:id", deleteTransactionHandler);

export default router;
