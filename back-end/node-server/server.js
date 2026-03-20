/**
 * server.js — TalentMatch Node.js backend
 * ════════════════════════════════════════
 * Serves signup.html and exposes POST /api/parse-resume,
 * which pipes the uploaded PDF to resumeScanner.py and
 * returns the parsed JSON to the frontend for auto-fill.
 *
 * Setup:
 *   npm init -y
 *   npm install express multer
 *
 * Run:
 *   node server.js
 *
 * Then open: http://localhost:3000
 *
 * Requires Python + resumeScanner.py in the same directory.
 * Make sure your venv is active or python3 resolves correctly.
 */

const express  = require("express");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const os       = require("os");
const { spawn } = require("child_process");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Resolve paths ─────────────────────────────────────────────────────
const ROOT          = __dirname;
const SCANNER_PATH  = path.join(ROOT, "resumeScanner.py");

// Python executable — prefers venv if present, falls back to python3
const VENV_PYTHON = path.join(ROOT, "venv", "bin", "python");
const PYTHON_BIN  = fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : "python3";

// ── Static files (serves signup.html from same directory) ─────────────
app.use(express.static(ROOT));
app.use(express.json());

// ── Multer — store upload in OS temp dir ──────────────────────────────
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, os.tmpdir()),
    filename:    (_req,  file, cb) => {
      const unique = `resume_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      cb(null, unique + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },   // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are accepted"), false);
  },
});

// ── POST /api/parse-resume ────────────────────────────────────────────
app.post("/api/parse-resume", upload.single("resume"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded." });
  }

  const tmpPath = req.file.path;
  console.log(`[parse] Running scanner on: ${tmpPath}`);

  let stdout = "";
  let stderr = "";

  const py = spawn(PYTHON_BIN, [SCANNER_PATH, tmpPath]);

  py.stdout.on("data", chunk => { stdout += chunk.toString(); });
  py.stderr.on("data", chunk => { stderr += chunk.toString(); });

  // Timeout: kill the process after 30 s
  const timer = setTimeout(() => {
    py.kill();
    cleanup(tmpPath);
    if (!res.headersSent) {
      res.status(504).json({ error: "Resume scanner timed out after 30 s." });
    }
  }, 30_000);

  py.on("close", code => {
    clearTimeout(timer);
    cleanup(tmpPath);

    if (code !== 0) {
      console.error(`[parse] Scanner exited with code ${code}:\n${stderr}`);
      return res.status(500).json({
        error:  "Resume scanner failed.",
        detail: stderr.trim(),
      });
    }

    try {
      const parsed = JSON.parse(stdout);
      console.log(`[parse] Success — name: ${parsed.name ?? "unknown"}`);
      return res.json(parsed);
    } catch (err) {
      console.error(`[parse] JSON parse error:\n${stdout}`);
      return res.status(500).json({
        error:  "Could not parse scanner output as JSON.",
        detail: err.message,
      });
    }
  });

  py.on("error", err => {
    clearTimeout(timer);
    cleanup(tmpPath);
    console.error(`[parse] Spawn error: ${err.message}`);
    return res.status(500).json({
      error:  `Could not start Python. Is "${PYTHON_BIN}" available?`,
      detail: err.message,
    });
  });
});

// ── Multer error handler ──────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File exceeds 10 MB limit." });
  }
  console.error("[error]", err.message);
  res.status(400).json({ error: err.message });
});

// ── Root fallback → signup.html ───────────────────────────────────────
app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT, "signup.html"));
});

// ── Helpers ───────────────────────────────────────────────────────────
function cleanup(filePath) {
  fs.unlink(filePath, err => {
    if (err && err.code !== "ENOENT") {
      console.warn(`[cleanup] Could not delete temp file: ${filePath}`);
    }
  });
}

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   TalentMatch server running             ║
  ║   http://localhost:${PORT}                  ║
  ║                                          ║
  ║   Python  : ${PYTHON_BIN.padEnd(28)}║
  ║   Scanner : resumeScanner.py             ║
  ╚══════════════════════════════════════════╝
  `);
});
