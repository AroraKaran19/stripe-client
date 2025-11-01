import { Transaction, ITransaction } from "../models/transaction.model";
import { AppError } from "../middleware/error.middleware";

export const getAllTransactions = async (
  page: number = 1,
  limit: number = 10,
  filters?: Record<string, any>
): Promise<{ transactions: ITransaction[]; total: number; page: number; limit: number }> => {
  try {
    const skip = (page - 1) * limit;
    const query = filters ? { ...filters } : {};

    const [transactions, total] = await Promise.all([
      Transaction.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Transaction.countDocuments(query),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
    };
  } catch (error) {
    throw new AppError("Failed to fetch transactions", 500);
  }
};

export const getTransactionById = async (id: string): Promise<ITransaction> => {
  try {
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      throw new AppError("Transaction not found", 404, "not_found");
    }

    return transaction;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to process request", 500);
  }
};

export const createTransaction = async (
  data: Partial<ITransaction>
): Promise<ITransaction> => {
  try {
    const transaction = new Transaction(data);
    return await transaction.save();
  } catch (error) {
    throw new AppError("Failed to create transaction", 500);
  }
};

export const updateTransaction = async (
  id: string,
  data: Partial<ITransaction>
): Promise<ITransaction> => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      throw new AppError("Transaction not found", 404, "not_found");
    }

    return transaction;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to process request", 500);
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      throw new AppError("Transaction not found", 404, "not_found");
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to process request", 500);
  }
};

