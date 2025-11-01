import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Transaction } from "../types/transaction";

export const cn = (...classes: ClassValue[]) => {
  return twMerge(clsx(classes));
};

/**
 * Creates a demo transaction with all required fields populated
 * Useful for development, testing, and UI demos
 */
export const createDemoTransaction = (
  overrides?: Partial<Transaction>
): Transaction => {
  const now = new Date();
  const expiresDate = new Date();
  expiresDate.setFullYear(expiresDate.getFullYear() + 3);
  
  // Format expires as "02 / 2026"
  const expiresMonth = String(expiresDate.getMonth() + 1).padStart(2, "0");
  const expiresYear = expiresDate.getFullYear();
  const expiresFormatted = `${expiresMonth} / ${expiresYear}`;

  return {
    _id: "demo_" + Math.random().toString(36).substr(2, 9),
    amount: 125.99,
    currency: "USD",
    number: "4242",
    owner: "John Doe",
    owner_email: "john.doe@example.com",
    fingerprint: "demo_fingerprint_" + Math.random().toString(36).substr(2, 9),
    expires: expiresFormatted,
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "US",
    address: "123 Main St, New York, NY 10001",
    status: "succeeded",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(now.getTime() - 60000),
      },
      {
        activity: "Authorized",
        timestamp: now,
      },
    ],
    payment_id: "pm_" + Math.random().toString(36).substr(2, 9),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "4242",
    },
    description: "Demo Transaction - Sample Purchase",
    statement_descriptor: "Visualize & Build ltd.",
    customer_id: "cus_demo_" + Math.random().toString(36).substr(2, 9),
    customer_phone: "+1 (555) 123-4567",
    risk_evaluation: {
      score: 25,
      level: "low",
    },
    country: "US",
    items: [
      {
        name: "Sample Product",
        quantity: 2,
        unit_price: 50.0,
        total_price: 100.0,
      },
      {
        name: "Shipping Charge",
        quantity: 1,
        unit_price: 15.99,
        total_price: 15.99,
      },
      {
        name: "Taxes",
        quantity: 1,
        unit_price: 10.0,
        total_price: 10.0,
      },
    ],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};
