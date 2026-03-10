import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "./models/User.js";
import Car from "./models/Car.js";
import Booking from "./models/Booking.js";

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   MongoDB Atlas Connection
========================= */

mongoose
mongoose
  .connect("mongodb+srv://jayanthkumar30855_db_user:velorent123@cluster0.s1cnmuz.mongodb.net/velorent")
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log(err));
/* =========================
   JWT Middleware
========================= */

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, "velorent_secret");
    req.user = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* =========================
   Register
========================= */

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.json({ message: "User registered", user });
});

/* =========================
   Login
========================= */

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id },
    "velorent_secret",
    { expiresIn: "7d" }
  );

  res.json({ token });
});

/* =========================
   Cars
========================= */

app.get("/api/cars", async (req, res) => {
  const cars = await Car.find();
  res.json(cars);
});

app.get("/api/cars/:id", async (req, res) => {
  const car = await Car.findById(req.params.id);
  res.json(car);
});

app.post("/api/cars", async (req, res) => {
  const car = await Car.create(req.body);
  res.json(car);
});

/* Delete Car */

app.delete("/api/cars/:id", async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.json({ message: "Car deleted successfully" });
});

/* =========================
   Booking
========================= */

app.post("/api/bookings", protect, async (req, res) => {
  const { carId, startDate, endDate } = req.body;

  const car = await Car.findById(carId);

  if (!car) {
    return res.json({ message: "Car not found" });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const existingBooking = await Booking.findOne({
    car: carId,
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  if (existingBooking) {
    return res.json({
      message: "Car already booked for selected dates",
    });
  }

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const totalAmount = days * car.pricePerDay;

  const booking = await Booking.create({
    user: req.user,
    car: carId,
    startDate,
    endDate,
    totalAmount,
  });

  res.json(booking);
});

/* =========================
   My Bookings
========================= */

app.get("/api/my-bookings", protect, async (req, res) => {
  const bookings = await Booking.find({ user: req.user }).populate("car");
  res.json(bookings);
});

/* =========================
   Cancel Booking
========================= */

app.delete("/api/bookings/:id", protect, async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ message: "Booking cancelled" });
});

/* =========================
   Start Server
========================= */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});