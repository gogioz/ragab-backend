import express from "express";
import { Article } from "../models/articleModel.js";
import multer from "multer";

import { MongoClient, ObjectId } from "mongodb";
import { mongoDBURL } from "../config.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const client = new MongoClient(mongoDBURL);
await client.connect();

const router = express.Router();

cloudinary.config({
  cloud_name: "dkpsmuui1",
  api_key: "947953923368561",
  api_secret: "GLBMPiZhWtBawM7Pgq0OH3GZprk",
});

// Set up Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ragab",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024, files: 30 }, });

const uploadImages = upload.fields([{ name: "image", maxCount: 30 }]);

// in routes/articlesRoute.js
router.post("/articles", (req, res, next) => {
  uploadImages(req, res, err => {
    if (err) {
      console.error("⛔️ Multer error:", err);
      return res.status(400).json({ error: err.message });
    }

    // very first thing, log the incoming data:
    console.log("🏷  req.body:", req.body);
    console.log("📁 req.files:", req.files);
    console.log("→ images array length:", (req.files.image || []).length);

    next();  
  });
}, async (req, res) => {
  try {
    const { title, titleTrans, description, descriptionTrans, date } = req.body;
    const imageFiles = req.files.image || [];
    const imagePaths = imageFiles.map(f => f.path);
    console.log("✔️ imagePaths:", imagePaths);

    const newArticle = {
      title, titleTrans, description, descriptionTrans, date,
      image: imagePaths
    };

    const col = client.db("test").collection("articles");
    const result = await col.insertOne(newArticle);
    console.log("✅ Inserted:", newArticle);
    res.status(201).json(result);
  } catch (e) {
    console.error("🔥 Server-side error in /articles:", e);
    res.status(500).json({ error: e.message });
  }
});


// get all articles in databasee
router.get("/articles", async (req, res) => {
  try {
    const articles = await Article.find({});
    return res.status(200).json({
      count: articles.length,
      data: articles,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// get one article in database by id
router.get("/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id)
    console.log(id);
    // Execute query
    const article = await Article.findOne({ _id: id });
    // const article = await articles.findOne({ _id: id });

    console.log(article);
    return res.send(article);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// update an article in the database
router.put("/articles/:id", uploadImages, async (req, res) => {
  try {
      console.log("🏷  req.body:", req.body);
    console.log("📁 req.files:", req.files);
    const { id } = req.params;
    const { title, titleTrans, description, descriptionTrans, date } = req.body;


    const imageName = req.files.map((image) => image.path) || [];

    const update = {
      $set: {
        title,
        titleTrans,
        description,
        descriptionTrans,
        date,
        image: imageName,
      },
      $inc: {
        views: 1,
      },
    };

    const database = client.db("test");
    const article = database.collection("articles");
    const filter = { _id: new ObjectId(id) };

    const result = await article.updateOne(filter, update);
    return res.send(result);
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    res.status(500).send({ message: err.message });
  }
});

// delete article from the database
router.delete("/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const database = client.db("test");
    const articles = database.collection("articles");

    const result = await articles.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Article not found" });
    }

    return res.status(200).send({ message: "Article deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).send({ message: "Internal server error" });
  }
});

export default router;
