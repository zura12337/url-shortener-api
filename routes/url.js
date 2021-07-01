const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Url } = require("../models/Url");
const { User } = require("../models/User");
const shortid = require("shortid");
const dateFormat = require("dateformat");
const urlMetadata = require("url-metadata");
const parser = require("ua-parser-js");
const publicIp = require("public-ip");

router.post("/", async (req, res) => {
  const ip = await publicIp.p4();

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
  const shortUrl = `${process.env.WEBSITE_URL}/${id}`;

  url = new Url({
    originalUrl,
    id,
    shortUrl,
    generatedBy: user._id,
  });

  url.save();
  user.save();

  res.send(url);
});

router.get("/urls/me", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  console.log(ip);

  const user = await User.findOne({ ip });
  if (!user) return res.send([]);

  const urls = await Url.find({ generatedBy: user._id });

  res.send(urls);
});

router.get("/statistics/:id", async (req, res) => {
  const url = await Url.findOne({ id: req.params.id });
  if (!url) return res.status(404).send("Url Not Found");

  let metadata = await urlMetadata(url.originalUrl);
  metadata = (({ title, image }) => ({ title, image }))(metadata);

  res.send({ metadata, url });
});

router.get("/:id", async (req, res) => {
  const url = await Url.findOne({ id: req.params.id });
  if (!url) return res.send("Url not found");

  const ip = await publicIp.p4();
  let user = await User.findOne({ ip });
  if (!user) {
    user = new User({
      ip,
    });
  }

  let ua = parser(req.headers["user-agent"]);
  ua = (({ os, browser }) => ({ os: os.name, browser: browser.name }))(ua);

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
      os: ua.os,
      browser: ua.browser,
    });
  } else {
    if (!url.uniqueVisitors.find((visitor) => visitor.ip === user.ip)) {
      url.uniqueVisitors.push({
        date,
        ip: user.ip,
        os: ua.os,
        browser: ua.browser,
      });
    }
  }

  user.save();
  url.save();

  res.redirect(url.originalUrl);
});

module.exports = router;
