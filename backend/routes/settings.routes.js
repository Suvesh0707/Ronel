import express from "express";
import {
  getCodEnabledSetting,
  adminGetCodSetting,
  adminSetCodSetting,
} from "../controllers/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public - anyone can check if COD is available (for Cart page)
router.get("/cod-enabled", getCodEnabledSetting);

// Admin only
router.get("/admin/cod", protect, admin, adminGetCodSetting);
router.patch("/admin/cod", protect, admin, adminSetCodSetting);

export default router;
