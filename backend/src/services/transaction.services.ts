import { Transaction, ITransaction } from "../models/transaction.model";
import { AppError } from "../middleware/error.middleware";
import { resolveBusinessName } from "./homepage.services";
import mongoose from "mongoose";

export const getAllTransactions = async (
  page: number = 1,
  limit: number = 10,
  filters?: Record<string, any>,
  searchQuery?: string
): Promise<{ transactions: ITransaction[]; total: number; page: number; limit: number }> => {
  const skip = (page - 1) * limit;
  let query: Record<string, any> = {};

  try {
    // Build base filters (clean up any undefined/null values)
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== "") {
          query[key] = value;
        }
      });
    }

    // If search query is provided, add regex search across multiple fields
    if (searchQuery && searchQuery.trim()) {
      const trimmedSearch = searchQuery.trim();
      
      // Build search conditions array - only include fields that exist
      const searchConditionsArray: any[] = [];
      
      // Use regex for text fields (only if search string is not empty)
      if (trimmedSearch.length > 0) {
        // Escape special regex characters to prevent injection
        const escapedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escapedSearch, "i");
        
        searchConditionsArray.push(
          { owner_email: { $regex: searchRegex } },
          { owner: { $regex: searchRegex } },
          { payment_id: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { customer_id: { $regex: searchRegex } },
          { "payment_method.cart_last_four": { $regex: searchRegex } }
        );
      }

      // If search query looks like a valid MongoDB ObjectId, also search by _id
      if (mongoose.Types.ObjectId.isValid(trimmedSearch)) {
        try {
          const objectId = new mongoose.Types.ObjectId(trimmedSearch);
          searchConditionsArray.push({ _id: objectId });
        } catch (e) {
          // Invalid ObjectId format, skip
        }
      }

      if (searchConditionsArray.length > 0) {
        const searchConditions = {
          $or: searchConditionsArray,
        };

        // If we have other filters, use $and to combine them
        if (Object.keys(query).length > 0) {
          query = {
            $and: [query, searchConditions],
          };
        } else {
          // If no other filters, just use the search conditions
          query = searchConditions;
        }
      }
    }

    // Execute query with error handling
    const [transactions, total] = await Promise.all([
      Transaction.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Transaction.countDocuments(query),
    ]);

    return {
      transactions: transactions as unknown as ITransaction[],
      total,
      page,
      limit,
    };
  } catch (error: any) {
    console.error("Error in getAllTransactions:", error);
    console.error("Query that failed:", JSON.stringify(query, null, 2));
    console.error("Filters:", JSON.stringify(filters, null, 2));
    console.error("Search query:", searchQuery);
    throw new AppError(`Failed to fetch transactions: ${error.message}`, 500);
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
    const transaction = new Transaction({
      ...data,
      statement_descriptor:
        data.statement_descriptor || (await resolveBusinessName()),
    });
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

