import { Schema } from "mongoose";

const AppDetailSchema = new Schema({
  images: [
    {
      type: String
    }
  ],
  description: {
    type: String,
    required: true
  },
  ratingsCount: {
    type: String
  },
  lastUpdated: {
    type: String
  },
  developer: {
    type: String
  }
});

export default AppDetailSchema;
