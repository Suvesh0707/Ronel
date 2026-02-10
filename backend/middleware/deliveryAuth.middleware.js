import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import DeliveryBoy from "../models/deliveryBoy.model.js";

export const protectDeliveryBoy = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.deliveryToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "delivery") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(decoded.id).select("-password");
    if (!deliveryBoy) {
      return res.status(401).json({
        success: false,
        message: "Delivery boy not found",
      });
    }
    if (!deliveryBoy.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    req.deliveryBoy = deliveryBoy;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid",
    });
  }
});
