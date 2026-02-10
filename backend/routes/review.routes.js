import express from "express";
import { getReviewsByPerfume, canReviewPerfume, createReview, getMyReviewedPerfumeIds } from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/perfume/:perfumeId", getReviewsByPerfume);
router.get("/my-reviewed", protect, getMyReviewedPerfumeIds);
router.get("/can-review/:perfumeId", protect, canReviewPerfume);
router.post("/", protect, createReview);

export default router;
