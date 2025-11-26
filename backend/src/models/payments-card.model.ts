import mongoose, { Schema, Document } from "mongoose";

export interface PaymentTransaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  status: "successful" | "failed";
}

export interface IPaymentsCard extends Document {
  date: Date;
  transactions: PaymentTransaction[];
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  averagePaymentAmount: number;
  notes?: string;
  updatedAt: Date;
  updatedBy?: string;
  createdAt: Date;
}

const PaymentsCardSchema = new Schema(
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
          status: {
            type: String,
            enum: ["successful", "failed"],
          },
        },
      ],
      default: [],
    },
    totalPayments: {
      type: Number,
      required: true,
      default: 0,
    },
    successfulPayments: {
      type: Number,
      required: true,
      default: 0,
    },
    failedPayments: {
      type: Number,
      required: true,
      default: 0,
    },
    averagePaymentAmount: {
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

export const PaymentsCard = mongoose.model<IPaymentsCard>(
  "PaymentsCard",
  PaymentsCardSchema
);
