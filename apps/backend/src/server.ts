import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { AssessmentController } from "./modules/assessment/assessment.controller.js";
import { CareersController } from "./modules/careers/careers.controller.js";
import { ReportsController } from "./modules/reports/reports.controller.js";
import { AuthController } from "./modules/auth/auth.controller.js";

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

// Assessment Routes
app.get("/api/v1/assessment/questions", AssessmentController.getQuestions);
app.post("/api/v1/assessment/submit", AssessmentController.submitAssessment);

// Career Constellation Routes
app.get("/api/v1/careers", CareersController.list);
app.get("/api/v1/careers/:id", CareersController.getById);

// Diagnostic Report Routes
app.get("/api/v1/reports/sample", ReportsController.getSampleReport);

// Authentication Routes
app.post("/api/v1/auth/login", AuthController.login);
app.post("/api/v1/auth/register", AuthController.register);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[AuraPath API] 🚀 Server running on http://localhost:${PORT}`);
    console.log(`[AuraPath API] 🩺 Health check available at http://localhost:${PORT}/api/v1/health`);
  });
}

export default app;
