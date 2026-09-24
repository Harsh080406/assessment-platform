import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authenticateJWT } from "../../middleware/auth.js";

const router = Router();

// 1. Email & Password
router.post("/register", AuthController.register);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/login", AuthController.loginPassword);

// 2. Google OAuth
router.post("/google", AuthController.loginGoogle);

// 3. Phone OTP
router.post("/phone/otp/request", AuthController.requestPhoneOtp);
router.post("/phone/otp/verify", AuthController.verifyPhoneOtp);

// 4. Email OTP (Passwordless)
router.post("/email/otp/request", AuthController.requestEmailOtp);
router.post("/email/otp/verify", AuthController.verifyEmailOtp);

// 5. Password Recovery
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// 6. Current User Profile
router.get("/me", authenticateJWT, AuthController.getMe);

export default router;
