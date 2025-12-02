import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import transactionRoutes from "./routes/transaction.routes";
import analyticsRoutes from "./routes/analytics.routes";
import homepageRoutes from "./routes/homepage.routes";
import paymentsCardRoutes from "./routes/payments-card.routes";
import grossVolumeCardRoutes from "./routes/gross-volume-card.routes";
import netVolumeCardRoutes from "./routes/net-volume-card.routes";
import failedPaymentsCardRoutes from "./routes/failed-payments-card.routes";
import newCustomersCardRoutes from "./routes/new-customers-card.routes";
import topCustomersCardRoutes from "./routes/top-customers-card.routes";
import topSectionCardRoutes from "./routes/top-section-card.routes";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Stripe Client Backend Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/payments-card", paymentsCardRoutes);
app.use("/api/gross-volume-card", grossVolumeCardRoutes);
app.use("/api/net-volume-card", netVolumeCardRoutes);
app.use("/api/failed-payments-card", failedPaymentsCardRoutes);
app.use("/api/new-customers-card", newCustomersCardRoutes);
app.use("/api/top-customers-card", topCustomersCardRoutes);
app.use("/api/top-section-card", topSectionCardRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Stripe Client Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

app.use(errorHandler);

export default app;
