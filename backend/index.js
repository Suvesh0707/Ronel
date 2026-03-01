import "./loadEnv.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./db/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cloudinary from "./utils/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { folder: "test" }
    );
    res.json({ success: true, result });
  } catch (err) {
    console.error("Cloudinary test error:", err);

    res.status(500).json({
      message: err.message,
      name: err.name,
      http_code: err.http_code,
      error: err,
    });
  }
});


// Verify Cloudinary configuration
const cloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME?.trim() && process.env.CLOUDINARY_API_KEY?.trim() && process.env.CLOUDINARY_API_SECRET?.trim());
if (!cloudinaryConfigured) {
  console.warn("⚠️  Cloudinary not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env for image upload.");
} else {
  console.log("✓ Cloudinary configured (image upload enabled)");
}
const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
if (!razorpayConfigured) {
  console.warn("⚠️  Razorpay keys not set. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env for payment.");
} else {
  console.log("✓ Razorpay configured (payment enabled)");
}

// Load routes dynamically AFTER env vars are set
(async () => {
  const userRoutes = (await import('./routes/user.routes.js')).default;
  const perfumeRoutes = (await import('./routes/perfume.routes.js')).default;
  const cartRoutes = (await import('./routes/cart.routes.js')).default;
  const orderRoutes = (await import('./routes/order.routes.js')).default;
  const deliveryRoutes = (await import('./routes/delivery.routes.js')).default;
  const reviewRoutes = (await import('./routes/review.routes.js')).default;
  const settingsRoutes = (await import('./routes/settings.routes.js')).default;

  app.use("/api/users", userRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/perfumes", perfumeRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/delivery", deliveryRoutes);
  app.use("/api/reviews", reviewRoutes);

  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      razorpayConfigured: !!razorpayConfigured,
    });
  });

  app.use(errorHandler);

  await connectDB();
  app.listen(PORT, () => {
    console.log(`server is running on port : ${PORT}`);
  });
})();