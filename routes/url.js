const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Url } = require("../models/Url");
const { User } = require("../models/User");
const shortid = require("shortid");
const dateFormat = require("dateformat");
const urlMetadata = require("url-metadata");
const parser = require("ua-parser-js");
const { lookup } = require("geoip-lite");
const auth = require("../middleware/auth");

router.post("/url", auth, async (req, res) => {
  const expression =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  const URLPattern = new RegExp(expression);

  if (!URLPattern.test(req.body.url))
    return res.status(400).send("Enter valid URL");

  const createdUrls = await Url.find({ generatedBy: req.user });
  if (createdUrls.length === 20) {
    return res.status(503).send("You reached limit");
  }

  let url = await Url.findOne({ originalUrl: req.body.url });
  if (url && url.generatedBy === req.user) {
    return res.send(url);
  }

  const originalUrl = req.body.url;

  const id = shortid.generate();
  const shortUrl = `${process.env.WEBSITE_URL}/${id}`;

  url = new Url({
    originalUrl,
    id,
    shortUrl,
    generatedBy: req.user,
  });

  url.save();

  res.send(url);
});

router.get("/role/:id", auth, async (req, res) => {
  let url = await Url.findOne({ id: req.params.id });
  if (url.generatedBy === req.user) {
    res.send("admin");
  } else {
    res.send("user");
  }
});

router.put("/url/edit", auth, async (req, res) => {
  let url = await Url.findOne({ id: req.body.id });

  if (url.generatedBy === req.user) {
    url.status = req.body.action;
    if (req.body.action === "remove") {
      url = await Url.findOneAndUpdate(
        { id: req.body.id },
        {
          id: url.id,
          status: "remove",
          originalUrl: "",
          shortUrl: "",
          visitors: [],
          uniqueVisitors: [],
          generatedBy: "",
        },
        { new: true }
      );
    }
    if (req.body.action === "unpause") {
      url.status = "active";
    }
  } else {
    return res.status(403).send("You don't have permissions to edit this URL");
  }

  await url.save();

  res.send(url.status);
});

router.get("/url/:id", auth, async (req, res) => {
  const url = await Url.findOne({ id: req.params.id });
  if (!url) return res.status(404).send("Url not found");

  if (url.status === "pause") {
    return res.status(403).send("Sorry, URL is disabled by it's owner");
  } else if (url.status === "remove") {
    return res.status(403).send("Sorry, URL has been removed by it's owner");
  }

  let ua = parser(req.headers["user-agent"]);
  ua = (({ os, browser }) => ({ os: os.name, browser: browser.name }))(ua);

  const user = await User.findOne({ ip: req.user });

  const location = lookup(user.ip);

  const date = dateFormat(new Date(), "yyyy-mm-dd");

  if (!user.visitedLinks.includes(url._id)) {
    user.visitedLinks.push(url._id);
  }

  url.visitors.push({
    date,
    ip: user.ip,
    os: ua.os,
    browser: ua.browser,
    location: location ? `${location.country}, ${location.city}` : "N/A",
  });

  if (url.uniqueVisitors.length === 0) {
    url.uniqueVisitors.push({
      date,
      ip: user.ip,
    });
  } else {
    if (!url.uniqueVisitors.find((visitor) => visitor.ip === user.ip)) {
      url.uniqueVisitors.push({
        date,
        ip: user.ip,
      });
    }
  }

  user.save();
  url.save();

  res.json(url.originalUrl);
});

router.get("/urls/me", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const user = await User.findOne({ ip });
  if (!user) return res.send([]);

  const urls = await Url.find({ generatedBy: user.ip }).sort({ _id: -1 });

  res.send(urls);
});

router.get("/statistics/:id", async (req, res) => {
  const url = await Url.findOne({ id: req.params.id });
  if (!url) return res.status(404).send("Url Not Found");

  let metadata = await urlMetadata(url.originalUrl).catch((e) => {
    console.log(e);
  });
  if (metadata) {
    metadata = (({ title, image }) => ({ title, image }))(metadata);
  }

  res.send({ metadata, url });
});

router.get("/visited", auth, async (req, res) => {
  let user = await User.findOne({ ip: req.user }).populate("visitedLinks");

  res.send(user.visitedLinks);
});

module.exports = router;
