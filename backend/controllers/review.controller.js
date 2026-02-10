import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Order from "../models/order.model.js";

/* =========================
   GET REVIEWS BY PERFUME (for star rating on product page) — supports pagination
========================= */
export const getReviewsByPerfume = asyncHandler(async (req, res) => {
  const { perfumeId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, Math.max(4, parseInt(req.query.limit, 10) || 6));
  const skip = (page - 1) * limit;

  const [reviews, totalCount] = await Promise.all([
    Review.find({ perfume: perfumeId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ perfume: perfumeId }),
  ]);

  let avgRating = 0;
  if (totalCount > 0) {
    const agg = await Review.aggregate([
      { $match: { perfume: new mongoose.Types.ObjectId(perfumeId) } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    avgRating = agg[0]?.avg ?? 0;
  }

  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    success: true,
    reviews,
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: totalCount,
    page,
    limit,
    totalPages,
  });
});

/* =========================
   CAN USER REVIEW THIS PERFUME? (has delivered order containing it, not already reviewed)
========================= */
export const canReviewPerfume = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { perfumeId } = req.params;

  const deliveredWithPerfume = await Order.findOne({
    user: userId,
    status: "delivered",
    "items.perfume": perfumeId,
  }).lean();

  const existing = await Review.findOne({ user: userId, perfume: perfumeId }).lean();

  res.json({
    success: true,
    canReview: !!deliveredWithPerfume && !existing,
    alreadyReviewed: !!existing,
  });
});

/* =========================
   CREATE REVIEW (user chooses 1–5 stars + optional comment; only after delivery)
========================= */
export const createReview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { perfumeId, rating, comment } = req.body;

  if (!perfumeId) {
    return res.status(400).json({ success: false, message: "Perfume is required" });
  }
  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be 1 to 5" });
  }

  const deliveredWithPerfume = await Order.findOne({
    user: userId,
    status: "delivered",
    "items.perfume": perfumeId,
  });
  if (!deliveredWithPerfume) {
    return res.status(403).json({
      success: false,
      message: "You can only review products from a delivered order",
    });
  }

  const existing = await Review.findOne({ user: userId, perfume: perfumeId });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this product",
    });
  }

  const review = await Review.create({
    user: userId,
    perfume: perfumeId,
    rating: numRating,
    comment: comment ? String(comment).trim() : undefined,
  });

  const populated = await Review.findById(review._id).populate("user", "name");
  res.status(201).json({ success: true, review: populated });
});

/* =========================
   GET MY REVIEWED PERFUME IDS (for order detail to show/hide review form)
========================= */
export const getMyReviewedPerfumeIds = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id }).select("perfume").lean();
  const reviewedPerfumeIds = reviews.map((r) => String(r.perfume));
  res.json({ success: true, reviewedPerfumeIds });
});
