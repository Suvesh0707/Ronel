import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        perfume: { type: mongoose.Schema.Types.ObjectId, ref: "Perfume", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["placed", "packed", "shipping", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
    },
    deliveredAt: { type: Date },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["online", "cod"],
      default: "online",
    },
    platformFee: { type: Number, default: 0 },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy" },
    deliveryNotes: { type: String },
    replacementRequest: {
      requestedAt: Date,
      reason: { type: String, default: "damaged" },
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
      comment: String,
      proofUrls: [{ type: String }],
      resolvedAt: Date,
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
