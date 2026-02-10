import asyncHandler from "express-async-handler";
import Cart from "../models/cart.model.js";
import Perfume from "../models/perfume.model.js";

/* =========================
   GET CART
========================= */
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate("items.perfume");

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json({ success: true, cart });
});

/* =========================
   ADD TO CART
========================= */
export const addToCart = asyncHandler(async (req, res) => {
  const { perfumeId, quantity = 1 } = req.body;

  if (!perfumeId) {
    return res.status(400).json({ success: false, message: "Perfume ID is required" });
  }

  const perfume = await Perfume.findById(perfumeId);
  if (!perfume || !perfume.isActive) {
    return res.status(404).json({ success: false, message: "Perfume not found" });
  }

  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  if (qty > (perfume.stock || 0)) {
    return res.status(400).json({
      success: false,
      message: `Only ${perfume.stock} items available`,
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ perfume: perfumeId, quantity: qty }],
    });
  } else {
    const existing = cart.items.find(
      (i) => i.perfume && i.perfume.toString() === perfumeId
    );
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > perfume.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${perfume.stock} items available`,
        });
      }
      existing.quantity = newQty;
    } else {
      cart.items.push({ perfume: perfumeId, quantity: qty });
    }
    await cart.save();
  }

  cart = await Cart.findById(cart._id).populate("items.perfume");
  res.status(201).json({ success: true, cart });
});

/* =========================
   UPDATE CART ITEM QUANTITY
========================= */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  const qty = Math.max(0, parseInt(quantity, 10));
  if (isNaN(qty)) {
    return res.status(400).json({ success: false, message: "Invalid quantity" });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: "Cart item not found" });
  }

  if (qty === 0) {
    cart.items.pull(item._id);
  } else {
    const perfume = await Perfume.findById(item.perfume);
    if (perfume && qty > perfume.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${perfume.stock} items available`,
      });
    }
    item.quantity = qty;
  }
  await cart.save();

  const updated = await Cart.findById(cart._id).populate("items.perfume");
  res.json({ success: true, cart: updated });
});

/* =========================
   REMOVE FROM CART
========================= */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: "Cart item not found" });
  }

  cart.items.pull(item._id);
  await cart.save();

  const updated = await Cart.findById(cart._id).populate("items.perfume");
  res.json({ success: true, cart: updated });
});

/* =========================
   CLEAR CART
========================= */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.json({ success: true, cart: { items: [] } });
  }

  cart.items = [];
  await cart.save();
  res.json({ success: true, cart });
});
