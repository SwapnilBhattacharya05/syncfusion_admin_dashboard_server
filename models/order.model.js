import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    productUrl: { type: String },
    productName: { type: String },
    retailPrice: { type: Number },
    discountedPrice: { type: Number },
    image: { type: [String] },
    status: {
      type: String,
      enum: ["Pending", "Complete", "Cancelled", "Return"],
      default: "Pending",
    },
    location: { type: String },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    brand: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
