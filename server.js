import express from "express";
import bodyParser from "body-parser";
import connectDB from "./config/db";
import appRouter from "./routes";
import cors from "cors";

const app = express();
app.use(cors());

// Connect DB
connectDB();

// Init middleware
app.use(bodyParser.json({ extended: false }));

// Define and use routes
app.use(appRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
