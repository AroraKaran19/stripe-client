import mongoose from "mongoose";
import dotenv from "dotenv";
import { Transaction } from "../models/transaction.model";
import { AnalyticsSnapshot } from "../models/analytics-snapshot.model";
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

// Generate analytics snapshots with hourly breakdowns
const generateAnalyticsSnapshots = () => {
  const now = new Date();
  const snapshots: any[] = [];
  
  const metrics = [
    "gross_volume",
    "net_volume",
    "new_customers",
    "successful_payments",
    "failed_payments",
    "conversion_rate",
    "average_order_value",
  ];

  // Generate snapshots for last 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    const normalizedDate = getUTCStartOfDay(date); // Normalize to UTC
    
    // Generate hourly breakdown for each metric
    for (const metric of metrics) {
      let dailyValue = 0;
      const hourlyBreakdown: { [hour: number]: number } = {};
      
      // Generate realistic hourly data based on metric type
      if (metric === "gross_volume" || metric === "net_volume") {
        // For volume metrics: random daily total between $1000-$5000
        dailyValue = Math.floor(Math.random() * 4000) + 1000;
        
        // Distribute across 24 hours with some variation
        // Some hours have more activity (business hours), some less (night)
        for (let hour = 0; hour < 24; hour++) {
          // Business hours (9-17) have higher activity
          const isBusinessHour = hour >= 9 && hour <= 17;
          const baseHourlyValue = dailyValue / 24;
          
          // Add variation: business hours get 1.5x-2x, night hours get 0.3x-0.7x
          const multiplier = isBusinessHour 
            ? 1.5 + Math.random() * 0.5  // 1.5x to 2x
            : 0.3 + Math.random() * 0.4;  // 0.3x to 0.7x
          
          hourlyBreakdown[hour] = Math.round(baseHourlyValue * multiplier * 100) / 100;
        }
        
        // Adjust total to match daily value (normalize)
        const totalHourly = Object.values(hourlyBreakdown).reduce((sum, v) => sum + v, 0);
        const adjustment = dailyValue / totalHourly;
        for (let hour = 0; hour < 24; hour++) {
          hourlyBreakdown[hour] = Math.round(hourlyBreakdown[hour] * adjustment * 100) / 100;
        }
        
      } else if (metric === "new_customers" || metric === "successful_payments" || metric === "failed_payments") {
        // For count metrics: random daily total between 5-50
        dailyValue = Math.floor(Math.random() * 45) + 5;
        
        // Distribute across hours (some hours get more, some get 0)
        const hoursWithActivity = Math.floor(Math.random() * 12) + 8; // 8-20 hours have activity
        const activeHours: number[] = [];
        
        // Select random hours for activity
        while (activeHours.length < hoursWithActivity) {
          const hour = Math.floor(Math.random() * 24);
          if (!activeHours.includes(hour)) {
            activeHours.push(hour);
          }
        }
        
        // Distribute value across active hours
        const valuePerHour = dailyValue / hoursWithActivity;
        for (let hour = 0; hour < 24; hour++) {
          if (activeHours.includes(hour)) {
            // Add some variation
            const variation = 0.5 + Math.random(); // 0.5x to 1.5x
            hourlyBreakdown[hour] = Math.round(valuePerHour * variation);
          } else {
            hourlyBreakdown[hour] = 0;
          }
        }
        
        // Normalize to match daily total
        const totalHourly = Object.values(hourlyBreakdown).reduce((sum, v) => sum + v, 0);
        const adjustment = dailyValue / totalHourly;
        for (let hour = 0; hour < 24; hour++) {
          hourlyBreakdown[hour] = Math.round(hourlyBreakdown[hour] * adjustment);
        }
        
      } else if (metric === "conversion_rate") {
        // Conversion rate: percentage between 2-8%
        dailyValue = Math.round((2 + Math.random() * 6) * 100) / 100;
        
        // Same percentage for all hours (conversion rate doesn't vary much hourly)
        for (let hour = 0; hour < 24; hour++) {
          hourlyBreakdown[hour] = dailyValue;
        }
        
      } else if (metric === "average_order_value") {
        // Average order value: between $50-$200
        dailyValue = Math.round((50 + Math.random() * 150) * 100) / 100;
        
        // Similar value for all hours
        for (let hour = 0; hour < 24; hour++) {
          hourlyBreakdown[hour] = dailyValue;
        }
      }
      
      snapshots.push({
        date: normalizedDate,
        metric,
        value: dailyValue,
        source: "manual", // Mark as manual for seed data
        hourlyBreakdown,
        notes: `Seed data for ${metric} on ${normalizedDate.toISOString().split("T")[0]}`,
        updatedBy: "seed-script",
      });
    }
  }

  return snapshots;
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

    // Seed Analytics Snapshots
    console.log("\n\n📊 Generating analytics snapshots with hourly breakdowns...");
    const testSnapshots = generateAnalyticsSnapshots();
    
    console.log(`📈 Generated ${testSnapshots.length} analytics snapshots`);
    console.log("   - Last 7 days of data");
    console.log("   - All 7 metrics: gross_volume, net_volume, new_customers, etc.");
    console.log("   - Complete 24-hour hourly breakdowns for each day");

    console.log("\n📝 Creating analytics snapshots in database...");
    
    // Clear existing snapshots (optional - comment out if you want to keep existing data)
    // await AnalyticsSnapshot.deleteMany({});
    // console.log("🗑️  Cleared existing snapshots");
    
    // Use upsert to avoid duplicates (based on unique index: date + metric)
    let snapshotsProcessed = 0;
    let snapshotsSkipped = 0;
    
    for (const snapshot of testSnapshots) {
      try {
        // Check if snapshot already exists
        const existing = await AnalyticsSnapshot.findOne({
          date: snapshot.date,
          metric: snapshot.metric,
        });
        
        if (existing) {
          // Update existing snapshot
          await AnalyticsSnapshot.findOneAndUpdate(
            { date: snapshot.date, metric: snapshot.metric },
            snapshot,
            { new: true }
          );
          snapshotsProcessed++;
        } else {
          // Create new snapshot
          await AnalyticsSnapshot.create(snapshot);
          snapshotsProcessed++;
        }
      } catch (error: any) {
        console.warn(`⚠️  Failed to upsert snapshot for ${snapshot.metric} on ${snapshot.date.toISOString().split("T")[0]}: ${error.message}`);
        snapshotsSkipped++;
      }
    }
    
    console.log(`\n✅ Successfully processed ${snapshotsProcessed} analytics snapshots!`);
    if (snapshotsSkipped > 0) {
      console.log(`   ⚠️  Skipped: ${snapshotsSkipped} snapshots (due to errors)`);
    }
    
    // Show summary by metric
    const metricCounts: Record<string, number> = {};
    testSnapshots.forEach((snapshot) => {
      const metric = snapshot.metric;
      metricCounts[metric] = (metricCounts[metric] || 0) + 1;
    });

    console.log("\n📊 Snapshot Summary by Metric:");
    Object.entries(metricCounts).forEach(([metric, count]) => {
      console.log(`   ${metric}: ${count} days`);
    });

    console.log("\n🎉 Analytics seed completed successfully!");
    console.log("\n💡 Your analytics dashboard should now show:");
    console.log("   - Transactions data from database");
    console.log("   - Analytics snapshots with hourly breakdowns");
    console.log("   - Try 'Last 7 days' with 'Daily' or 'Hourly' frequency");
    console.log("   - Compare with 'Previous period' to see comparison data");
    console.log("   - Edit snapshots in Admin page to see manual overrides");
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

