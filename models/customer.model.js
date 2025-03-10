import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
