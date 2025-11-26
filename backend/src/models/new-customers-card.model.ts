import mongoose, { Schema, Document } from "mongoose";

export interface INewCustomersCard extends Document {
  date: Date;
  count: number;
  change: number;
  changePercent: number;
  notes?: string;
  updatedAt: Date;
  updatedBy?: string;
  createdAt: Date;
}

const NewCustomersCardSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
      unique: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
    change: {
      type: Number,
      required: true,
      default: 0,
    },
    changePercent: {
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

export const NewCustomersCard = mongoose.model<INewCustomersCard>(
  "NewCustomersCard",
  NewCustomersCardSchema
);
