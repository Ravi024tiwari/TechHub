import { Router } from "express";
import { handleRazorpayWebhook } from "../controllers/webhook.controller.js";

const webhookRouter = Router();

/**
 * @route   POST /api/v1/webhooks/razorpay
 * @desc    Public Razorpay Webhook listener (protected by cryptographic HMAC-SHA256 signature)
 * @access  Public
 */
webhookRouter.post("/razorpay", handleRazorpayWebhook);

export default webhookRouter;
