const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Url, validate } = require("../models/Url");
const { User, validate: validateUser } = require("../models/User");
const shortid = require("shortid");

router.post("/", async (req, res) => {
  const ip = req.connection.remoteAddress

  let user = await User.findOne({ ip });
  if(!user) {
    user = new User({
      ip,
    })
  }

  let url = await Url.findOne({ originalUrl: req.body.url  });
  if(url) return res.send(url);
  
  const originalUrl = req.body.url;
  
  const id = shortid.generate();
  const shortUrl = `http://localhost:4000/${id}`

  url = new Url({
    originalUrl,
    id,
    shortUrl,
  })

  url.save();

  res.send(url);
})

router.get("/:id", async (req, res) => {
  const url = await Url.findOne({ id: req.params.id  });
  if(!url) return res.send("Url not found");

  url.visitors++;
  if(url.uniqueVisitors.includes)

  res.redirect(url.originalUrl);
})

module.exports = router;
