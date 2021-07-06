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
const auth = require('../middleware/auth');

router.post("/url", auth, async (req, res) => {
  var URLPattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );

  if (!URLPattern.test(req.body.url))
    return res.status(400).send("Enter valid URL");

  let url = await Url.findOne({ originalUrl: req.body.url });
  if (url) return res.send(url);

  const originalUrl = req.body.url;

  const id = shortid.generate();
  const shortUrl = `${process.env.WEBSITE_URL}/${id}`;

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

router.put("/url/edit", auth, async (req, res) => {
  const url = await Url.findOne({ id: req.body.id });

  if(url.generatedBy === req.user) {
    if(req.body.action === "pause") url.status === "paused";
    if(req.body.action === "unpause") url.status === "active";
    if(req.body.action === "remove") url.status === "removed";
  };

  await url.save();

  res.send(url.status);
});

router.get("/url/:id", auth, async (req, res) => {
  const url = await Url.findOne({ id: req.params.id });
  if (!url) return res.send("Url not found");
console.log(req.user);

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

  const urls = await Url.find({ generatedBy: user._id }).sort({ _id: -1 });

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

router.get("/visited", auth, async(req, res) => {
  let user = await User.findOne({ ip: req.user }).populate("visitedLinks");

  res.send(user.visitedLinks);
})


module.exports = router;
