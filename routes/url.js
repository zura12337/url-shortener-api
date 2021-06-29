const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Url } = require("../models/Url");
const { User } = require("../models/User");
const shortid = require("shortid");
const dateFormat = require("dateformat");

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
    generatedBy: user.ip,
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

  const date = dateFormat(new Date(), "yyyy-mm-dd");

  if (!user.visitedLinks.includes(url._id)) {
    user.visitedLinks.push(url._id);
  }

  url.visitors.push({
    date,
    ip: user.ip,
  });

  if (url.uniqueVisitors.length === 0) {
    url.uniqueVisitors.push({
      date,
      ip: user.ip,
    });
  } else {
    url.uniqueVisitors.forEach((visitor) => {
      if (visitor.ip !== user.ip) {
        url.uniqueVisitors.push({
          date,
          ip: user.ip,
        });
      }
    });
  }

  user.save();
  url.save();

  res.redirect(url.originalUrl);
});

module.exports = router;
