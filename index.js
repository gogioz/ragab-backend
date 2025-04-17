import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import articlesRoute from "./routes/articlesRoute.js";
import adminsRoute from "./routes/adminsRoute.js";
import podcastsRoute from "./routes/podcastsRoute.js";
// import podcastsRoute from "./routes/podcastsRoute.js";

import { mongoDBURL, PORT } from "./config.js";

// run the app with express
const app = express();

// return the body in json format
app.use(express.json());
//app.use(express.json({ limit: "25mb" }));
//app.use(express.urlencoded({ limit: "25mb", extended: true }));


app.use(
  cors({
     origin: "*",  // Allow all origins (for development). For production, use your frontend URL like "http://localhost:3000"
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"], // Allow the necessary headers
    
  })
);

app.use("/", articlesRoute, podcastsRoute, adminsRoute);

mongoose
  // connect to the database
  .connect(mongoDBURL)
  // hadle the promise
  .then(() => {
    console.log("App connected to database");
    // if its connected successuflly, make the app open in the port
    app.listen(PORT, () => {
      console.log(`App is listening to port ${PORT}`);
    });
  })
  // if not handle the error
  .catch((err) => {
    console.log(err);
  });

// get the data
app.get("/", (req, res) => {
  return res.send("Welcome To Ahmed Ragab's Database ");
});
