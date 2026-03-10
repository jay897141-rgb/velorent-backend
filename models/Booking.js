import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    startDate: Date,
    endDate: Date,
    totalAmount: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);