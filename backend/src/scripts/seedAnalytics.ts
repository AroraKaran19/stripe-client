import mongoose from "mongoose";
import dotenv from "dotenv";
import { Transaction } from "../models/transaction.model";
import { getUTCStartOfDay } from "../utils/dateUtils";

// Load environment variables
dotenv.config();

// Shared customer base for consistency across both seed scripts
const SHARED_CUSTOMERS = [
  { owner: "John Doe", email: "john.doe@example.com", id: "cus_johndoe123" },
  { owner: "Jane Smith", email: "jane.smith@example.com", id: "cus_janesmith456" },
  { owner: "Bob Johnson", email: "bob.johnson@example.com", id: "cus_bobjohnson789" },
  { owner: "Alice Williams", email: "alice.williams@example.com", id: "cus_alicewilliams012" },
  { owner: "Charlie Brown", email: "charlie.brown@example.com", id: "cus_charliebrown345" },
  { owner: "Diana Prince", email: "diana.prince@example.com", id: "cus_dianaprince678" },
];

const generatePaymentId = () => {
  return `pm_${Math.random().toString(36).substr(2, 9)}`;
};

const generateFingerprint = () => {
  return `fp_${Math.random().toString(36).substr(2, 9)}`;
};

const generateExpires = () => {
  const expiresDate = new Date();
  expiresDate.setFullYear(expiresDate.getFullYear() + Math.floor(Math.random() * 3) + 1);
  const expiresMonth = String(expiresDate.getMonth() + 1).padStart(2, "0");
  const expiresYear = expiresDate.getFullYear();
  return `${expiresMonth} / ${expiresYear}`;
};

// Generate transactions with UTC-normalized dates for analytics
// Last 7 days - for daily/hourly views
// Previous 7 days - for comparison
const generateTransactionsForAnalytics = () => {
  const now = new Date();
  const transactions: any[] = [];
  
  const statuses = ["succeeded", "succeeded", "succeeded", "succeeded", "failed", "refunded"]; // More succeeded than failed/refunded
  const amounts = [25.99, 49.99, 99.99, 149.99, 199.99, 299.99, 499.99, 799.99, 999.99];

  // Current period - Last 7 days (for daily/hourly view)
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    // Normalize to UTC start of day
    const utcDate = getUTCStartOfDay(date);
    
    // 3-8 transactions per day, distributed across hours
    const transactionsPerDay = Math.floor(Math.random() * 6) + 3;
    for (let i = 0; i < transactionsPerDay; i++) {
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      // Create UTC date with specific hour and minute
      const transactionDate = new Date(utcDate);
      transactionDate.setUTCHours(hour, minute, 0, 0);
      
      const customer = SHARED_CUSTOMERS[Math.floor(Math.random() * SHARED_CUSTOMERS.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      
      transactions.push({
        amount,
        currency: "USD",
        number: String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"),
        owner: customer.owner,
        owner_email: customer.email,
        customer_id: customer.id,
        fingerprint: generateFingerprint(),
        expires: generateExpires(),
        type: "Visa credit card",
        issuer: "Stripe Payments UK Limited",
        cvc_check: true,
        origin: "US",
        address: "123 Main St, New York, NY 10001",
        status,
        admin_date: transactionDate, // UTC-normalized date for analytics
        activity_history: [
          {
            activity: "Started",
            timestamp: new Date(transactionDate.getTime() - 60000),
          },
          {
            activity: status === "succeeded" ? "Authorized" : "Failed",
            timestamp: transactionDate,
          },
        ],
        payment_id: generatePaymentId(),
        payment_method: {
          card_type: "Visa",
          cart_last_four: String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"),
        },
        description: `${status === "succeeded" ? "Product Purchase" : status === "failed" ? "Failed Payment" : "Refund"}`,
        statement_descriptor: "VISUALIZE & BUILD LTD.",
        customer_phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        risk_evaluation: {
          score: Math.floor(Math.random() * 50),
          level: status === "failed" ? "high" : "low",
        },
        country: "US",
        items: [
          {
            name: "Product",
            quantity: 1,
            unit_price: amount,
            total_price: amount,
          },
        ],
      });
    }
  }

  // Previous period - 7 days before current (for comparison)
  for (let day = 7; day < 14; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    // Normalize to UTC start of day
    const utcDate = getUTCStartOfDay(date);
    
    const transactionsPerDay = Math.floor(Math.random() * 5) + 2; // Fewer transactions in previous period
    for (let i = 0; i < transactionsPerDay; i++) {
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      // Create UTC date with specific hour and minute
      const transactionDate = new Date(utcDate);
      transactionDate.setUTCHours(hour, minute, 0, 0);
      
      const customer = SHARED_CUSTOMERS[Math.floor(Math.random() * SHARED_CUSTOMERS.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      
      transactions.push({
        amount,
        currency: "USD",
        number: String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"),
        owner: customer.owner,
        owner_email: customer.email,
        customer_id: customer.id,
        fingerprint: generateFingerprint(),
        expires: generateExpires(),
        type: "Visa credit card",
        issuer: "Stripe Payments UK Limited",
        cvc_check: true,
        origin: "US",
        address: "123 Main St, New York, NY 10001",
        status,
        admin_date: transactionDate, // UTC-normalized date for analytics
        activity_history: [
          {
            activity: "Started",
            timestamp: new Date(transactionDate.getTime() - 60000),
          },
          {
            activity: status === "succeeded" ? "Authorized" : "Failed",
            timestamp: transactionDate,
          },
        ],
        payment_id: generatePaymentId(),
        payment_method: {
          card_type: "Visa",
          cart_last_four: String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"),
        },
        description: `${status === "succeeded" ? "Product Purchase" : status === "failed" ? "Failed Payment" : "Refund"}`,
        statement_descriptor: "VISUALIZE & BUILD LTD.",
        customer_phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        risk_evaluation: {
          score: Math.floor(Math.random() * 50),
          level: status === "failed" ? "high" : "low",
        },
        country: "US",
        items: [
          {
            name: "Product",
            quantity: 1,
            unit_price: amount,
            total_price: amount,
          },
        ],
      });
    }
  }

  return transactions;
};


const seedAnalytics = async () => {
  try {
    // Connect directly to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error("❌ MONGODB_URI is not defined in environment variables.");
      console.error("   Please make sure your .env file has MONGODB_URI set");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    console.log("\n📝 Generating UTC-normalized analytics test transactions...");
    const testTransactions = generateTransactionsForAnalytics();
    
    console.log(`📊 Generated ${testTransactions.length} transactions for analytics testing`);
    console.log("   - Last 7 days: ~35 transactions (for daily/hourly views)");
    console.log("   - Previous 7 days: ~25 transactions (for comparison)");
    console.log("   - All dates normalized to UTC for consistency");
    console.log("   - Shared customer base with seedTransactions.ts");

    console.log("\n📝 Creating transactions in database...");
    
    // Clear existing transactions (optional - comment out if you want to keep existing data)
    // await Transaction.deleteMany({});
    // console.log("🗑️  Cleared existing transactions");

    // Insert all transactions at once (much faster than individual inserts)
    const result = await Transaction.insertMany(testTransactions, { ordered: false });
    
    const createdCount = result.length;
    const statusCounts: Record<string, number> = {};
    
    // Count transactions by status
    testTransactions.forEach((tx) => {
      const status = tx.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log(`\n✅ Successfully created ${createdCount} analytics test transactions!`);
    
    console.log("\n📊 Transaction Summary:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log("\n🎉 Analytics seed completed successfully!");
    console.log("\n💡 Your analytics dashboard should now show:");
    console.log("   - Transactions data from database");
    console.log("   - Try 'Last 7 days' with 'Daily' or 'Hourly' frequency");
    console.log("   - Compare with 'Previous period' to see comparison data");
    console.log("   - Use Admin pages to manage individual card data");
  } catch (error: any) {
    console.error("❌ Error seeding analytics:", error.message);
    if (error.name === 'BulkWriteError' && error.writeErrors) {
      console.error(`   ${error.writeErrors.length} transactions failed to insert`);
      console.error("   Continuing with successfully inserted transactions...");
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the seed function
seedAnalytics();

