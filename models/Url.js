const mongoose = require("mongoose");
const Joi = require("joi");
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

function validateUrl(url) {
  const schema = Joi.object({
    originalUrl: Joi.string().required(),
    id: Joi.string(),
    shortUrl: Joi.string(),
    visitors: Joi.string(),
    uniqueVisitors: Joi.array(),
  });
  return schema.validate(url);
}

exports.Url = Url;
exports.validate = validateUrl;
