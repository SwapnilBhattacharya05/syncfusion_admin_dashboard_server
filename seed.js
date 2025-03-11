import mongoose from "mongoose";
import fs from "fs-extra";
import Customer from "./models/customer.model.js";
import Order from "./models/order.model.js";
import Employee from "./models/employee.model.js";
import { MONGO_URI } from "./config/env.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};

// Utility function to add delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to insert data and handle duplicate key errors
const safeInsertMany = async (model, data, name) => {
  try {
    const result = await model.insertMany(data, { ordered: false });
    console.log(`✅ Inserted ${result.length} ${name}`);
    return result;
  } catch (error) {
    console.warn(
      `⚠️ Some ${name} skipped due to duplicate keys:`,
      error.writeErrors?.length || 0
    );
    return [];
  }
};

// Seed database
const seedDatabase = async () => {
  try {
    console.log("📥 Reading JSON datasets...");
    let customersData = await fs.readJson("datasets/ecommerce.users.json");
    let ordersData = await fs.readJson("datasets/ecommerce.orders.json");
    let employeesData = await fs.readJson("datasets/ecommerce.employees.json");

    // 🔹 Step 1: Clear existing data
    await Customer.deleteMany();
    await Order.deleteMany();
    await Employee.deleteMany();
    console.log("🗑️ Existing data cleared");

    // 🔹 Step 2: Insert Customers
    customersData = customersData.map((customer) => {
      // Detect the correct email key dynamically
      const emailKey = Object.keys(customer).find(
        (key) => key.trim().toLowerCase() === "email"
      );

      return {
        _id: new mongoose.Types.ObjectId(customer._id?.$oid || customer._id),
        name:
          customer.Name?.trim() ||
          `Customer_${Math.random().toString(36).substr(2, 5)}`,
        email: emailKey ? customer[emailKey].trim() : "unknown@example.com", // ✅ Fixes undefined email issue
        status: customer.Status || "Pending",
        weeks: customer.Weeks || 0,
        address: customer.Address || "Unknown",
        yearlyAmountSpent:
          customer.YearlyAmountSpent !== undefined
            ? mongoose.Types.Decimal128.fromString(
                parseFloat(customer.YearlyAmountSpent).toFixed(2)
              )
            : mongoose.Types.Decimal128.fromString("0.0"), // ✅ Ensures proper Decimal128 format
      };
    });

    const customers = await safeInsertMany(
      Customer,
      customersData,
      "customers"
    );
    await delay(1000);

    if (customers.length === 0) {
      console.error("❌ No customers inserted, skipping orders.");
      return;
    }

    // Create an array of customer IDs for random assignment
    const customerIds = customers.map((cust) => cust._id);

    // 🔹 Step 3: Insert Orders with valid customer IDs
    ordersData = ordersData.map((order) => ({
      ...order,
      _id: new mongoose.Types.ObjectId(order._id?.$oid || order._id),
      customerId: customerIds[Math.floor(Math.random() * customerIds.length)], // Assign a valid customer
    }));

    await safeInsertMany(Order, ordersData, "orders");
    await delay(1000);

    // 🔹 Step 4: Insert Employees
    employeesData = employeesData.map((employee) => ({
      ...employee,
      _id: new mongoose.Types.ObjectId(employee._id?.$oid || employee._id),
    }));

    await safeInsertMany(Employee, employeesData, "employees");

    console.log("🎉 Database seeding completed!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed", error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(seedDatabase);
