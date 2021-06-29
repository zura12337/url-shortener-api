const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Url, validate } = require("../models/Url");
const { User, validate: validateUser } = require("../models/User");
const shortid = require("shortid");

router.post("/", async (req, res) => {
  const ip = req.socket.remoteAddress;

  let user = await User.findOne({ ip });
  if (!user) {
    user = new User({
      ip,
    });
  }

  let url = await Url.findOne({ originalUrl: req.body.url });
  if (url) return res.send(url);

  const originalUrl = req.body.url;

  const id = shortid.generate();
  const shortUrl = `http://localhost:4000/${id}`;

  url = new Url({
    originalUrl,
    id,
    shortUrl,
  });

  url.save();
  user.save();

  res.send(url);
});

router.get("/:id", async (req, res) => {
  const url = await Url.findOne({ id: req.params.id });
  if (!url) return res.send("Url not found");

  const ip = req.socket.remoteAddress;
  let user = await User.findOne({ ip });
  if (!user) {
    user = new User({
      ip,
    });
  }

  if (!user.visitedLinks.includes(url._id)) {
    user.visitedLinks.push(url._id);
  }
  url.visitors++;
  if (!url.uniqueVisitors.includes(user._id)) {
    url.uniqueVisitors.push(user._id);
  }

  user.save();
  url.save();

  if (url.uniqueVisitors.includes) res.redirect(url.originalUrl);
});

module.exports = router;
