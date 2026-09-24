import { Router } from "express";
import { AssessmentController } from "./assessment.controller.js";
import { authenticateJWT } from "../../middleware/auth.js";

const router = Router();

// Intake / diagnostic questions
router.get("/questions", AssessmentController.getQuestions);

// Attempt management
router.post("/start", authenticateJWT, AssessmentController.startOrResume);
router.get("/attempt/:id", authenticateJWT, AssessmentController.getAttempt);
router.post("/response", authenticateJWT, AssessmentController.saveResponse);
router.post("/submit", authenticateJWT, AssessmentController.submit);

export default router;
