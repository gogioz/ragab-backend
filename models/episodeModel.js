import mongoose from "mongoose";

const episodeSchema = new mongoose.Schema({
  episodeName: { type: String, required: true },
  episodeDescription: { type: String, required: true },
  episodeCover: { type: String, required: true },
  episodeLink: { type: String, required: true },
});

export const Episode = mongoose.model("Episode", episodeSchema);
