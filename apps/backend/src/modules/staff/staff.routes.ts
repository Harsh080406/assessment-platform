import { Router } from "express";
import multer from "multer";
import { StaffController } from "./staff.controller.js";
import { authenticateJWT, requireRole } from "../../middleware/auth.js";
import { UserRole } from "@prisma/client";

const router = Router();

// Configure Multer memory storage with 15MB limit for diagnostic PDFs
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF documents are accepted for report uploads."));
    }
  },
});

// All staff endpoints require authentication and STAFF or ADMIN role
router.use(authenticateJWT);
router.use(requireRole([UserRole.STAFF, UserRole.ADMIN]));

// Queue stats
router.get("/stats", StaffController.getStats);

// Submissions list
router.get("/submissions", StaffController.getSubmissions);

// Single submission detail for expert inspection
router.get("/submissions/:attemptId", StaffController.getSubmissionDetail);

// State transition
router.patch("/submissions/:attemptId/status", StaffController.updateStatus);

// PDF Report upload
router.post("/submissions/:attemptId/report", upload.single("reportPdf"), StaffController.uploadReport);

export default router;
