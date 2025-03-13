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

// Function to generate a random date within the last N days
const getRandomDate = (days) => {
  const today = new Date();
  const randomDaysAgo = Math.floor(Math.random() * days);
  return new Date(today.setDate(today.getDate() - randomDaysAgo));
};

// Function to pick a random customer status
const getRandomCustomerStatus = () => {
  const statuses = ["Active", "Pending", "Cancelled"];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Function to pick a random order status
const getRandomOrderStatus = () => {
  const statuses = ["Pending", "Complete", "Cancelled", "Return"];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Function to generate random product names
const getRandomProduct = () => {
  const products = [
    { name: "Smartphone", brand: "TechBrand", price: 699 },
    { name: "Laptop", brand: "UltraComp", price: 1200 },
    { name: "Headphones", brand: "SoundMax", price: 199 },
    { name: "Smartwatch", brand: "TimeTech", price: 249 },
    { name: "Tablet", brand: "TabWare", price: 499 },
  ];
  return products[Math.floor(Math.random() * products.length)];
};

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
    console.log("🗑️ Clearing existing data...");
    await Customer.deleteMany();
    await Order.deleteMany();
    await Employee.deleteMany();

    // 🔹 Step 2: Insert Customers with correct email handling
    customersData = customersData.map((customer) => {
      const emailKey = Object.keys(customer).find(
        (key) => key.trim().toLowerCase() === "email"
      );

      return {
        _id: new mongoose.Types.ObjectId(customer._id?.$oid || customer._id),
        name:
          customer.Name?.trim() ||
          `Customer_${Math.random().toString(36).substr(2, 5)}`,
        email: emailKey ? customer[emailKey].trim() : "unknown@example.com",
        status: getRandomCustomerStatus(),
        weeks: customer.Weeks || Math.floor(Math.random() * 10) + 1,
        address: customer.Address || "Unknown",
        yearlyAmountSpent: mongoose.Types.Decimal128.fromString(
          parseFloat(
            customer.YearlyAmountSpent || Math.random() * 5000
          ).toFixed(2)
        ),
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

    const customerIds = customers.map((cust) => cust._id);

    // 🔹 Step 3: Insert Orders with required fields
    ordersData = ordersData.map((order) => {
      const randomProduct = getRandomProduct();
      const discountedPrice = (
        randomProduct.price *
        (Math.random() * 0.3 + 0.7)
      ).toFixed(2);

      return {
        _id: new mongoose.Types.ObjectId(order._id?.$oid || order._id),
        customerId: customerIds[Math.floor(Math.random() * customerIds.length)],
        productName: order.productName || randomProduct.name,
        brand: order.brand || randomProduct.brand,
        productUrl:
          order.productUrl ||
          `https://example.com/${randomProduct.name
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
        retailPrice: order.retailPrice || randomProduct.price,
        discountedPrice: order.discountedPrice || discountedPrice,
        status: order.status || getRandomOrderStatus(),
        location: order.location || "Warehouse A",
        image:
          Array.isArray(order.image) && order.image.length > 0
            ? order.image
            : [
                `https://example.com/images/${randomProduct.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}.jpg`,
              ],
        createdAt: getRandomDate(30),
        updatedAt: new Date(),
      };
    });

    await safeInsertMany(Order, ordersData, "orders");
    await delay(1000);

    // 🔹 Step 4: Insert Employees
    employeesData = employeesData.map((employee) => ({
      _id: new mongoose.Types.ObjectId(employee._id?.$oid || employee._id),
      name:
        employee.name || `Employee_${Math.random().toString(36).substr(2, 5)}`,
      education: employee.education || "Unknown",
      joiningDate: employee.joining_year || Date.now(),
      city: employee.city?.trim() || "Unknown",
      age: employee.age || Math.floor(Math.random() * 30) + 20,
      gender: employee.gender || "Other",
      leaveOrNot: employee.leave_or_not?.toString().toLowerCase() === "yes",
    }));

    await safeInsertMany(Employee, employeesData, "employees");

    console.log("🎉 Database seeding completed successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed", error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(seedDatabase);
