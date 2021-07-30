require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const url = require("url");
const validUrl = require("valid-url");
const mongoose = require("mongoose");
const autoInc = require("./autoIncease");
const { Schema } = mongoose;

//connect mongodb
const URL = process.env.MONGO_URI;
mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("connect mongo"));

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

const ShortUrl = mongoose.model(
  "ShortUrl",
  new Schema({
    original_url: {
      type: String,
      required: true,
    },
    short_url: {
      type: Number,
      required: true,
    },
  })
);

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", (req, res) => {
  if (!validUrl.isWebUri(req.body.url)) {
    return res.json({ error: "Invalid URL" });
  }

  dns.lookup(url.parse(req.body.url).hostname, (err, address, family) => {
    if (err) {
      return res.json({ error: "Invalid Hostname" });
    }

    ShortUrl.findOne({ original_url: req.body.url }).then((doc) => {
      if (doc) {
        res.json({
          original_url: doc.original_url,
          short_url: doc.short_url,
        });
      } else {
        autoInc("gohar").then((doc) => {
          ShortUrl.findOneAndUpdate(
            { original_url: req.body.url },
            {
              $set: {
                short_url: doc.increament,
              },
            },
            { upsert: true, new: true }
          ).then((doc) =>
            res.json({
              original_url: doc.original_url,
              short_url: doc.short_url,
            })
          );
        });
      }
    });
  });
});

app.get("/api/shorturl/:short_url", function (req, res) {
  if (/(?=.*\W)|(?=.*\D)/.test(req.params.short_url)) {
    return res.json({ error: "Wrong format" });
  }
  ShortUrl.findOne({ short_url: req.params.short_url })
    .then((doc) => {
      res.redirect(doc.original_url);
    })
    .catch((e) => {
      res.json({ error: "No short URL found for the given input" });
    });
});

app.use((req, res) => {
  res.status(404).type("text").send("Not found");
});
// Basic Configuration
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
