import mongoose, { Schema, Document } from "mongoose";
import { DEFAULT_BUSINESS_NAME } from "./homepage.model";

// Nested schemas
const ActivityHistorySchema = new Schema(
  {
    activity: {
      type: String,
      enum: ["Started", "Authorized"],
    },
    timestamp: {
      type: Date,
    },
  },
  { _id: false }
);

const PaymentMethodSchema = new Schema(
  {
    card_type: {
      type: String,
      enum: ["Visa"],
    },
    cart_last_four: {
      type: String,
    },
  },
  { _id: false }
);

const RiskEvaluationSchema = new Schema(
  {
    score: {
      type: Number,
    },
    level: {
      type: String,
      enum: ["low", "normal", "high"],
    },
  },
  { _id: false }
);

const ItemSchema = new Schema(
  {
    name: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    unit_price: {
      type: Number,
    },
    total_price: {
      type: Number,
    },
  },
  { _id: false }
);

// Main transaction schema
const TransactionSchema = new Schema(
  {
    amount: {
      type: Number,
    },
    currency: {
      type: String,
    },
    number: {
      type: String,
    },
    owner: {
      type: String,
    },
    owner_email: {
      type: String,
    },
    fingerprint: {
      type: String,
    },
    expires: {
      type: String, // Format: "02 / 2026"
    },
    type: {
      type: String,
    },
    issuer: {
      type: String,
      default: "Stripe Payments UK Limited",
    },
    cvc_check: {
      type: Boolean,
    },
    origin: {
      type: String,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      enum: ["succeeded", "failed", "refunded", "disputed", "uncaptured"],
    },
    activity_history: {
      type: [ActivityHistorySchema],
      default: [],
    },
    payment_id: {
      type: String,
    },
    payment_method: {
      type: PaymentMethodSchema,
    },
    description: {
      type: String,
    },
    statement_descriptor: {
      type: String,
      default: DEFAULT_BUSINESS_NAME,
    },
    customer_id: {
      type: String,
    },
    customer_phone: {
      type: String,
    },
    risk_evaluation: {
      type: RiskEvaluationSchema,
    },
    country: {
      type: String,
    },
    items: {
      type: [ItemSchema],
      default: [],
    },
    transferred_to: {
      type: String,
    },
    refunded_date: {
      type: Date,
    },
    decline_reason: {
      type: String,
    },
    admin_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export interface ITransaction extends Document {
  amount?: number;
  currency?: string;
  number?: string;
  owner?: string;
  owner_email?: string;
  fingerprint?: string;
  expires?: Date;
  type?: string;
  issuer?: string;
  cvc_check?: boolean;
  origin?: string;
  address?: string;
  status?: "succeeded" | "failed" | "refunded" | "disputed" | "uncaptured";
  activity_history?: {
    activity?: "Started" | "Authorized";
    timestamp?: Date;
  }[];
  payment_id?: string;
  payment_method?: {
    card_type?: "Visa";
    cart_last_four?: string;
  };
  description?: string;
  statement_descriptor?: string;
  customer_id?: string;
  customer_phone?: string;
  risk_evaluation?: {
    score?: number;
    level?: "low" | "normal" | "high";
  };
  country?: string;
  items?: {
    name?: string | "Shipping Charge" | "Taxes";
    quantity?: number;
    unit_price?: number;
    total_price?: number;
  }[];
    transferred_to?: string;
    refunded_date?: Date;
    decline_reason?: string;
    admin_date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
