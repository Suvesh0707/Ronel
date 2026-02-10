import asyncHandler from "express-async-handler";
import DeliveryBoy from "../models/deliveryBoy.model.js";
import Order from "../models/order.model.js";
import jwt from "jsonwebtoken";

const generateDeliveryToken = (id) => {
  return jwt.sign(
    { id, type: "delivery" },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

const sendDeliveryTokenResponse = (res, deliveryBoy, statusCode = 200) => {
  const token = generateDeliveryToken(deliveryBoy._id);
  res.cookie("deliveryToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.status(statusCode).json({
    success: true,
    deliveryBoy: {
      id: deliveryBoy._id,
      name: deliveryBoy.name,
      phone: deliveryBoy.phone,
      city: deliveryBoy.city,
      isActive: deliveryBoy.isActive,
    },
  });
};

/* =========================
   DELIVERY BOY LOGIN
========================= */
export const loginDeliveryBoy = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: "Phone and password are required",
    });
  }

  const deliveryBoy = await DeliveryBoy.findOne({ phone: phone.trim() }).select("+password");
  if (!deliveryBoy) {
    return res.status(401).json({
      success: false,
      message: "Invalid phone or password",
    });
  }
  if (!deliveryBoy.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account is inactive. Contact admin.",
    });
  }

  const isMatch = await deliveryBoy.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid phone or password",
    });
  }

  sendDeliveryTokenResponse(res, deliveryBoy);
});

/* =========================
   DELIVERY BOY LOGOUT
========================= */
export const logoutDeliveryBoy = asyncHandler(async (req, res) => {
  res.cookie("deliveryToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ success: true, message: "Logged out" });
});

/* =========================
   GET ME (DELIVERY BOY)
========================= */
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    deliveryBoy: {
      id: req.deliveryBoy._id,
      name: req.deliveryBoy.name,
      phone: req.deliveryBoy.phone,
      city: req.deliveryBoy.city,
      isActive: req.deliveryBoy.isActive,
    },
  });
});

/* =========================
   GET MY ASSIGNED ORDERS (DELIVERY BOY)
========================= */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ deliveryBoy: req.deliveryBoy._id })
    .populate("items.perfume")
    .populate("address")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, orders });
});

/* =========================
   ADMIN: LIST ALL DELIVERY BOYS
========================= */
export const listDeliveryBoys = asyncHandler(async (req, res) => {
  const boys = await DeliveryBoy.find({}).sort({ city: 1, name: 1 }).lean();
  res.json({ success: true, deliveryBoys: boys });
});

/* =========================
   ADMIN: CREATE DELIVERY BOY
========================= */
export const createDeliveryBoy = asyncHandler(async (req, res) => {
  const { name, phone, city, password, isActive = true } = req.body;
  if (!name || !phone || !city || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, phone, city and password are required",
    });
  }

  const exists = await DeliveryBoy.findOne({ phone: phone.trim() });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: "A delivery boy with this phone already exists",
    });
  }

  const deliveryBoy = await DeliveryBoy.create({
    name: name.trim(),
    phone: phone.trim(),
    city: city.trim(),
    password,
    isActive: isActive !== false,
  });

  res.status(201).json({
    success: true,
    deliveryBoy: {
      id: deliveryBoy._id,
      name: deliveryBoy.name,
      phone: deliveryBoy.phone,
      city: deliveryBoy.city,
      isActive: deliveryBoy.isActive,
    },
  });
});

/* =========================
   ADMIN: UPDATE DELIVERY BOY
========================= */
export const updateDeliveryBoy = asyncHandler(async (req, res) => {
  const { name, phone, city, password, isActive } = req.body;
  const deliveryBoy = await DeliveryBoy.findById(req.params.id);
  if (!deliveryBoy) {
    return res.status(404).json({ success: false, message: "Delivery boy not found" });
  }

  if (name !== undefined) deliveryBoy.name = name.trim();
  if (phone !== undefined) deliveryBoy.phone = phone.trim();
  if (city !== undefined) deliveryBoy.city = city.trim();
  if (isActive !== undefined) deliveryBoy.isActive = isActive;
  if (password && password.trim()) deliveryBoy.password = password.trim();

  await deliveryBoy.save();

  res.json({
    success: true,
    deliveryBoy: {
      id: deliveryBoy._id,
      name: deliveryBoy.name,
      phone: deliveryBoy.phone,
      city: deliveryBoy.city,
      isActive: deliveryBoy.isActive,
    },
  });
});

/* =========================
   ADMIN: DELETE DELIVERY BOY
========================= */
export const deleteDeliveryBoy = asyncHandler(async (req, res) => {
  const deliveryBoy = await DeliveryBoy.findByIdAndDelete(req.params.id);
  if (!deliveryBoy) {
    return res.status(404).json({ success: false, message: "Delivery boy not found" });
  }
  await Order.updateMany(
    { deliveryBoy: req.params.id },
    { $unset: { deliveryBoy: 1 }, status: "placed" }
  );
  res.json({ success: true, message: "Delivery boy removed" });
});
