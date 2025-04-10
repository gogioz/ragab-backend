import mongoose from "mongoose";
// import { Episode } from "./episodeModel.js";
const episodeSchema = new mongoose.Schema({
  episodeName: { type: String, required: true },
  episodeDescription: { type: String, required: true },
  episodeCover: { type: String, required: true },
  episodeLink: { type: String, required: true },
});

const podcastSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cover: { type: String, required: true },
  description: { type: String, required: true },
  episodes: {
    type: [episodeSchema],
    required: true,
  },
});
export const Podcast = mongoose.model("Podcast", podcastSchema);
