import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";
const API_BASE = API_BASE_URL.replace('/api', '');

const generatePaymentId = () => {
  return `pm_${Math.random().toString(36).substr(2, 9)}`;
};

const generateFingerprint = () => {
  return `fp_${Math.random().toString(36).substr(2, 9)}`;
};

const generateCustomerId = () => {
  return `cus_${Math.random().toString(36).substr(2, 9)}`;
};

const generateExpires = () => {
  const expiresDate = new Date();
  expiresDate.setFullYear(expiresDate.getFullYear() + Math.floor(Math.random() * 3) + 1);
  const expiresMonth = String(expiresDate.getMonth() + 1).padStart(2, "0");
  const expiresYear = expiresDate.getFullYear();
  return `${expiresMonth} / ${expiresYear}`;
};

const testTransactions = [
  // Succeeded transactions
  {
    amount: 125.99,
    currency: "USD",
    number: "4242",
    owner: "John Doe",
    owner_email: "john.doe@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "US",
    address: "123 Main St, New York, NY 10001",
    status: "succeeded",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 60000),
      },
      {
        activity: "Authorized",
        timestamp: new Date(),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "4242",
    },
    description: "Premium Subscription - Monthly Plan",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+1 (555) 123-4567",
    risk_evaluation: {
      score: 25,
      level: "low",
    },
    country: "US",
    items: [
      {
        name: "Premium Subscription",
        quantity: 1,
        unit_price: 99.99,
        total_price: 99.99,
      },
      {
        name: "Processing Fee",
        quantity: 1,
        unit_price: 2.99,
        total_price: 2.99,
      },
      {
        name: "Taxes",
        quantity: 1,
        unit_price: 23.01,
        total_price: 23.01,
      },
    ],
  },
  {
    amount: 49.99,
    currency: "USD",
    number: "5555",
    owner: "Jane Smith",
    owner_email: "jane.smith@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "CA",
    address: "456 Oak Avenue, Toronto, ON M5H 2N2",
    status: "succeeded",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 45000),
      },
      {
        activity: "Authorized",
        timestamp: new Date(Date.now() - 30000),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "5555",
    },
    description: "Product Purchase - Digital Goods",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+1 (416) 555-7890",
    risk_evaluation: {
      score: 15,
      level: "low",
    },
    country: "CA",
    items: [
      {
        name: "Digital Product License",
        quantity: 1,
        unit_price: 39.99,
        total_price: 39.99,
      },
      {
        name: "Taxes",
        quantity: 1,
        unit_price: 10.0,
        total_price: 10.0,
      },
    ],
  },
  {
    amount: 299.50,
    currency: "USD",
    number: "8888",
    owner: "Robert Johnson",
    owner_email: "robert.j@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "GB",
    address: "789 High Street, London, SW1A 1AA",
    status: "succeeded",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 120000),
      },
      {
        activity: "Authorized",
        timestamp: new Date(Date.now() - 90000),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "8888",
    },
    description: "Annual Enterprise Plan",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+44 20 7946 0958",
    risk_evaluation: {
      score: 30,
      level: "normal",
    },
    country: "GB",
    items: [
      {
        name: "Enterprise Plan",
        quantity: 1,
        unit_price: 249.50,
        total_price: 249.50,
      },
      {
        name: "Setup Fee",
        quantity: 1,
        unit_price: 50.0,
        total_price: 50.0,
      },
    ],
  },
  // Failed transactions
  {
    amount: 75.00,
    currency: "USD",
    number: "0001",
    owner: "Alice Williams",
    owner_email: "alice.w@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: false,
    origin: "AU",
    address: "321 Collins Street, Melbourne, VIC 3000",
    status: "failed",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 180000),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "0001",
    },
    description: "Subscription Payment - Declined",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+61 3 9999 1234",
    risk_evaluation: {
      score: 75,
      level: "high",
    },
    country: "AU",
    items: [
      {
        name: "Monthly Subscription",
        quantity: 1,
        unit_price: 75.0,
        total_price: 75.0,
      },
    ],
    decline_reason: "Insufficient funds",
  },
  {
    amount: 150.00,
    currency: "USD",
    number: "9999",
    owner: "Michael Brown",
    owner_email: "michael.brown@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "DE",
    address: "Hauptstraße 12, 10115 Berlin",
    status: "failed",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 240000),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "9999",
    },
    description: "Purchase Attempt - Card Declined",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+49 30 12345678",
    risk_evaluation: {
      score: 65,
      level: "high",
    },
    country: "DE",
    items: [
      {
        name: "Premium Package",
        quantity: 1,
        unit_price: 150.0,
        total_price: 150.0,
      },
    ],
    decline_reason: "Card expired",
  },
  // Refunded transactions
  {
    amount: 89.99,
    currency: "USD",
    number: "7777",
    owner: "Sarah Davis",
    owner_email: "sarah.davis@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "FR",
    address: "15 Rue de la Paix, 75002 Paris",
    status: "refunded",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 86400000 * 2),
      },
      {
        activity: "Authorized",
        timestamp: new Date(Date.now() - 86400000 * 2 + 60000),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "7777",
    },
    description: "Product Purchase - Refunded",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+33 1 23 45 67 89",
    risk_evaluation: {
      score: 20,
      level: "low",
    },
    country: "FR",
    items: [
      {
        name: "Product Item",
        quantity: 1,
        unit_price: 79.99,
        total_price: 79.99,
      },
      {
        name: "Shipping Charge",
        quantity: 1,
        unit_price: 10.0,
        total_price: 10.0,
      },
    ],
    refunded_date: new Date(Date.now() - 86400000),
  },
  {
    amount: 199.00,
    currency: "USD",
    number: "3333",
    owner: "David Wilson",
    owner_email: "david.wilson@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "JP",
    address: "1-1-1 Shibuya, Shibuya City, Tokyo 150-0002",
    status: "refunded",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 86400000 * 5),
      },
      {
        activity: "Authorized",
        timestamp: new Date(Date.now() - 86400000 * 5 + 45000),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "3333",
    },
    description: "Service Subscription - Refunded",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+81 3-1234-5678",
    risk_evaluation: {
      score: 25,
      level: "low",
    },
    country: "JP",
    items: [
      {
        name: "Annual Service",
        quantity: 1,
        unit_price: 199.0,
        total_price: 199.0,
      },
    ],
    refunded_date: new Date(Date.now() - 86400000 * 3),
  },
  // Disputed transactions
  {
    amount: 349.99,
    currency: "USD",
    number: "6666",
    owner: "Emily Martinez",
    owner_email: "emily.martinez@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "ES",
    address: "Calle Gran Vía, 1, 28013 Madrid",
    status: "disputed",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 86400000 * 7),
      },
      {
        activity: "Authorized",
        timestamp: new Date(Date.now() - 86400000 * 7 + 30000),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "6666",
    },
    description: "Large Purchase - Under Dispute",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+34 91 123 45 67",
    risk_evaluation: {
      score: 50,
      level: "normal",
    },
    country: "ES",
    items: [
      {
        name: "Enterprise Package",
        quantity: 1,
        unit_price: 299.99,
        total_price: 299.99,
      },
      {
        name: "Setup Fee",
        quantity: 1,
        unit_price: 50.0,
        total_price: 50.0,
      },
    ],
  },
  // Uncaptured transactions
  {
    amount: 59.99,
    currency: "USD",
    number: "2222",
    owner: "Chris Anderson",
    owner_email: "chris.anderson@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "IT",
    address: "Via Roma, 10, 00100 Rome",
    status: "uncaptured",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        activity: "Authorized",
        timestamp: new Date(Date.now() - 3300000),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "2222",
    },
    description: "Payment Authorized - Not Captured",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+39 06 1234 5678",
    risk_evaluation: {
      score: 35,
      level: "normal",
    },
    country: "IT",
    items: [
      {
        name: "Service Package",
        quantity: 1,
        unit_price: 49.99,
        total_price: 49.99,
      },
      {
        name: "Processing Fee",
        quantity: 1,
        unit_price: 10.0,
        total_price: 10.0,
      },
    ],
  },
  {
    amount: 99.50,
    currency: "USD",
    number: "4444",
    owner: "Lisa Taylor",
    owner_email: "lisa.taylor@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "NL",
    address: "Damrak 1, 1012 LG Amsterdam",
    status: "uncaptured",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        activity: "Authorized",
        timestamp: new Date(Date.now() - 6900000),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "4444",
    },
    description: "Pending Capture - Subscription",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+31 20 123 4567",
    risk_evaluation: {
      score: 28,
      level: "low",
    },
    country: "NL",
    items: [
      {
        name: "Monthly Subscription",
        quantity: 1,
        unit_price: 79.50,
        total_price: 79.50,
      },
      {
        name: "Taxes",
        quantity: 1,
        unit_price: 20.0,
        total_price: 20.0,
      },
    ],
  },
  // Additional succeeded transaction with admin_date
  {
    amount: 179.99,
    currency: "USD",
    number: "1234",
    owner: "Admin User",
    owner_email: "admin@example.com",
    fingerprint: generateFingerprint(),
    expires: generateExpires(),
    type: "Visa credit card",
    issuer: "Stripe Payments UK Limited",
    cvc_check: true,
    origin: "US",
    address: "100 Admin Blvd, San Francisco, CA 94105",
    status: "succeeded",
    activity_history: [
      {
        activity: "Started",
        timestamp: new Date(Date.now() - 300000),
      },
      {
        activity: "Authorized",
        timestamp: new Date(Date.now() - 270000),
      },
    ],
    payment_id: generatePaymentId(),
    payment_method: {
      card_type: "Visa",
      cart_last_four: "1234",
    },
    description: "Admin Transaction - Test Data",
    statement_descriptor: "VISUALIZE & BUILD LTD.",
    customer_id: generateCustomerId(),
    customer_phone: "+1 (415) 555-0000",
    risk_evaluation: {
      score: 18,
      level: "low",
    },
    country: "US",
    items: [
      {
        name: "Admin Package",
        quantity: 1,
        unit_price: 149.99,
        total_price: 149.99,
      },
      {
        name: "Setup Fee",
        quantity: 1,
        unit_price: 30.0,
        total_price: 30.0,
      },
    ],
    admin_date: new Date(Date.now() - 86400000),
    transferred_to: "acct_test123",
  },
];

const seedTransactions = async () => {
  try {
    console.log(`🔄 Connecting to API at ${API_BASE_URL}...`);
    
    // Check if API is reachable
    try {
      await axios.get(`${API_BASE}/health`);
      console.log("✅ API is reachable");
    } catch (error) {
      console.error(`❌ API is not reachable. Please make sure your backend server is running on ${API_BASE}`);
      process.exit(1);
    }

    console.log("📝 Creating test transactions via API...");
    const createdTransactions: any[] = [];
    const statusCounts: Record<string, number> = {};

    // Create transactions one by one using the API
    for (const transaction of testTransactions) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/transactions`,
          transaction,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.data) {
          createdTransactions.push(response.data.data);
          const status = response.data.data.status || "unknown";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
          console.log(`   ✓ Created transaction: ${response.data.data.payment_id || response.data.data._id}`);
        }
      } catch (error: any) {
        console.error(`   ✗ Failed to create transaction:`, error.response?.data?.message || error.message);
      }
    }

    console.log(`\n✅ Successfully created ${createdTransactions.length} test transactions!`);
    
    console.log("\n📊 Transaction Summary:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log("\n🎉 Seed completed successfully!");
  } catch (error: any) {
    console.error("❌ Error seeding transactions:", error.message);
    if (error.response) {
      console.error("   Response:", error.response.data);
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run the seed function
seedTransactions();

