import mongoose, { Schema, Document } from "mongoose";

export interface IGrossVolumeCard extends Document {
  date: Date;
  value: number;
  change: number;
  changePercent: number;
  notes?: string;
  updatedAt: Date;
  updatedBy?: string;
  createdAt: Date;
}

const GrossVolumeCardSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
      unique: true,
    },
    value: {
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

export const GrossVolumeCard = mongoose.model<IGrossVolumeCard>(
  "GrossVolumeCard",
  GrossVolumeCardSchema
);
