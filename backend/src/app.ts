import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import transactionRoutes from "./routes/transaction.routes";

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
