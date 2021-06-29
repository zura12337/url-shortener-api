const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema } = mongoose;

const userSchema = new Schema({
  ip: String,
  visitedLinks: [{ type: Schema.Types.ObjectId, ref: "Url" }],
});

function validateUser(user) {
  const schema = Joi.object({
    ip: Joi.string(),
    visitedLinks: Joi.array(),
  });
  return schema.validate(user);
}

const User = mongoose.model("User", userSchema);

exports.User = User;
exports.validate = validateUser;
