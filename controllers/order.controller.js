import Order from "../models/order.model.js";

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user_id");
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
