import asyncHandler from "express-async-handler";
import Perfume from "../models/perfume.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";

/* =========================
   ADD PERFUME (ADMIN)
========================= */
export const addPerfume = asyncHandler(async (req, res) => {
  try {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  const raw = req.body || {};
  const name = raw.name?.trim();
  const fragrance = raw.fragrance?.trim();
  const intensity = raw.intensity?.trim();
  const description = raw.description?.trim() || undefined;
  const inspiredBy = raw.inspiredBy?.trim() || undefined;
  const topNote = raw.topNote?.trim() || undefined;
  const heartNote = raw.heartNote?.trim() || undefined;
  const baseNote = raw.baseNote?.trim() || undefined;
  const price = Number(raw.price);
  const volume = Number(raw.volume);
  const stock = Number(raw.stock);
  const isActive = raw.isActive !== undefined ? raw.isActive === true || raw.isActive === "true" : true;

  // Validate required fields
  if (!name || !fragrance || !intensity) {
    return res.status(400).json({
      success: false,
      message: "Please fill all required fields (name, fragrance, intensity)",
    });
  }
  if (isNaN(price) || price <= 0 || isNaN(volume) || volume <= 0 || isNaN(stock) || stock < 0) {
    return res.status(400).json({
      success: false,
      message: "Price, volume, and stock must be valid positive numbers",
    });
  }

  // Validate images
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please upload at least one image",
    });
  }

  // Check Cloudinary config before uploading (treat empty env vars as missing)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(503).json({
      success: false,
      message: "Image upload is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to backend .env (get them from cloudinary.com dashboard).",
    });
  }

  // Upload images to Cloudinary
  const images = [];
  try {
    for (const file of req.files) {
      if (!file.path) continue;
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "perfumes",
          resource_type: "auto",
        });
        images.push(result.secure_url);
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (_) {}
        }
      } catch (uploadError) {
        const isInvalidSignature = uploadError?.http_code === 401 || /Invalid Signature/i.test(uploadError?.message || "");
        if (isInvalidSignature) {
          console.error("Cloudinary Invalid Signature: CLOUDINARY_API_SECRET in .env is wrong. Copy the API Secret again from Cloudinary Dashboard (Settings → API Keys). Use API Secret, not API Key.");
        } else {
          console.error("Cloudinary upload error:", uploadError);
        }
        req.files.forEach((f) => {
          if (f.path && fs.existsSync(f.path)) {
            try { fs.unlinkSync(f.path); } catch (_) {}
          }
        });
        const userMessage = isInvalidSignature
          ? "Invalid Cloudinary credentials. In backend .env set CLOUDINARY_API_SECRET to the API Secret from Cloudinary Dashboard (Settings → API Keys), not the API Key."
          : `Failed to upload image: ${uploadError?.message || "Unknown error"}`;
        return res.status(500).json({
          success: false,
          message: userMessage,
        });
      }
    }
  } catch (error) {
    req.files.forEach((file) => {
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) { console.error(e); }
      }
    });
    return res.status(500).json({
      success: false,
      message: error?.message || "Error uploading images",
    });
  }

  let perfume;
  try {
    perfume = await Perfume.create({
      name,
      price,
      fragrance,
      intensity,
      volume,
      stock,
      description,
      inspiredBy,
      topNote,
      heartNote,
      baseNote,
      images,
      isActive,
      createdBy: req.user._id,
    });
  } catch (createErr) {
    console.error("Perfume.create error:", createErr);
    const msg = createErr.message || "Failed to save perfume";
    return res.status(400).json({ success: false, message: msg });
  }

  return res.status(201).json({ success: true, perfume });
  } catch (err) {
    console.error("[addPerfume]", err?.message || err);
    if (res.headersSent) return;
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to add perfume",
    });
  }
});



/* =========================
   UPDATE PERFUME (ADMIN)
========================= */
export const updatePerfume = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: "Perfume ID is required" 
    });
  }

  const perfume = await Perfume.findById(id);

  if (!perfume) {
    return res.status(404).json({ 
      success: false, 
      message: "Perfume not found" 
    });
  }

  const {
    name,
    price,
    fragrance,
    intensity,
    volume,
    stock,
    description,
    inspiredBy,
    topNote,
    heartNote,
    baseNote,
    isActive,
  } = req.body;

  // Validate price if provided
  if (price !== undefined && (isNaN(price) || price < 0)) {
    return res.status(400).json({ 
      success: false, 
      message: "Price must be a valid positive number" 
    });
  }

  // Validate stock if provided
  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    return res.status(400).json({ 
      success: false, 
      message: "Stock must be a valid positive number" 
    });
  }

  // Validate volume if provided
  if (volume !== undefined && (isNaN(volume) || volume < 0)) {
    return res.status(400).json({ 
      success: false, 
      message: "Volume must be a valid positive number" 
    });
  }

  // Update fields if provided (only non-empty values)
  if (name && name.trim()) perfume.name = name;
  if (price !== undefined && price > 0) perfume.price = price;
  if (fragrance) perfume.fragrance = fragrance;
  if (intensity) perfume.intensity = intensity;
  if (volume !== undefined && volume > 0) perfume.volume = volume;
  if (stock !== undefined && stock >= 0) perfume.stock = stock;
  if (description) perfume.description = description;
  if (inspiredBy) perfume.inspiredBy = inspiredBy;
  if (topNote !== undefined) perfume.topNote = topNote || undefined;
  if (heartNote !== undefined) perfume.heartNote = heartNote || undefined;
  if (baseNote !== undefined) perfume.baseNote = baseNote || undefined;
  if (isActive !== undefined) perfume.isActive = isActive;

  // Handle image upload if images exist
  if (req.files && req.files.length > 0) {
    const cldOk = process.env.CLOUDINARY_CLOUD_NAME?.trim() && process.env.CLOUDINARY_API_KEY?.trim() && process.env.CLOUDINARY_API_SECRET?.trim();
    if (!cldOk) {
      return res.status(503).json({ success: false, message: "Image upload not configured. Add Cloudinary env vars to .env" });
    }
    try {
      const uploadedImages = [];
      for (const file of req.files) {
        if (!file.path) continue;
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "perfumes",
            resource_type: "auto"
          });
          uploadedImages.push(result.secure_url);
          
          // Delete local file after upload
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError?.message || 'Unknown error'}`);
        }
      }
      perfume.images = uploadedImages;
    } catch (error) {
      // Clean up any uploaded files
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (e) {
              console.error("Error deleting file:", e);
            }
          }
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: error?.message || "Error uploading images" 
      });
    }
  }

  await perfume.save();

  return res.json({
    success: true,
    perfume,
  });
});


/* =========================
   DELETE PERFUME (ADMIN)
========================= */
export const deletePerfume = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const perfume = await Perfume.findById(id);
  if (!perfume) {
    res.status(404);
    throw new Error("Perfume not found");
  }

  await perfume.deleteOne();

  res.json({
    success: true,
    message: "Perfume deleted successfully",
  });
});

/* =========================
   GET ALL PERFUMES (USER) — with average rating + latest review (with comment) for cards
========================= */
export const getAllPerfumes = asyncHandler(async (req, res) => {
  const perfumes = await Perfume.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  const Review = (await import("../models/review.model.js")).default;
  const ratings = await Review.aggregate([
    { $group: { _id: "$perfume", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const ratingMap = Object.fromEntries(ratings.map((r) => [String(r._id), { averageRating: Math.round(r.avg * 10) / 10, totalReviews: r.count }]));

  const latestWithComment = await Review.find({ comment: { $exists: true, $ne: "", $type: "string" } })
    .sort({ createdAt: -1 })
    .populate("user", "name")
    .lean();
  const latestByPerfume = {};
  for (const r of latestWithComment) {
    const pid = String(r.perfume);
    if (!latestByPerfume[pid]) {
      latestByPerfume[pid] = { comment: r.comment, rating: r.rating, userName: r.user?.name };
    }
  }

  const withRating = (perfumes || []).map((p) => {
    const r = ratingMap[String(p._id)];
    const latest = latestByPerfume[String(p._id)];
    return {
      ...p,
      averageRating: r?.averageRating ?? 0,
      totalReviews: r?.totalReviews ?? 0,
      latestReview: latest ? { comment: latest.comment, rating: latest.rating, userName: latest.userName } : null,
    };
  });

  res.json({
    success: true,
    perfumes: withRating,
  });
});

/* =========================
   GET SINGLE PERFUME (USER)
========================= */
export const getPerfumeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const perfume = await Perfume.findById(id);

  if (!perfume || !perfume.isActive) {
    res.status(404);
    throw new Error("Perfume not found");
  }

  res.json({
    success: true,
    perfume,
  });
});

/* =========================
   TRENDING PERFUMES (TOP SOLD)
========================= */
export const getTrendingPerfumes = asyncHandler(async (req, res) => {
  const perfumes = await Perfume.find({ isActive: true })
    .sort({ sold: -1 })
    .limit(4)
    .lean();

  const Review = (await import("../models/review.model.js")).default;
  const ids = (perfumes || []).map((p) => p._id);
  const ratings = await Review.aggregate([
    { $match: { perfume: { $in: ids } } },
    { $group: { _id: "$perfume", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const ratingMap = Object.fromEntries(
    ratings.map((r) => [String(r._id), { averageRating: Math.round(r.avg * 10) / 10, totalReviews: r.count }])
  );
  const withRating = (perfumes || []).map((p) => ({
    ...p,
    averageRating: ratingMap[String(p._id)]?.averageRating ?? 0,
    totalReviews: ratingMap[String(p._id)]?.totalReviews ?? 0,
  }));

  res.json({
    success: true,
    perfumes: withRating,
  });
});

/* =========================
   YOU MAY ALSO LIKE (random perfumes excluding current)
========================= */
export const getRelatedPerfumes = asyncHandler(async (req, res) => {
  const { perfumeId } = req.params;
  const limit = Math.min(8, Math.max(4, parseInt(req.query.limit, 10) || 4));

  const perfumes = await Perfume.find({
    isActive: true,
    _id: { $ne: perfumeId },
  })
    .limit(limit * 2)
    .lean();

  const shuffled = perfumes.sort(() => Math.random() - 0.5);
  const related = shuffled.slice(0, limit);

  // Add ratings for cards
  const Review = (await import("../models/review.model.js")).default;
  const ids = related.map((p) => p._id);
  const ratings = await Review.aggregate([
    { $match: { perfume: { $in: ids } } },
    { $group: { _id: "$perfume", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const ratingMap = Object.fromEntries(
    ratings.map((r) => [String(r._id), { averageRating: Math.round(r.avg * 10) / 10, totalReviews: r.count }])
  );
  const withRating = related.map((p) => ({
    ...p,
    averageRating: ratingMap[String(p._id)]?.averageRating ?? 0,
    totalReviews: ratingMap[String(p._id)]?.totalReviews ?? 0,
  }));

  res.json({
    success: true,
    perfumes: withRating,
  });
});
