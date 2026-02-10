import asyncHandler from "express-async-handler";
import Address from "../models/address.model.js";

const INDIA_POST_API = "https://api.postalpincode.in/pincode";

/* =========================
   PINCODE LOOKUP (India Post API)
========================= */
export const lookupPincode = asyncHandler(async (req, res) => {
  const { pincode } = req.params;
  const trimmed = (pincode || "").trim();
  if (!/^\d{6}$/.test(trimmed)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid 6-digit pincode",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const response = await fetch(`${INDIA_POST_API}/${trimmed}`, {
    signal: controller.signal,
  });
  clearTimeout(timeout);
  const data = await response.json();

  if (!Array.isArray(data) || !data[0]) {
    return res.status(404).json({
      success: false,
      message: "Pincode not found",
    });
  }

  const item = data[0];
  if (item.Status !== "Success" || !item.PostOffice || !item.PostOffice.length) {
    return res.status(404).json({
      success: false,
      message: item.Message || "Pincode not found",
    });
  }

  const offices = item.PostOffice;
  const first = offices[0];
  const state = first.State || "";
  const district = first.District || "";
  const city = first.Block || first.District || "";
  const areas = [...new Set(offices.map((p) => p.Name).filter(Boolean))];

  res.json({
    success: true,
    state,
    district,
    city,
    areas,
  });
});

/* =========================
   ADD ADDRESS
========================= */
export const addAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    pincode,
    state,
    district,
    city,
    area,
    addressLine,
    landmark,
    isDefault,
  } = req.body;

  if (
    !fullName ||
    !phone ||
    !pincode ||
    !state ||
    !city ||
    !area ||
    !addressLine
  ) {
    return res.status(400).json({
      success: false,
      message: "All required fields are mandatory",
    });
  }

  if (isDefault) {
    await Address.updateMany(
      { user: req.user._id },
      { isDefault: false }
    );
  }

  const address = await Address.create({
    user: req.user._id,
    fullName,
    phone,
    pincode,
    state,
    district,
    city,
    area,
    addressLine,
    landmark,
    isDefault,
  });

  res.status(201).json({ success: true, address });
});

/* =========================
   GET USER ADDRESSES
========================= */
export const getMyAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  res.json({ success: true, addresses });
});

/* =========================
   UPDATE ADDRESS
========================= */
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  if (req.body.isDefault) {
    await Address.updateMany(
      { user: req.user._id },
      { isDefault: false }
    );
  }

  Object.assign(address, req.body);
  await address.save();

  res.json({ success: true, address });
});

/* =========================
   DELETE ADDRESS
========================= */
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  res.json({
    success: true,
    message: "Address deleted successfully",
  });
});
