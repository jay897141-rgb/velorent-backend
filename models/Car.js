import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    fuel: {
      type: String,
      required: true,
    },
    transmission: {
      type: String,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Car", carSchema);