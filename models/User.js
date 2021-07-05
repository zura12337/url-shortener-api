const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  ip: String,
  visitedLinks: [{ type: Schema.Types.ObjectId, ref: "Url" }],
});

const User = mongoose.model("User", userSchema);

exports.User = User;
