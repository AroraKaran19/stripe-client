import mongoose, { Schema, Document } from "mongoose";

export interface IAnalyticsSnapshot extends Document {
  date: Date;
  metric: string;
  value: number;
  source: "calculated" | "manual";
  hourlyBreakdown?: {
    [hour: number]: number;
  };
  notes?: string;
  updatedAt: Date;
  updatedBy?: string;
  createdAt: Date;
}

const HourlyBreakdownSchema = new Schema(
  {
    // This will be stored as a Map in MongoDB
    // Key: hour (0-23), Value: number
  },
  { _id: false, strict: false }
);

const AnalyticsSnapshotSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    metric: {
      type: String,
      required: true,
      enum: [
        "gross_volume",
        "net_volume",
        "new_customers",
        "successful_payments",
        "failed_payments",
        "conversion_rate",
        "average_order_value",
        "total_orders",
      ],
      index: true,
    },
    value: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      enum: ["calculated", "manual"],
      default: "calculated",
    },
    hourlyBreakdown: {
      type: Map,
      of: Number,
      default: {},
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

// Compound index for date + metric (unique combination)
AnalyticsSnapshotSchema.index({ date: 1, metric: 1 }, { unique: true });

export const AnalyticsSnapshot = mongoose.model<IAnalyticsSnapshot>(
  "AnalyticsSnapshot",
  AnalyticsSnapshotSchema
);

