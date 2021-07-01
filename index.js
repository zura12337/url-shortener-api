const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http").Server(app);
const url = require("./routes/url");
var cors = require("cors");
const dotenv = require("dotenv");

app.use(dotenv());

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use("/", url);

const server = http.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on port ${port}...`);
});
