import mongoose, { Schema, Document } from "mongoose";

export interface FailedPaymentTransaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  reason?: string;
}

export interface IFailedPaymentsCard extends Document {
  date: Date;
  transactions: FailedPaymentTransaction[];
  count: number;
  totalAmount: number;
  averageAmount: number;
  notes?: string;
  updatedAt: Date;
  updatedBy?: string;
  createdAt: Date;
}

const FailedPaymentsCardSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
      unique: true,
    },
    transactions: {
      type: [
        {
          id: String,
          description: String,
          date: String,
          amount: Number,
          reason: String,
        },
      ],
      default: [],
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    averageAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const FailedPaymentsCard = mongoose.model<IFailedPaymentsCard>(
  "FailedPaymentsCard",
  FailedPaymentsCardSchema
);
