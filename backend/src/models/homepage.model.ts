import mongoose, { Schema, Document } from "mongoose";

// Time series data point
export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
}

// Date-based data entry
export interface DateDataEntry {
  date: Date;
  data: any; // Flexible data structure depending on card type
}

// Top Section Data Structure
export interface TopSectionMetricData {
  current: number;
  previous: number;
  timeSeries: {
    current: TimeSeriesDataPoint[];
    previous: TimeSeriesDataPoint[];
  };
}

export interface TopSectionData {
  "Gross Volume": DateDataEntry[];
  "Net Volume": DateDataEntry[];
  "New Customers": DateDataEntry[];
  "Successful Payments": DateDataEntry[];
}

// Payment Card Data Structure
export interface PaymentCardData {
  transactions: Array<{
    id: string;
    description: string;
    date: string;
    amount: number;
    status: "successful" | "failed";
  }>;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  averagePaymentAmount: number;
}

// Gross/Net Volume Card Data Structure
export interface VolumeCardData {
  value: number;
  change: number;
  changePercent: number;
  timeSeries?: TimeSeriesDataPoint[];
}

// New Customers Card Data Structure
export interface NewCustomersCardData {
  count: number;
  change: number;
  changePercent: number;
}

// Failed Payments Card Data Structure
export interface FailedPaymentsCardData {
  transactions: Array<{
    id: string;
    description: string;
    date: string;
    amount: number;
    reason?: string;
  }>;
  count: number;
  totalAmount: number;
  averageAmount: number;
}

// Top Customers Card Data Structure
export interface TopCustomersCardData {
  customers: Array<{
    customerId?: string;
    email?: string;
    name?: string;
    totalSpend: number;
    transactionCount: number;
  }>;
}

// Main Homepage Document Interface
export interface IHomepage extends Document {
  username: string; // Unique username identifier
  default: boolean; // Whether this is the default homepage
  top_section_data: TopSectionData;
  "Payment Card": DateDataEntry[];
  "Gross Volume Card": DateDataEntry[];
  "Net Volume Card": DateDataEntry[];
  "Failed Payments Card": DateDataEntry[];
  "New Customers Card": DateDataEntry[];
  "Top Customers Card": DateDataEntry[];
  updatedBy?: string;
  updatedAt: Date;
  createdAt: Date;
}

// Schema Definitions
const TimeSeriesDataPointSchema = new Schema(
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

const DateDataEntrySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const TopSectionDataSchema = new Schema(
  {
    "Gross Volume": {
      type: [DateDataEntrySchema],
      default: [],
    },
    "Net Volume": {
      type: [DateDataEntrySchema],
      default: [],
    },
    "New Customers": {
      type: [DateDataEntrySchema],
      default: [],
    },
    "Successful Payments": {
      type: [DateDataEntrySchema],
      default: [],
    },
  },
  { _id: false }
);

const HomepageSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    default: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    top_section_data: {
      type: TopSectionDataSchema,
      required: true,
      default: () => ({
        "Gross Volume": [],
        "Net Volume": [],
        "New Customers": [],
        "Successful Payments": [],
      }),
    },
    "Payment Card": {
      type: [DateDataEntrySchema],
      default: [],
    },
    "Gross Volume Card": {
      type: [DateDataEntrySchema],
      default: [],
    },
    "Net Volume Card": {
      type: [DateDataEntrySchema],
      default: [],
    },
    "Failed Payments Card": {
      type: [DateDataEntrySchema],
      default: [],
    },
    "New Customers Card": {
      type: [DateDataEntrySchema],
      default: [],
    },
    "Top Customers Card": {
      type: [DateDataEntrySchema],
      default: [],
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
HomepageSchema.index({ "top_section_data.Gross Volume.date": 1 });
HomepageSchema.index({ "Payment Card.date": 1 });

export const Homepage = mongoose.model<IHomepage>("Homepage", HomepageSchema);
