import { Request, Response, NextFunction } from "express";
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../services/transaction.services";
import { asyncHandler } from "../middleware/error.middleware";

export const getTransactions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Build filters from query parameters
    const filters: Record<string, any> = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.owner_email) filters.owner_email = req.query.owner_email;
    if (req.query.payment_id) filters.payment_id = req.query.payment_id;

    const result = await getAllTransactions(page, limit, filters);

    res.status(200).json({
      status: "success",
      data: result,
    });
  }
);

export const getTransaction = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const transaction = await getTransactionById(id);

    res.status(200).json({
      status: "success",
      data: transaction,
    });
  }
);

export const createTransactionHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const transactionData = req.body;

    const transaction = await createTransaction(transactionData);

    res.status(201).json({
      status: "success",
      data: transaction,
    });
  }
);

export const updateTransactionHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const transactionData = req.body;

    const transaction = await updateTransaction(id, transactionData);

    res.status(200).json({
      status: "success",
      data: transaction,
    });
  }
);

export const deleteTransactionHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await deleteTransaction(id);

    res.status(200).json({
      status: "success",
      message: "Transaction deleted successfully",
    });
  }
);

