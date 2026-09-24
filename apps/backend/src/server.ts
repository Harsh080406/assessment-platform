import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { CareersController } from "./modules/careers/careers.controller.js";
import { ReportsController } from "./modules/reports/reports.controller.js";
import authRoutes from "./modules/auth/auth.routes.js";
import assessmentRoutes from "./modules/assessment/assessment.routes.js";
import staffRoutes from "./modules/staff/staff.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Security & Utility Middlewares
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(requestLogger);

// Health Check Endpoint
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "AuraPath Enterprise Psychometrics Core",
    version: "2026.4.0",
  });
});

// Authentication Routes (All 4 Methods: Password, Google, Phone OTP, Email OTP)
app.use("/api/v1/auth", authRoutes);

// Assessment Engine Routes (Start, Resume, Save Response, Submit & Lock)
app.use("/api/v1/assessment", assessmentRoutes);

// Staff (Expert) Portal Routes
app.use("/api/v1/staff", staffRoutes);

// Career Constellation Routes
app.get("/api/v1/careers", CareersController.list);
app.get("/api/v1/careers/:id", CareersController.getById);

// Diagnostic Report Routes
app.get("/api/v1/reports/sample", ReportsController.getSampleReport);
app.get("/api/v1/reports/download", ReportsController.downloadReport);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[AuraPath API] 🚀 Server running on http://localhost:${PORT}`);
    console.log(`[AuraPath API] 🩺 Health check available at http://localhost:${PORT}/api/v1/health`);
    console.log(`[AuraPath API] 🔐 Auth routes available at http://localhost:${PORT}/api/v1/auth`);
    console.log(`[AuraPath API] 📝 Assessment routes available at http://localhost:${PORT}/api/v1/assessment`);
    console.log(`[AuraPath API] 🩺 Staff routes available at http://localhost:${PORT}/api/v1/staff`);
  });
}

export default app;
