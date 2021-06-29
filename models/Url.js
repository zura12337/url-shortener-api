const mongoose = require('mongoose');
const Joi = require('joi');

const { Schema } = mongoose;


const urlSchema = new Schema({
  originalUrl: String,
  id: { type: String },
  shortUrl: { type: String },
  visitors: { type: Number, default: 0 },
  uniqueVisitors: [{ type: Schema.Types.ObjectId, ref: "User" }],
})

const Url = mongoose.model("Url", urlSchema);

function validateUrl(url) {
  const schema = Joi.object({
    originalUrl: Joi.string().required(),
    id: Joi.string(),
    shortUrl: Joi.string(),
    visitors: Joi.string(),
    uniqueVisitors: Joi.array(),
  })
  return schema.validate(url);
}

exports.Url = Url;
exports.validate = validateUrl;

