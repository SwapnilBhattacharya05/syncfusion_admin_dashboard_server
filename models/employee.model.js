import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String,  },
    education: { type: String,  },
    joiningDate: { type: Number,  },
    city: { type: String,  },
    age: { type: Number,  },
    gender: { type: String, enum: ["Male", "Female", "Other"],  },
    leaveOrNot: { type: Boolean,  },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
