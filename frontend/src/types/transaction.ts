export interface Transaction {
  _id?: string;
  amount: number;
  currency: string;
  number: string;
  owner: string;
  owner_email: string;
  fingerprint: string;
  expires: string; // Format: "02 / 2026"

  type: string;
  issuer: string;
  cvc_check: boolean;
  origin: string;
  address: string;

  status: "succeeded" | "failed" | "refunded" | "disputed" | "uncaptured";
  activity_history: {
    activity: "Started" | "Authorized";
    timestamp: Date;
  }[];

  payment_id: string;
  payment_method: {
    card_type: "Visa";
    cart_last_four: string;
  };
  description: string;
  statement_descriptor: string;

  risk_evaluation: {
    score: number;
    level: "low" | "normal" | "high";
  };

  country: string;

  items: {
    name: string | "Shipping Charge" | "Taxes";
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];

  createdAt?: Date;
  updatedAt?: Date;
}
