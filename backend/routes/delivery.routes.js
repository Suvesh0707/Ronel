import express from "express";
import {
  loginDeliveryBoy,
  logoutDeliveryBoy,
  getMe,
  getMyOrders,
  listDeliveryBoys,
  createDeliveryBoy,
  updateDeliveryBoy,
  deleteDeliveryBoy,
} from "../controllers/deliveryBoy.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/auth.middleware.js";
import { protectDeliveryBoy } from "../middleware/deliveryAuth.middleware.js";

const router = express.Router();

// Public
router.post("/login", loginDeliveryBoy);

// Delivery boy only (uses deliveryToken cookie)
router.post("/logout", logoutDeliveryBoy);
router.get("/me", protectDeliveryBoy, getMe);
router.get("/orders", protectDeliveryBoy, getMyOrders);

// Admin only (uses user token + admin role)
router.get("/boys", protect, admin, listDeliveryBoys);
router.post("/boys", protect, admin, createDeliveryBoy);
router.put("/boys/:id", protect, admin, updateDeliveryBoy);
router.delete("/boys/:id", protect, admin, deleteDeliveryBoy);

export default router;
