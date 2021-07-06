const { User } = require('../models/User');

async function auth(req, res, next) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  req.user = ip;

  let user = await User.findOne({ ip });
  if (!user) {
    user = new User({
      ip,
    });
    user.save();
  } else {
    next();
  }
}

module.exports = auth;
