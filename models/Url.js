const mongoose = require('mongoose');
const Joi = require('joi');

const { Schema } = mongoose;


const urlSchema = new Schema({
  originalUrl: String,
  shortenedUrl: { type: String, unique: true },
  visitors: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
})

const Url = mongoose.model("Url", urlSchema);

function validateUrl(url) {
  const schema = Joi.object({
    originalUrl: Joi.string().required(),
    shortenedUrl: Joi.string(),
    visitors: Joi.string(),
    uniqueVisitors: Joi.string(),
  })
  return schema.validate(url);
}

exports.Url = Url;
exports.validate = validateUrl;

