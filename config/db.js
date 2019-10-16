import mongoose from "mongoose";
import config from "config";

const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    console.log(db);
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    });
    console.log("Mongo DB connected ...");
  } catch (err) {
    console.log(err.message);

    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
