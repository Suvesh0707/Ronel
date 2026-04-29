import express from "express";
import upload from "../middleware/upload.js";
import {
  getCodEnabledSetting,
  getHeroSettings,
  adminGetCodSetting,
  adminGetHeroSettings,
  adminSetCodSetting,
  adminSetHeroSettings,
} from "../controllers/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public - anyone can check if COD is available (for Cart page)
router.get("/cod-enabled", getCodEnabledSetting);
router.get("/hero", getHeroSettings);

// Admin only
router.get("/admin/cod", protect, admin, adminGetCodSetting);
router.patch("/admin/cod", protect, admin, adminSetCodSetting);
router.get("/admin/hero", protect, admin, adminGetHeroSettings);
router.patch("/admin/hero", protect, admin, upload.single("heroImage"), adminSetHeroSettings);

export default router;
