import { Schema, model } from "mongoose";
import AppDetailSchema from "./AppDetailSchema";

const AppSchema = new Schema({
  pkg: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  company: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  details: {
    type: AppDetailSchema,
    required: false
  }
});

const AppModel = model("app", AppSchema);

export default AppModel;
