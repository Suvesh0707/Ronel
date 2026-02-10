import express from "express";
import {
  addPerfume,
  updatePerfume,
  deletePerfume,
  getAllPerfumes,
  getPerfumeById,
  getTrendingPerfumes,
  getRelatedPerfumes,
} from "../controllers/perfume.controller.js";

import { protect, admin } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// USER ROUTES
router.get("/", getAllPerfumes);
router.get("/trending/top", getTrendingPerfumes);
router.get("/related/:perfumeId", getRelatedPerfumes);
router.get("/:id", getPerfumeById);

// ADMIN ROUTES
router.post("/", protect, admin, upload.array("images", 10), addPerfume);
router.put("/:id", protect, admin, upload.array("images", 10), updatePerfume);
router.delete("/:id", protect, admin, deletePerfume);

export default router;
