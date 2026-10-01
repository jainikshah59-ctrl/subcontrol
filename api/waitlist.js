/* SubControl waitlist API — Vercel serverless function.
 * Stores signups in a private GitHub repo (data/waitlist.json) via the
 * Contents API. Deduplicates by email. Never exposes the list publicly.
 *
 * Required env vars:
 *   GITHUB_WAITLIST_TOKEN — fine-grained PAT, contents:write on WAITLIST_REPO only
 *   WAITLIST_REPO         — e.g. "owner/subcontrol-waitlist"
 */
const crypto = require("crypto");

const TOKEN = process.env.GITHUB_WAITLIST_TOKEN;
const REPO = process.env.WAITLIST_REPO || "";
const FILE = "data/waitlist.json";
const API = "https://api.github.com";

// naive in-memory rate limit (per serverless instance, best-effort)
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 20;
}

async function gh(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "subcontrol-waitlist/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) {}
  return { status: res.status, json };
}

async function readList() {
  const { status, json } = await gh(`/repos/${REPO}/contents/${FILE}`);
  if (status === 404) return { list: [], sha: null };
  if (status !== 200 || !json || !json.content) throw new Error("read_failed");
  const list = JSON.parse(Buffer.from(json.content, "base64").toString("utf8"));
  if (!Array.isArray(list)) throw new Error("bad_shape");
  return { list, sha: json.sha };
}

async function writeList(list, sha) {
  const content = Buffer.from(JSON.stringify(list, null, 2)).toString("base64");
  const body = {
    message: `waitlist: add entry (${new Date().toISOString()})`,
    content,
    ...(sha ? { sha } : {}),
  };
  const { status } = await gh(`/repos/${REPO}/contents/${FILE}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (status !== 200 && status !== 201) throw new Error("write_failed");
}

function referralCode(email) {
  return crypto.createHash("sha256").update("subcontrol:" + email).digest("hex").slice(0, 8);
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!TOKEN || !REPO) {
    console.error("waitlist misconfigured: missing env");
    return res.status(500).json({ error: "Waitlist is not configured yet. Please try again later." });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  if (rateLimited(ip)) return res.status(429).json({ error: "Too many requests. Please wait a minute." });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
  const email = String((body && body.email) || "").trim().toLowerCase();
  const source = String((body && body.source) || "landing").slice(0, 40);
  const ref = String((body && body.ref) || "").slice(0, 16);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    const { list, sha } = await readList();
    const existing = list.findIndex((e) => e && e.email === email);
    if (existing !== -1) {
      return res.status(409).json({ ok: false, duplicate: true, position: existing + 1 });
    }
    const entry = {
      email,
      ts: new Date().toISOString(),
      source,
      country: req.headers["x-vercel-ip-country"] || null,
      ref: ref || null,
    };
    list.push(entry);
    try {
      await writeList(list, sha);
    } catch (err) {
      // lost a race with another signup — re-read and retry once
      const fresh = await readList();
      if (fresh.list.some((e) => e && e.email === email)) {
        return res.status(409).json({ ok: false, duplicate: true });
      }
      fresh.list.push(entry);
      await writeList(fresh.list, fresh.sha);
      return res.status(200).json({ ok: true, position: fresh.list.length, referralCode: referralCode(email) });
    }
    return res.status(200).json({ ok: true, position: list.length, referralCode: referralCode(email) });
  } catch (err) {
    console.error("waitlist error:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
