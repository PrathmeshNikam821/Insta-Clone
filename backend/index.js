import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./utils/db.js";
import userRouter from "./routes/user.route.js";

dotenv.config({});
const app = express();

const PORT = process.env.PORT || 3000;

//routes

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "I am coming from backend",
    success: true,
  });
});

//middlewares

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
  origin: "http://localhost:5173",
  Credentials: true,
};

app.use(cors(corsOptions));

//routes from controllers -->APIs

app.use("/api/v1/user", userRouter);
// "http://localhost:8000/api/v1/user/register"

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on address http://localhost:${PORT}`);
});
