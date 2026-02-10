import asyncHandler from "express-async-handler";
import fs from "fs";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Address from "../models/address.model.js";
import Perfume from "../models/perfume.model.js";
import DeliveryBoy from "../models/deliveryBoy.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendRatePerfumeEmail } from "../utils/email.js";
import cloudinary from "../utils/cloudinary.js";
import { getCodEnabled } from "../utils/settings.js";

const PLATFORM_FEE = 3; // ₹3 platform fee per order

// Helper function to get Razorpay instance (lazy initialization)
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/* =========================
   CREATE RAZORPAY ORDER (checkout step 1)
========================= */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  try {
    console.log("🔍 createPaymentOrder called");
    console.log("📦 Razorpay env check:", {
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpay = getRazorpay();
    console.log("✓ Razorpay instance:", !!razorpay);

    const { addressId } = req.body;
    console.log("📍 Address ID:", addressId);

    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }

    const address = await Address.findOne({
      _id: addressId,
      user: req.user._id,
    });
    console.log("✓ Address found:", !!address);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.perfume");
    console.log("✓ Cart found:", !!cart, "Items:", cart?.items?.length);
    if (!cart || !cart.items.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let totalPrice = 0;
    const orderItems = [];
    for (const it of cart.items) {
      const p = it.perfume;
      if (!p || !p.isActive) continue;
      const qty = it.quantity || 1;
      if (qty > (p.stock || 0)) {
        return res.status(400).json({
          success: false,
          message: `"${p.name}" only ${p.stock} available`,
        });
      }
      const price = p.price * qty;
      totalPrice += price;
      orderItems.push({ perfume: p._id, quantity: qty, price: p.price });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No valid items in cart" });
    }

    const totalWithFee = totalPrice + PLATFORM_FEE;
    const amountInPaise = Math.round(totalWithFee * 100);
    console.log("💰 Amount in paise:", amountInPaise);

    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Payment not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
      });
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `${String(req.user._id).slice(-8)}_${Date.now().toString().slice(-6)}`,
    };

    console.log("📋 Creating Razorpay order with options:", options);
    const razorpayOrder = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created:", razorpayOrder.id);

    res.status(201).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      orderItems,
      totalPrice: totalWithFee,
      platformFee: PLATFORM_FEE,
      addressId,
    });
  } catch (error) {
    console.error("❌ Error in createPaymentOrder:", error?.error?.description || error.message);
    throw error;
  }
});

/* =========================
   VERIFY PAYMENT & CREATE ORDER (checkout step 2)
========================= */
export const verifyPaymentAndCreateOrder = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    addressId,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !addressId) {
    return res.status(400).json({
      success: false,
      message: "Missing payment or address details",
    });
  }

  const address = await Address.findOne({
    _id: addressId,
    user: req.user._id,
  });
  if (!address) {
    return res.status(404).json({ success: false, message: "Address not found" });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.perfume");
  if (!cart || !cart.items.length) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  let totalPrice = 0;
  const orderItems = [];
  for (const it of cart.items) {
    const p = it.perfume;
    if (!p || !p.isActive) continue;
    const qty = it.quantity || 1;
    if (qty > (p.stock || 0)) {
      return res.status(400).json({
        success: false,
        message: `"${p.name}" only ${p.stock} available`,
      });
    }
    const price = p.price * qty;
    totalPrice += price;
    orderItems.push({ perfume: p._id, quantity: qty, price: p.price });
  }

  if (orderItems.length === 0) {
    return res.status(400).json({ success: false, message: "No valid items in cart" });
  }

  const totalWithFee = totalPrice + PLATFORM_FEE;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(503).json({
      success: false,
      message: "Payment not configured",
    });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    address: addressId,
    totalPrice: totalWithFee,
    status: "placed",
    paymentStatus: "paid",
    paymentMethod: "online",
    platformFee: PLATFORM_FEE,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });

  for (const it of orderItems) {
    await Perfume.findByIdAndUpdate(it.perfume, {
      $inc: { stock: -it.quantity, sold: it.quantity },
    });
  }

  cart.items = [];
  await cart.save();

  const populated = await Order.findById(order._id)
    .populate("items.perfume")
    .populate("address");

  res.status(201).json({ success: true, order: populated });
});

/* =========================
   CREATE ORDER WITH COD (Cash on Delivery)
========================= */
export const createOrderCOD = asyncHandler(async (req, res) => {
  const codEnabled = await getCodEnabled();
  if (!codEnabled) {
    return res.status(400).json({
      success: false,
      message: "Cash on Delivery is currently disabled. Please pay online.",
    });
  }

  const { addressId } = req.body;

  if (!addressId) {
    return res.status(400).json({ success: false, message: "Address is required" });
  }

  const address = await Address.findOne({
    _id: addressId,
    user: req.user._id,
  });
  if (!address) {
    return res.status(404).json({ success: false, message: "Address not found" });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.perfume");
  if (!cart || !cart.items.length) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  let totalPrice = 0;
  const orderItems = [];
  for (const it of cart.items) {
    const p = it.perfume;
    if (!p || !p.isActive) continue;
    const qty = it.quantity || 1;
    if (qty > (p.stock || 0)) {
      return res.status(400).json({
        success: false,
        message: `"${p.name}" only ${p.stock} available`,
      });
    }
    const price = p.price * qty;
    totalPrice += price;
    orderItems.push({ perfume: p._id, quantity: qty, price: p.price });
  }

  if (orderItems.length === 0) {
    return res.status(400).json({ success: false, message: "No valid items in cart" });
  }

  const totalWithFee = totalPrice + PLATFORM_FEE;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    address: addressId,
    totalPrice: totalWithFee,
    status: "placed",
    paymentStatus: "pending",
    paymentMethod: "cod",
    platformFee: PLATFORM_FEE,
  });

  for (const it of orderItems) {
    await Perfume.findByIdAndUpdate(it.perfume, {
      $inc: { stock: -it.quantity, sold: it.quantity },
    });
  }

  cart.items = [];
  await cart.save();

  const populated = await Order.findById(order._id)
    .populate("items.perfume")
    .populate("address");

  res.status(201).json({ success: true, order: populated });
});

/* =========================
   GET MY ORDERS
========================= */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.perfume")
    .populate("address")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});

/* =========================
   GET ORDER BY ID
========================= */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate("items.perfume")
    .populate("address");

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, order });
});

const CANCELLABLE_STATUSES = ["placed", "packed"];

/* =========================
   CANCEL ORDER (user) — only placed/packed; restores stock
========================= */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: "Order can only be cancelled when placed or packed. Cancellation is not allowed once the order is out for delivery.",
    });
  }

  for (const it of order.items) {
    await Perfume.findByIdAndUpdate(it.perfume, {
      $inc: { stock: it.quantity, sold: -it.quantity },
    });
  }
  order.status = "cancelled";
  await order.save();

  const populated = await Order.findById(order._id)
    .populate("items.perfume")
    .populate("address");
  res.json({ success: true, order: populated, message: "Order cancelled successfully." });
});

/* =========================
   REQUEST REPLACEMENT (user) — damaged product; requires photo/video proof
========================= */
export const requestReplacement = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  if (order.status !== "delivered") {
    return res.status(400).json({
      success: false,
      message: "Replacement can be requested only for delivered orders.",
    });
  }
  const eightHoursMs = 8 * 60 * 60 * 1000;
  const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt).getTime() : null;
  if (!deliveredAt) {
    return res.status(400).json({
      success: false,
      message: "Delivery timestamp is missing. Cannot process replacement request.",
    });
  }
  if (Date.now() - deliveredAt > eightHoursMs) {
    return res.status(400).json({
      success: false,
      message: "Replacement can only be requested within 8 hours of delivery. The window has expired.",
    });
  }
  if (order.replacementRequest?.requestedAt) {
    return res.status(400).json({
      success: false,
      message: "You have already requested a replacement for this order.",
    });
  }

  const files = req.files && Array.isArray(req.files) ? req.files : [];
  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please upload at least one photo or video of the damaged product/packaging so we can verify.",
    });
  }

  const comment = req.body?.comment ? String(req.body.comment).trim() : undefined;
  const proofUrls = [];
  const hasCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
  );

  if (hasCloudinary) {
    for (const file of files) {
      if (!file.path) continue;
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "replacements",
          resource_type: "auto",
        });
        proofUrls.push(result.secure_url);
      } catch (err) {
        console.error("Replacement proof upload error:", err?.message);
      }
      if (fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (_) {}
      }
    }
  }

  if (proofUrls.length === 0) {
    return res.status(500).json({
      success: false,
      message: "Could not upload proof. Please try again with photo or video.",
    });
  }

  order.replacementRequest = {
    requestedAt: new Date(),
    reason: "damaged",
    status: "pending",
    comment,
    proofUrls,
  };
  await order.save();

  const populated = await Order.findById(order._id)
    .populate("items.perfume")
    .populate("address");
  res.json({
    success: true,
    order: populated,
    message: "Replacement request submitted with proof. We will review it shortly.",
  });
});

/* =========================
   ADMIN: LIST REPLACEMENT REQUESTS (separate from main orders)
========================= */
export const getReplacementRequests = asyncHandler(async (req, res) => {
  const orders = await Order.find({ "replacementRequest.requestedAt": { $exists: true, $ne: null } })
    .populate("items.perfume")
    .populate("address")
    .populate("user", "name email")
    .sort({ "replacementRequest.requestedAt": -1 })
    .lean();
  res.json({ success: true, orders });
});

/* =========================
   ADMIN: RESOLVE REPLACEMENT (approve / reject)
========================= */
export const resolveReplacement = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  if (!order.replacementRequest?.requestedAt) {
    return res.status(400).json({ success: false, message: "No replacement request for this order." });
  }
  const { status } = req.body || {};
  if (!status || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Body must include status: 'approved' or 'rejected'." });
  }

  order.replacementRequest.status = status;
  order.replacementRequest.resolvedAt = new Date();
  order.replacementRequest.resolvedBy = req.user._id;
  await order.save();

  const populated = await Order.findById(order._id)
    .populate("items.perfume")
    .populate("address")
    .populate("user", "name email");
  res.json({ success: true, order: populated, message: `Replacement ${status}.` });
});

/* =========================
   ADMIN: GET ALL ORDERS (GROUPED BY CITY)
========================= */
export const getOrdersForAdmin = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("items.perfume")
    .populate("address")
    .populate("user", "name email")
    .populate("deliveryBoy", "name phone city")
    .sort({ createdAt: -1 })
    .lean();

  const byCity = {};
  for (const order of orders) {
    const city = order.address?.city || "Unknown";
    if (!byCity[city]) byCity[city] = [];
    byCity[city].push(order);
  }
  const cities = Object.keys(byCity).sort();

  res.json({
    success: true,
    orders,
    groupedByCity: cities.map((city) => ({ city, orders: byCity[city] })),
  });
});

/* =========================
   ADMIN: ASSIGN ORDERS TO DELIVERY BOY
========================= */
export const assignDeliveryBoyToOrders = asyncHandler(async (req, res) => {
  const { orderIds, deliveryBoyId } = req.body;
  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !deliveryBoyId) {
    return res.status(400).json({
      success: false,
      message: "orderIds (array) and deliveryBoyId are required",
    });
  }

  const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
  if (!deliveryBoy || !deliveryBoy.isActive) {
    return res.status(404).json({
      success: false,
      message: "Delivery boy not found or inactive",
    });
  }

  const assignableStatuses = ["placed", "packed", "shipping"];
  const result = await Order.updateMany(
    { _id: { $in: orderIds }, status: { $in: assignableStatuses } },
    { $set: { deliveryBoy: deliveryBoyId, status: "out_for_delivery" } }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} order(s) assigned to ${deliveryBoy.name}`,
    modifiedCount: result.modifiedCount,
  });
});

/* =========================
   ADMIN: MARK ORDER AS DELIVERED (sends email with rate link to user)
========================= */
export const markOrderDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { $set: { status: "delivered", deliveredAt: new Date() } },
    { new: true }
  )
    .populate("items.perfume")
    .populate("address")
    .populate("user", "name email")
    .populate("deliveryBoy", "name phone");

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (order.user?.email && order.items?.length) {
    sendRatePerfumeEmail(
      order.user.email,
      order.user.name,
      order.items.map((it) => ({ perfume: it.perfume, name: it.perfume?.name }))
    ).catch(() => {});
  }

  res.json({ success: true, order });
});

/* =========================
   ADMIN: UPDATE ORDER STATUS (packed, shipping, out_for_delivery, delivered)
========================= */
const VALID_STATUSES = ["placed", "packed", "shipping", "out_for_delivery", "delivered"];
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }
  const update = { status };
  if (status === "delivered") update.deliveredAt = new Date();
  if (status === "out_for_delivery" && req.body.deliveryBoyId) {
    update.deliveryBoy = req.body.deliveryBoyId;
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
    .populate("items.perfume")
    .populate("address")
    .populate("user", "name email")
    .populate("deliveryBoy", "name phone");

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (status === "delivered" && order.user?.email && order.items?.length) {
    sendRatePerfumeEmail(
      order.user.email,
      order.user.name,
      order.items.map((it) => ({ perfume: it.perfume, name: it.perfume?.name }))
    ).catch(() => {});
  }

  res.json({ success: true, order });
});
