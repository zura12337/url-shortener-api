const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http").Server(app);
const url = require("./routes/url");
var cors = require("cors");
const dotenv = requir("dotenv");

app.use(dotenv());

mongoose.connect("mongodb://127.0.0.1", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  auth: {
    user: "admin",
    password: "admin",
  },
  dbName: "url-shortener",
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use("/", url);

const server = http.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on port ${port}...`);
});
