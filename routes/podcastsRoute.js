import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { Podcast } from "../models/podcastModel.js";

const router = express.Router();

// ─── Configure Cloudinary + Multer Storage ─────────────────────────────────

cloudinary.config({
  cloud_name: "dkpsmuui1",
  api_key:    "947953923368561",
  api_secret: "GLBMPiZhWtBawM7Pgq0OH3GZprk",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "ragab/podcasts",
    format: file.mimetype.split("/")[1],  // jpg, png, etc.
  }),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10 MB max per file
    files:    5                   // allow up to 5 files per request
  },
});

// Expect two fields: `cover` (1 file) and `episodeCover` (1 file)
const uploadImages = (req, res, next) => {
  // Handle podcast cover and episode covers dynamically
  upload.fields([
    { name: "cover", maxCount: 1 }, // For podcast cover
    { name: "episodeCover_0", maxCount: 1 }, // For episode 1 cover
    { name: "episodeCover_1", maxCount: 1 }, // For episode 2 cover (etc.)
    // Add more if needed, e.g., episodeCover_2, episodeCover_3...
  ])(req, res, next);
};
// ─── CREATE A NEW PODCAST ────────────────────────────────────────────────────
router.post("/podcasts", uploadImages, async (req, res) => {
  try {
    const {
      name,
      description,
      episodes,  // This will be an array of episode details
    } = req.body;

    // Handle file uploads
    const coverUrl = req.files.cover[0].path;

    // Map through episodes to handle the episode covers if they exist
    const updatedEpisodes = episodes.map((episode, index) => {
      const episodeCoverUrl = req.files[`episodeCover_${index}`]
        ? req.files[`episodeCover_${index}`][0].path
        : null;

      return {
        episodeName: episode.episodeName,
        episodeDescription: episode.episodeDescription,
        episodeLink: episode.episodeLink,
        episodeCover: episodeCoverUrl,  // If episode cover exists, add it
      };
    });

    // Create the new podcast
    const newPodcast = new Podcast({
      name,
      description,
      cover: coverUrl,
      episodes: updatedEpisodes,  // Assign the array of episodes
    });

    await newPodcast.save();
    return res.status(201).json(newPodcast);

  } catch (err) {
    console.error("Error creating podcast:", err);
    return res.status(500).json({ message: err.message });
  }
});


// ─── GET ALL PODCASTS ─────────────────────────────────────────────────────────
router.get("/podcasts", async (req, res) => {
  try {
    const podcasts = await Podcast.find();
    return res.json(podcasts);
  } catch (err) {
    console.error("Error fetching podcasts:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ─── GET ONE PODCAST ──────────────────────────────────────────────────────────
router.get("/podcasts/:podcastId", async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.podcastId);
    if (!podcast) return res.status(404).json({ message: "Not found" });
    return res.json(podcast);
  } catch (err) {
    console.error("Error fetching podcast:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ─── GET ALL EPISODES FOR A PODCAST ───────────────────────────────────────────
router.get("/podcasts/:podcastId/episodes", async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.podcastId);
    if (!podcast) return res.status(404).json({ message: "Not found" });
    return res.json(podcast.episodes);
  } catch (err) {
    console.error("Error fetching episodes:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ─── GET ONE EPISODE BY ID ────────────────────────────────────────────────────
router.get("/podcasts/:podcastId/episodes/:episodeId", async (req, res) => {
  try {
    const { podcastId, episodeId } = req.params;
    const podcast = await Podcast.findById(podcastId);
    if (!podcast) return res.status(404).json({ message: "Podcast not found" });

    const episode = podcast.episodes.id(episodeId);
    if (!episode) return res.status(404).json({ message: "Episode not found" });

    return res.json(episode);
  } catch (err) {
    console.error("Error fetching episode:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ─── PATCH (UPDATE) ONE EPISODE ───────────────────────────────────────────────
// POST /podcasts/:podcastId/episodes
router.post(
  "/podcasts/:podcastId/episodes",
  upload.single("episodeCover"),
  async (req, res) => {
    const { podcastId } = req.params;
    const { episodeName, episodeDescription, episodeLink } = req.body;
    const episodeCover = req.file.path;               // Cloudinary URL

    const podcast = await Podcast.findById(podcastId);
    if (!podcast) return res.status(404).json({ message: "Not found" });

    podcast.episodes.push({
      episodeName,
      episodeDescription,
      episodeLink,
      episodeCover,
    });

    await podcast.save();
    res.status(201).json(podcast.episodes.at(-1));    // return the newly added episode
  }
);
// DELETE /podcasts/:podcastId
router.delete("/podcasts/:podcastId", async (req, res) => {
  try {
    const { podcastId } = req.params;

    // Find and delete the podcast
    const podcast = await Podcast.findByIdAndDelete(podcastId);
    if (!podcast) return res.status(404).json({ message: "Podcast not found" });

    return res.json({ message: "Podcast deleted successfully" });
  } catch (err) {
    console.error("Error deleting podcast:", err);
    return res.status(500).json({ message: err.message });
  }
});



export default router;
