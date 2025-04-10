// routes.js
import express, { json } from "express";
import { Podcast } from "../models/podcastModel.js";

const router = express.Router();
import multer from "multer";

import { MongoClient, ObjectId } from "mongodb";
import { mongoDBURL } from "../config.js";
const client = new MongoClient(mongoDBURL);
// Set up Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const uploadImages = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "episodeCover", maxCount: 1 },
]);
router.post("/podcasts", uploadImages, async (req, res) => {
  try {
    await client.connect();
    // Get the database and collection on which to run the operation
    const db = client.db("test");
    const col = db.collection("podcasts");
    const { name, description, episodeName, episodeLink, episodeDescription } =
      req.body;
    const podcastCoverName = req.files["cover"][0].filename;
    const episodeCoverName = req.files["episodeCover"][0].filename;

    const episode = {
      episodeName: episodeName,
      episodeDescription: episodeDescription,
      episodeLink: episodeLink,
      episodeCover: episodeCoverName,
    };
    const newPodcast = {
      name: name,
      description: description,
      cover: podcastCoverName,
      episodes: [episode],
    };
    const p = await col.insertOne(newPodcast);

    return res.send(p);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// get all articles in databasee
router.get("/podcasts", async (req, res) => {
  try {
    const podcasts = await Podcast.find({});
    return res.status(200).json({
      count: podcasts.length,
      data: podcasts,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// get one article in database by id
router.get("/podcasts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    // Execute query
    const podcast = await Podcast.findOne({ _id: id });
    // const article = await articles.findOne({ _id: id });

    return res.send(podcast);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// update an article in the database
router.put("/podcasts/:id", upload.single("episodeCover"), async (req, res) => {
  try {
    const database = client.db("test");
    const podcast = database.collection("podcasts");
    const { name, description, cover, episodes } = req.body;

    const parsedEpisodes = JSON.parse(episodes);

    const update = {
      $set: {
        name: name,
        description: description,
        episodes: parsedEpisodes,
        cover: cover,
      },
      $inc: {
        views: 1,
      },
    };
    const { id } = req.params;

    const filter = { _id: new ObjectId({ id }) };

    // Update the document

    const result = await podcast.updateOne(filter, update);
    return res.send(result);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// delete article from the database
router.delete("/podcasts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Podcast.findByIdAndDelete(id);
    if (result === false) {
      return res.status(404).send({ message: "Podcast not found" });
    }
    return res.status(200).send({ message: "Podcast deleted successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: "Podcast not found" });
  }
});

// GET /podcasts/:id/episodes
router.get("/podcasts/:id/episodes", async (req, res) => {
  try {
    const { id } = req.params;
    const podcast = await Podcast.findById(id);

    if (!podcast) {
      return res.status(404).json({ message: "Podcast not found" });
    }

    return res.status(200).json({
      count: podcast.episodes.length,
      data: podcast.episodes,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});
// PUT /podcasts/:podcastId/episodes/:episodeId
router.put("/podcasts/:podcastId/episodes/:episodeId", async (req, res) => {
  try {
    const { podcastId, episodeId } = req.params;
    const { episodeName, episodeDescription, episodeLink, episodeCover } = req.body;

    const podcast = await Podcast.findById(podcastId);
    if (!podcast) return res.status(404).json({ message: "Podcast not found" });

    const episode = podcast.episodes.id(episodeId);
    if (!episode) return res.status(404).json({ message: "Episode not found" });

    episode.episodeName = episodeName;
    episode.episodeDescription = episodeDescription;
    episode.episodeLink = episodeLink;
    episode.episodeCover = episodeCover;

    await podcast.save();
    return res.status(200).json({ message: "Episode updated", episode });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
