import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const db =
      process.env.MONGO_URI ||
      "mongodb+srv://harshita2405:harshita2405@devconnector-ppmsh.mongodb.net/test?retryWrites=true&w=majority";
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
