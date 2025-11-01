import app from "./app";
import { connectDB, disconnectDB } from "./config/database";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Stripe Client Backend Server is running on port ${PORT}`);
      console.log(
        `🌐 Health check available at: http://localhost:${PORT}/health`
      );
    });

    process.on("SIGTERM", () => {
      console.log("🔄 Shutting down server...");
      server.close(() => {
        console.log("🔒 Server closed");
        disconnectDB();
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
