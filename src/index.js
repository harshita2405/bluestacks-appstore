import express from "express";
import bodyParser from "body-parser";
import connectDB from "./config/db";
import appRouter from "./routes";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());

// Connect DB
connectDB();

// Init middleware
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, "client", "build")));

// Define and use routes
app.use(appRouter);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
