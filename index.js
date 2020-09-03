const express = require("express");
const cheerio = require("cheerio");
var fetch = require("node-fetch");
var url = require("url");
const cors = require("cors");
const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/get-preview", router);

router.get("/", async (req, res) => {
  const previewUrl = req.query.url;
  console.log(previewUrl);
  const html = await fetch(previewUrl)
    .then((resp) => resp.text())
    .catch((err) => {
      console.log(err);
    });
  const $ = cheerio.load(html);

  const getMetaTag = (name) => {
    return (
      $(`meta[name=${name}]`).attr("content") ||
      $(`meta[name="og:${name}"]`).attr("content") ||
      $(`meta[name="twitter:${name}"]`).attr("content") ||
      $(`meta[property=${name}]`).attr("content") ||
      $(`meta[property="og:${name}"]`).attr("content") ||
      $(`meta[property="twitter:${name}"]`).attr("content")
    );
  };
  const metaTagData = {
    success: 1,
    meta: {
      title: getMetaTag("title") || $(`h1`).text(),
      description: getMetaTag("description") || $(`p`).text(),
      image: {
        url: getMetaTag("image") || "./images/no-image.png",
      },
      link: previewUrl,
      domain: url.parse(previewUrl).hostname,
    },
  };
  res.send(metaTagData);
});

app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}/get-preview`);
});
