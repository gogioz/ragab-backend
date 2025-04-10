import mongoose from "mongoose";

// Article Schema
const articleSchema = mongoose.Schema({
  title: { type: String, required: false },
  titleTrans: { type: String, required: false },
  description: { type: String, required: false },
  descriptionTrans: { type: String, required: false },
  image: [String],
  date: { type: String, required: false },
});

// make a model from the Schema
export const Article = mongoose.model("Article", articleSchema);
