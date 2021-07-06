const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http").Server(app);
const url = require("./routes/url");
var cors = require("cors");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use("/api", url);

const port = process.env.PORT || 4000;
const server = http.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
