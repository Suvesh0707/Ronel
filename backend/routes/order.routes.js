import express from "express";
import {
  createPaymentOrder,
  verifyPaymentAndCreateOrder,
  createOrderCOD,
  getMyOrders,
  getOrderById,
  cancelOrder,
  requestReplacement,
  resolveReplacement,
  getReplacementRequests,
  getOrdersForAdmin,
  assignDeliveryBoyToOrders,
  markOrderDelivered,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/auth.middleware.js";
import { uploadReplacementProof } from "../middleware/upload.js";

const router = express.Router();

router.post("/create-payment-order", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPaymentAndCreateOrder);
router.post("/create-cod", protect, createOrderCOD);
router.get("/", protect, getMyOrders);
router.post("/:id/cancel", protect, cancelOrder);
router.post("/:id/request-replacement", protect, uploadReplacementProof, requestReplacement);

// Admin: must be before /:id so "admin" is not captured as id
router.get("/admin/replacements", protect, admin, getReplacementRequests);
router.get("/admin/all", protect, admin, getOrdersForAdmin);
router.post("/admin/assign-delivery", protect, admin, assignDeliveryBoyToOrders);
router.patch("/admin/:id/delivered", protect, admin, markOrderDelivered);
router.patch("/admin/:id/status", protect, admin, updateOrderStatus);
router.patch("/admin/:id/replacement", protect, admin, resolveReplacement);

router.get("/:id", protect, getOrderById);

export default router;
