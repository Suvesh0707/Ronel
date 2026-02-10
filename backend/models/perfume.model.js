import mongoose from "mongoose";

const perfumeSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: false, // Admin may skip
    },

    // Pricing
    price: {
      type: Number,
      required: true,
    },

    // Perfume Properties
    intensity: {
      type: String,
      enum: ["low", "light", "medium", "strong", "very strong"],
      required: true,
    },

    fragrance: {
      type: String,
      required: true,
      trim: true,
    },

    // Navora-style fragrance pyramid (top / heart / base)
    topNote: { type: String, trim: true },
    heartNote: { type: String, trim: true },
    baseNote: { type: String, trim: true },

    inspiredBy: {
      type: String,
      required: false,
    },

    volume: {
      type: Number, // in ml
      required: true,
    },

    // Stock Management
    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    sold: {
      type: Number,
      default: 0, // Used ONLY for trending
    },

    // Media
    images: [
      {
        type: String,
        required: true,
      },
    ],

    // Visibility Control
    isActive: {
      type: Boolean,
      default: true, // Admin can hide product
    },

    // Admin Reference (Single Admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Perfume", perfumeSchema);
