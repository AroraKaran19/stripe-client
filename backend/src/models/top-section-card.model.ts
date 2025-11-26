import mongoose, { Schema, Document } from "mongoose";

export interface ITopSectionCard extends Document {
  date: Date;
  grossVolume: {
    current: number;
    previous: number;
    timeSeries: {
      current: Array<{ timestamp: Date; value: number }>;
      previous: Array<{ timestamp: Date; value: number }>;
    };
  };
  netVolume: {
    current: number;
    previous: number;
    timeSeries: {
      current: Array<{ timestamp: Date; value: number }>;
      previous: Array<{ timestamp: Date; value: number }>;
    };
  };
  newCustomers: {
    current: number;
    previous: number;
    timeSeries: {
      current: Array<{ timestamp: Date; value: number }>;
      previous: Array<{ timestamp: Date; value: number }>;
    };
  };
  successfulPayments: {
    current: number;
    previous: number;
    timeSeries: {
      current: Array<{ timestamp: Date; value: number }>;
      previous: Array<{ timestamp: Date; value: number }>;
    };
  };
  notes?: string;
  updatedAt: Date;
  updatedBy?: string;
  createdAt: Date;
}

const TimeSeriesDataSchema = new Schema(
  {
    timestamp: {
      type: Date,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const MetricSchema = new Schema(
  {
    current: {
      type: Number,
      required: true,
      default: 0,
    },
    previous: {
      type: Number,
      required: true,
      default: 0,
    },
    timeSeries: {
      current: {
        type: [TimeSeriesDataSchema],
        default: [],
      },
      previous: {
        type: [TimeSeriesDataSchema],
        default: [],
      },
    },
  },
  { _id: false }
);

const TopSectionCardSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
      unique: true,
    },
    grossVolume: {
      type: MetricSchema,
      required: true,
    },
    netVolume: {
      type: MetricSchema,
      required: true,
    },
    newCustomers: {
      type: MetricSchema,
      required: true,
    },
    successfulPayments: {
      type: MetricSchema,
      required: true,
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

export const TopSectionCard = mongoose.model<ITopSectionCard>(
  "TopSectionCard",
  TopSectionCardSchema
);
