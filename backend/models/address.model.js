import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: true,
    },

    area: {
      type: String,
      required: true, // dropdown OR "Other"
    },

    addressLine: {
      type: String,
      required: true, // manual entry
    },

    landmark: {
      type: String,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
