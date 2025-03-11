import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Active", "Cancelled"],
      default: "Pending",
    },
    weeks: { type: Number, default: 0 },
    address: { type: String },
    yearlyAmountSpent: {
      type: mongoose.Schema.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString("0.0"), // ✅ Fix default value
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
