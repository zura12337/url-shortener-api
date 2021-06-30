const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http").Server(app);
const url = require("./routes/url");
var cors = require("cors");

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

const port = 4000;
const server = http.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
