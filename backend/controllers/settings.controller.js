import asyncHandler from "express-async-handler";
import Settings from "../models/settings.model.js";
import { getCodEnabled } from "../utils/settings.js";

const COD_KEY = "codEnabled";

/* =========================
   GET COD ENABLED (public - for Cart checkout)
========================= */
export const getCodEnabledSetting = asyncHandler(async (req, res) => {
  const enabled = await getCodEnabled();
  res.json({ success: true, codEnabled: enabled });
});

/* =========================
   ADMIN: GET COD ENABLED
========================= */
export const adminGetCodSetting = asyncHandler(async (req, res) => {
  const enabled = await getCodEnabled();
  res.json({ success: true, codEnabled: enabled });
});

/* =========================
   ADMIN: SET COD ENABLED (enable/disable Cash on Delivery)
========================= */
export const adminSetCodSetting = asyncHandler(async (req, res) => {
  const { codEnabled } = req.body;
  if (typeof codEnabled !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Body must include codEnabled: true or false",
    });
  }
  await Settings.findOneAndUpdate(
    { key: COD_KEY },
    { $set: { key: COD_KEY, value: codEnabled } },
    { upsert: true, new: true }
  );
  res.json({
    success: true,
    codEnabled,
    message: `Cash on Delivery is now ${codEnabled ? "enabled" : "disabled"}.`,
  });
});
