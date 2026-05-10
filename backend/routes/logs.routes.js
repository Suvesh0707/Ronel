import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, "..", "logs");

function requireToken(req, res, next) {
  const AUTH_TOKEN = process.env.LOGS_TOKEN || "admin";
  const token = req.query.token || req.headers["x-logs-token"];
  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized. Pass ?token=<LOGS_TOKEN>" });
  }
  next();
}

function readLogFile(filename) {
  const filePath = path.join(LOG_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
  return lines.map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

router.get("/entries", requireToken, (req, res) => {
  const { level, userId, route, email, limit = 200, startDate, endDate } = req.query;

  let entries = readLogFile("combined.log");

  if (level)  entries = entries.filter((e) => e.level === level);
  if (userId) entries = entries.filter((e) => e.userId?.toString().includes(userId));
  if (email)  entries = entries.filter((e) => e.email?.toLowerCase().includes(email.toLowerCase()));
  if (route)  entries = entries.filter((e) => e.route?.includes(route));
  
  if (startDate) {
    entries = entries.filter(e => new Date(e.timestamp) >= new Date(startDate));
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    entries = entries.filter(e => new Date(e.timestamp) <= end);
  }

  entries = entries.reverse().slice(0, Number(limit));

  res.json({ total: entries.length, entries });
});

router.get("/simple", requireToken, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "dashboard.html"));
});

router.get("/", requireToken, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "dashboard.html"));
});

export default router;
