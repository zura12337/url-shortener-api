const mongoose = require("mongoose");
const dateFormat = require("dateformat");

const { Schema } = mongoose;

const urlSchema = new Schema({
  originalUrl: String,
  id: { type: String },
  shortUrl: { type: String },
  visitors: [
    {
      date: String,
      ip: String,
      os: String,
      browser: String,
      location: String,
    },
  ],
  uniqueVisitors: [
    {
      date: String,
      ip: String,
    },
  ],
  generatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  date: { type: String, default: dateFormat(new Date(), "yyyy-mm-dd") },
});

const Url = mongoose.model("Url", urlSchema);

exports.Url = Url;
