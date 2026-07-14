"use strict";

const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedRegions = new Set([
  "na",
  "eu",
  "ap",
  "kr",
  "latam",
  "br"
]);

app.disable("x-powered-by");

app.use(express.static("public"));

app.get("/api/stats", async (req, res) => {
  const name = req.query.name?.trim();
  const tag = req.query.tag?.trim();
  const region = req.query.region?.trim().toLowerCase();

  if (!name || !tag || !region) {
    return res.status(400).json({
      error: "Name, tag, and region are required."
    });
  }

  if (name.length > 32 || tag.length > 10) {
    return res.status(400).json({
      error: "The Riot name or tag is too long."
    });
  }

  if (!allowedRegions.has(region)) {
    return res.status(400).json({
      error: "Select a valid region."
    });
  }

  const encodedName = encodeURIComponent(name);
  const encodedTag = encodeURIComponent(tag);

  const statsUrl =
    `https://vaccie.pythonanywhere.com/mmr/` +
    `${encodedName}/${encodedTag}/${region}`;

  try {
    const response = await fetch(statsUrl, {
      timeout: 10000,
      headers: {
        "User-Agent": "oscarto.com RR checker"
      }
    });

    if (!response.ok) {
      return res.status(404).json({
        error: "The rank provider could not find that account."
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const bodyText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    if (!bodyText) {
      return res.status(404).json({
        error: "No rank information was returned."
      });
    }

    const parsedStats = parseStats(bodyText);

    if (!parsedStats) {
      console.error("Unrecognized RR response:", bodyText);

      return res.status(502).json({
        error: "The rank provider returned an unexpected response."
      });
    }

    return res.json(parsedStats);
  } catch (error) {
    console.error("RR lookup failed:", error);

    return res.status(500).json({
      error: "The RR service is currently unavailable."
    });
  }
});

function parseStats(bodyText) {
  const [rankPart, ...remainingParts] = bodyText.split(",");

  if (!rankPart || remainingParts.length === 0) {
    return null;
  }

  const detailsPart = remainingParts.join(",").trim();

  const recentMatch = detailsPart.match(/\(([^)]*)\)/);
  const rrMatch = detailsPart.match(/(?:RR\s*:?\s*)?(-?\d+)/i);

  const rank = rankPart.trim();
  const rr = rrMatch ? rrMatch[1] : null;
  const recentRR = recentMatch
    ? recentMatch[1].trim()
    : "Unavailable";

  if (!rank || rr === null) {
    return null;
  }

  return {
    rank,
    rr,
    recentRR
  };
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});