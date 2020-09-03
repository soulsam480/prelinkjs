const express = require("express");
const cheerio = require("cheerio");
var fetch = require("node-fetch");
var url = require("url");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = express.Router();
app.use("/get-preview", router);
const port = process.env.PORT || 3000;
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
    url: previewUrl,
    domain: url.parse(previewUrl).hostname,
    title: getMetaTag("title") || $(`h1`).text(),
    img: getMetaTag("image") || "./images/no-image.png",
    description: getMetaTag("description") || $(`p`).text(),
  };
  res.send(metaTagData);
});

app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}/get-preview`);
});
