const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/api/stats", async (req, res) => {
  const { tag, name, region } = req.query;
  const url = `https://vaccie.pythonanywhere.com/mmr/${name}/${tag}/${region}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    const $ = cheerio.load(data);
    const bodyText = $("body").text().trim();

    const [rank, p2] = bodyText.split(",");
    let [rr, p3] = p2.split("(");
    rrCount = rr.slice(4, -1);
    gamesPlayed = p3.slice(0, -1);
    res.send(`${rank}` +
  `${rrCount}RR ` +
  `Recent RR: ${gamesPlayed}`);

  } catch (error) {
    console.error(error);
    res.json(url);
 //   res.status(500).json({ error: "Failed to fetch or parse data" });
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
