import express from "express";
import { Admin } from "../models/loginModel.js";

const router = express.Router();

router.post("/admins", async (req, res) => {
  try {
    // if the not there, send alert
    if (!req.body.username || !req.body.password) {
      return res.status(400).send({
        message: "Send all required fields: username,password",
      });
    }
    // handle new admin
    const newAdmin = {
      username: req.body.username,
      password: req.body.password,
    };

    // create the new admin
    const admin = await Admin.create(newAdmin);

    // if success send the book
    return res.status(201).send(admin);
    // if not handle the error
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

router.get("/admins", async (req, res) => {
  try {
    const admins = await Admin.find({});
    return res.status(200).json({
      count: admins.length,
      data: admins,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

router.get("/admin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    return res.status(200).json(admin);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

router.put("/admin/:id", async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).send({
        message: "Send all required fields: username, password",
      });
    }

    const { id } = req.params;

    const result = await Admin.findByIdAndUpdate(id, req.body);

    if (!result) {
      return res.status(404).send({ message: "Admin not found" });
    }

    return res.status(200).send({ message: "Admin updated successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});
export default router;
