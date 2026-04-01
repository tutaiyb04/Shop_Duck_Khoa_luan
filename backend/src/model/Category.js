const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
