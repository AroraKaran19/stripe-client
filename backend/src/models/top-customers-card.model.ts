import mongoose, { Schema, Document } from "mongoose";

export interface ITopCustomersCard extends Document {
  date: Date;
  customers: Array<{
    customerId?: string;
    email?: string;
    name?: string;
    totalSpend: number;
    transactionCount: number;
  }>;
  notes?: string;
  updatedAt: Date;
  updatedBy?: string;
  createdAt: Date;
}

const CustomerSchema = new Schema(
  {
    customerId: {
      type: String,
    },
    email: {
      type: String,
    },
    name: {
      type: String,
    },
    totalSpend: {
      type: Number,
      required: true,
      default: 0,
    },
    transactionCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const TopCustomersCardSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
      unique: true,
    },
    customers: {
      type: [CustomerSchema],
      default: [],
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

export const TopCustomersCard = mongoose.model<ITopCustomersCard>(
  "TopCustomersCard",
  TopCustomersCardSchema
);
