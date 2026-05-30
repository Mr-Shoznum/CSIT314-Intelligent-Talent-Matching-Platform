/**
 * server.js — ITMP API Server
 * Exposes REST API on port 3000; nginx proxies /api/ here.
 *
 * Setup:
 *   npm install
 *   node server.js
 *
 * Environment variables (all optional, fall back to defaults):
 *   DB_HOST, DB_USER, DB_PASS, DB_NAME, PORT
 */

const express        = require('express');
const mysql          = require('mysql2/promise');
const multer         = require('multer');
const path           = require('path');
const fs             = require('fs');
const os             = require('os');
const { spawn }      = require('child_process');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MySQL pool ────────────────────────────────────────────────────────
const db = mysql.createPool({
    host:             process.env.DB_HOST || 'localhost',
    user:             process.env.DB_USER || 'root',
    password:         process.env.DB_PASS || '',
    database:         process.env.DB_NAME || 'itmp_db',
    waitForConnections: true,
    connectionLimit:  10,
});

app.use(express.json());

// Allow requests from the nginx-served frontend (same origin in prod, but
// also handy when running Node directly during dev).
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-User-Id');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// ── Helpers ───────────────────────────────────────────────────────────
function uid(req) {
    const id = parseInt(req.headers['x-user-id']);
    return isNaN(id) ? null : id;
}

function initials(name) {
    if (!name) return '?';
    return name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
}

function toDateStr(val) {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    return String(val).split('T')[0];
}

function parseJ(str) {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    try { return JSON.parse(str); } catch { return []; }
}

function salaryDisplay(min, max) {
    const fmt = n => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
    if (!min && !max) return 'Negotiable';
    if (!max)         return `${fmt(min)}+`;
    if (!min)         return `Up to ${fmt(max)}`;
    return `${fmt(min)} - ${fmt(max)}`;
}

async function formatJob(row) {
    const [[{ cnt }]] = await db.query(
        'SELECT COUNT(*) cnt FROM applications WHERE job_id = ?', [row.id]
    );
    return {
        id:               row.id,
        employer_id:      row.employer_id,
        title:            row.title        || '',
        company:          row.company_name || '',
        company_initials: initials(row.company_name),
        company_about:    row.company_desc || '',
        company_size:     '',
        industry:         row.industry     || '',
        location:         row.location     || '',
        work_mode:        row.work_mode    || '',
        salary_min:       row.salary_min   || 0,
        salary_max:       row.salary_max   || 0,
        salary_display:   salaryDisplay(row.salary_min, row.salary_max),
        job_type:         row.job_type     || 'Full-time',
        description:      row.description  || '',
        full_description: row.full_description || '',
        responsibilities: parseJ(row.responsibilities),
        requirements:     parseJ(row.requirements),
        nice_to_have:     parseJ(row.nice_to_have),
        benefits:         parseJ(row.benefits),
        skills:           parseJ(row.skills),
        status:           row.status       || 'active',
        posted_date:      toDateStr(row.created_at),
        expires_date:     toDateStr(row.expires_date),
        applications_count: Number(cnt),
        match_score:      0,   // computed client-side
    };
}

const AVATAR_COLORS = ['#1a56db','#0e9f6e','#7e3af2','#e3a008','#c81e1e','#0891b2','#7c3aed','#db2777'];
function avatarColor(id) { return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length]; }

function formatCandidate(row) {
    const firstName = row.first_name || '';
    const lastName  = row.last_name  || '';
    const fullName  = `${firstName} ${lastName}`.trim() || row.email || '';
    return {
        id:                   row.id,
        account_type:         'candidate',
        email:                row.email || '',
        phone:                row.phone || '',
        first_name:           firstName,
        last_name:            lastName,
        full_name:            fullName,
        avatar_initials:      initials(fullName),
        avatar_color:         avatarColor(row.id),
        headline:             row.headline             || '',
        bio:                  row.bio                  || '',
        location:             row.location             || '',
        work_mode_preference: row.work_mode_preference || '',
        skills:               parseJ(row.skills),
        experience:           parseJ(row.experience),
        education:            parseJ(row.education),
        resume_path:          row.resume_path          || null,
        availability:         row.availability         || '',
        yoe:                  row.yoe                  || 0,
        open_to_work:         !!row.open_to_work,
        is_candidate:         true,
        is_premium:           false,
        joined_date:          toDateStr(row.created_at),
    };
}

function formatEmployer(row) {
    const name = row.company_name || '';
    return {
        id:              row.id,
        account_type:    'company',
        email:           row.email       || '',
        phone:           row.phone       || '',
        company_name:    name,
        avatar_initials: initials(name),
        avatar_color:    avatarColor(row.id),
        abn:             row.abn         || '',
        description:     row.description || '',
        website:         row.website     || '',
        industry:        row.industry    || '',
        location:        row.location    || '',
        is_premium:      false,
        is_verified:     true,
        target_skills:   [],
    };
}

// ── Auth ──────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    try {
        const [[user]] = await db.query(
            'SELECT * FROM users WHERE email = ? AND password = ?', [email, password]
        );
        if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

        if (user.account_type === 'candidate') {
            const [[cp]] = await db.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [user.id]);
            return res.json(formatCandidate({ ...user, ...(cp || {}) }));
        } else {
            const [[ep]] = await db.query('SELECT * FROM company_profiles WHERE user_id = ?', [user.id]);
            return res.json(formatEmployer({ ...user, ...(ep || {}) }));
        }
    } catch (e) {
        console.error('[login]', e.message);
        res.status(500).json({ error: 'Login failed.' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { email, password, phone, account_type } = req.body || {};
    if (!email || !password || !account_type) {
        return res.status(400).json({ error: 'Email, password, and account type required.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [ins] = await conn.query(
            'INSERT INTO users (account_type, email, password, phone) VALUES (?, ?, ?, ?)',
            [account_type, email, password, phone || null]
        );
        const newId = ins.insertId;

        if (account_type === 'candidate') {
            const { first_name = '', last_name = '', yoe = 0, skills = '' } = req.body;
            const skillArr = typeof skills === 'string'
                ? skills.split(',').map(s => s.trim()).filter(Boolean)
                : (Array.isArray(skills) ? skills : []);
            await conn.query(
                `INSERT INTO candidate_profiles (user_id, first_name, last_name, yoe, skills)
                 VALUES (?, ?, ?, ?, ?)`,
                [newId, first_name, last_name, parseInt(yoe) || 0, JSON.stringify(skillArr)]
            );
            const [[u]]  = await conn.query('SELECT * FROM users WHERE id = ?', [newId]);
            const [[cp]] = await conn.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [newId]);
            await conn.commit();
            return res.status(201).json(formatCandidate({ ...u, ...(cp || {}) }));
        } else {
            const { company_name = '', abn = '', company_industry = '', company_website = '' } = req.body;
            await conn.query(
                `INSERT INTO company_profiles (user_id, company_name, abn, industry, website)
                 VALUES (?, ?, ?, ?, ?)`,
                [newId, company_name, abn, company_industry, company_website]
            );
            const [[u]]  = await conn.query('SELECT * FROM users WHERE id = ?', [newId]);
            const [[ep]] = await conn.query('SELECT * FROM company_profiles WHERE user_id = ?', [newId]);
            await conn.commit();
            return res.status(201).json(formatEmployer({ ...u, ...(ep || {}) }));
        }
    } catch (e) {
        await conn.rollback();
        console.error('[register]', e.message);
        if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered.' });
        res.status(500).json({ error: 'Registration failed.' });
    } finally {
        conn.release();
    }
});

// ── Profile ───────────────────────────────────────────────────────────

app.get('/api/profile/me', async (req, res) => {
    const id = uid(req);
    if (!id) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (user.account_type === 'candidate') {
            const [[cp]] = await db.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [id]);
            return res.json(formatCandidate({ ...user, ...(cp || {}) }));
        } else {
            const [[ep]] = await db.query('SELECT * FROM company_profiles WHERE user_id = ?', [id]);
            return res.json(formatEmployer({ ...user, ...(ep || {}) }));
        }
    } catch (e) {
        console.error('[profile/me GET]', e.message);
        res.status(500).json({ error: 'Failed to load profile.' });
    }
});

app.put('/api/profile/me', async (req, res) => {
    const id = uid(req);
    if (!id) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const b = req.body || {};
        if (b.phone !== undefined) {
            await db.query('UPDATE users SET phone = ? WHERE id = ?', [b.phone, id]);
        }

        if (user.account_type === 'candidate') {
            const allowed = ['first_name','last_name','headline','bio','location',
                             'work_mode_preference','availability','yoe','open_to_work'];
            const sets = []; const vals = [];
            allowed.forEach(k => {
                if (b[k] !== undefined) { sets.push(`${k} = ?`); vals.push(b[k]); }
            });
            if (b.skills !== undefined) {
                sets.push('skills = ?');
                vals.push(JSON.stringify(Array.isArray(b.skills) ? b.skills : []));
            }
            if (b.experience !== undefined) { sets.push('experience = ?'); vals.push(JSON.stringify(b.experience)); }
            if (b.education  !== undefined) { sets.push('education = ?');  vals.push(JSON.stringify(b.education));  }
            if (sets.length) {
                await db.query(`UPDATE candidate_profiles SET ${sets.join(', ')} WHERE user_id = ?`, [...vals, id]);
            }
            const [[u]]  = await db.query('SELECT * FROM users WHERE id = ?', [id]);
            const [[cp]] = await db.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [id]);
            return res.json(formatCandidate({ ...u, ...(cp || {}) }));
        } else {
            const allowed = ['company_name','abn','description','website','industry','location'];
            const sets = []; const vals = [];
            allowed.forEach(k => {
                if (b[k] !== undefined) { sets.push(`${k} = ?`); vals.push(b[k]); }
            });
            if (sets.length) {
                await db.query(`UPDATE company_profiles SET ${sets.join(', ')} WHERE user_id = ?`, [...vals, id]);
            }
            const [[u]]  = await db.query('SELECT * FROM users WHERE id = ?', [id]);
            const [[ep]] = await db.query('SELECT * FROM company_profiles WHERE user_id = ?', [id]);
            return res.json(formatEmployer({ ...u, ...(ep || {}) }));
        }
    } catch (e) {
        console.error('[profile/me PUT]', e.message);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
});

app.get('/api/profile/candidate/:id', async (req, res) => {
    try {
        const [[user]] = await db.query(
            "SELECT * FROM users WHERE id = ? AND account_type = 'candidate'", [req.params.id]
        );
        if (!user) return res.status(404).json({ error: 'Candidate not found.' });
        const [[cp]] = await db.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [user.id]);
        return res.json(formatCandidate({ ...user, ...(cp || {}) }));
    } catch (e) {
        console.error('[profile/candidate]', e.message);
        res.status(500).json({ error: 'Failed to load profile.' });
    }
});

// ── Jobs ──────────────────────────────────────────────────────────────

app.get('/api/jobs', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT j.*, cp.company_name, cp.description AS company_desc, cp.industry
            FROM jobs j
            LEFT JOIN company_profiles cp ON j.employer_id = cp.user_id
            WHERE j.status = 'active'
            ORDER BY j.created_at DESC
        `);
        const jobs = await Promise.all(rows.map(formatJob));
        res.json(jobs);
    } catch (e) {
        console.error('[jobs GET]', e.message);
        res.status(500).json({ error: 'Failed to load jobs.' });
    }
});

app.get('/api/jobs/:id', async (req, res) => {
    try {
        const [[row]] = await db.query(`
            SELECT j.*, cp.company_name, cp.description AS company_desc, cp.industry
            FROM jobs j
            LEFT JOIN company_profiles cp ON j.employer_id = cp.user_id
            WHERE j.id = ?
        `, [req.params.id]);
        if (!row) return res.status(404).json({ error: 'Job not found.' });
        res.json(await formatJob(row));
    } catch (e) {
        console.error('[jobs/:id GET]', e.message);
        res.status(500).json({ error: 'Failed to load job.' });
    }
});

app.post('/api/jobs', async (req, res) => {
    const id = uid(req);
    if (!id) return res.status(401).json({ error: 'Not authenticated.' });
    const b = req.body || {};
    try {
        const [ins] = await db.query(`
            INSERT INTO jobs (employer_id, title, description, full_description, location,
                work_mode, salary_min, salary_max, job_type, industry, skills,
                responsibilities, requirements, nice_to_have, benefits, status, expires_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            b.title || '',
            b.description      || '',
            b.full_description || '',
            b.location || '',
            b.work_mode || '',
            parseInt(b.salary_min) || 0,
            parseInt(b.salary_max) || 0,
            b.job_type || 'Full-time',
            b.industry || '',
            JSON.stringify(Array.isArray(b.skills)           ? b.skills           : []),
            JSON.stringify(Array.isArray(b.responsibilities) ? b.responsibilities : []),
            JSON.stringify(Array.isArray(b.requirements)     ? b.requirements     : []),
            JSON.stringify(Array.isArray(b.nice_to_have)     ? b.nice_to_have     : []),
            JSON.stringify(Array.isArray(b.benefits)         ? b.benefits         : []),
            b.status || 'active',
            b.expires_date || null,
        ]);
        const [[row]] = await db.query(`
            SELECT j.*, cp.company_name, cp.description AS company_desc, cp.industry
            FROM jobs j LEFT JOIN company_profiles cp ON j.employer_id = cp.user_id
            WHERE j.id = ?
        `, [ins.insertId]);
        res.status(201).json(await formatJob(row));
    } catch (e) {
        console.error('[jobs POST]', e.message);
        res.status(500).json({ error: 'Failed to create job.' });
    }
});

app.delete('/api/jobs/:id', async (req, res) => {
    const id = uid(req);
    if (!id) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const [[job]] = await db.query(
            'SELECT id FROM jobs WHERE id = ? AND employer_id = ?', [req.params.id, id]
        );
        if (!job) return res.status(404).json({ error: 'Job not found.' });
        await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) {
        console.error('[jobs/:id DELETE]', e.message);
        res.status(500).json({ error: 'Failed to delete job.' });
    }
});

app.post('/api/jobs/:id/apply', async (req, res) => {
    const id = uid(req);
    if (!id) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        await db.query(
            'INSERT IGNORE INTO applications (job_id, candidate_id) VALUES (?, ?)',
            [req.params.id, id]
        );
        await db.query(
            'DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?', [id, req.params.id]
        );
        res.json({ success: true });
    } catch (e) {
        console.error('[jobs/:id/apply]', e.message);
        res.status(500).json({ error: 'Failed to apply.' });
    }
});

app.post('/api/jobs/:id/save', async (req, res) => {
    const id = uid(req);
    if (!id) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const [[existing]] = await db.query(
            'SELECT 1 FROM saved_jobs WHERE user_id = ? AND job_id = ?', [id, req.params.id]
        );
        if (existing) {
            await db.query('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?', [id, req.params.id]);
            return res.json({ saved: false });
        }
        await db.query('INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)', [id, req.params.id]);
        res.json({ saved: true });
    } catch (e) {
        console.error('[jobs/:id/save]', e.message);
        res.status(500).json({ error: 'Failed to save job.' });
    }
});

// ── My data ───────────────────────────────────────────────────────────

app.get('/api/my/applications', async (req, res) => {
    const id = uid(req);
    if (!id) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const [rows] = await db.query(
            'SELECT job_id, status, applied_at FROM applications WHERE candidate_id = ?', [id]
        );
        res.json(rows);
    } catch (e) {
        console.error('[my/applications]', e.message);
        res.status(500).json({ error: 'Failed to load applications.' });
    }
});

app.get('/api/my/saved', async (req, res) => {
    const id = uid(req);
    if (!id) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const [rows] = await db.query(
            'SELECT job_id FROM saved_jobs WHERE user_id = ?', [id]
        );
        res.json(rows.map(r => r.job_id));
    } catch (e) {
        console.error('[my/saved]', e.message);
        res.status(500).json({ error: 'Failed to load saved jobs.' });
    }
});

app.get('/api/my/jobs', async (req, res) => {
    const id = uid(req);
    if (!id) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const [rows] = await db.query(`
            SELECT j.*, cp.company_name, cp.description AS company_desc, cp.industry
            FROM jobs j
            LEFT JOIN company_profiles cp ON j.employer_id = cp.user_id
            WHERE j.employer_id = ?
            ORDER BY j.created_at DESC
        `, [id]);
        const jobs = await Promise.all(rows.map(formatJob));
        res.json(jobs);
    } catch (e) {
        console.error('[my/jobs]', e.message);
        res.status(500).json({ error: 'Failed to load posted jobs.' });
    }
});

// ── Candidates (for employer search / browse) ─────────────────────────

app.get('/api/candidates', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.email, u.phone, u.created_at,
                   cp.first_name, cp.last_name, cp.headline, cp.bio, cp.location,
                   cp.work_mode_preference, cp.skills, cp.experience, cp.education,
                   cp.resume_path, cp.availability, cp.yoe, cp.open_to_work
            FROM users u
            JOIN candidate_profiles cp ON u.id = cp.user_id
            WHERE u.account_type = 'candidate'
            ORDER BY u.created_at DESC
        `);
        res.json(rows.map(formatCandidate));
    } catch (e) {
        console.error('[candidates]', e.message);
        res.status(500).json({ error: 'Failed to load candidates.' });
    }
});

// ── Resume parsing ────────────────────────────────────────────────────

const SCANNER_DIR  = path.join(__dirname, '..', 'scripting', 'python-scripts');
const SCANNER_PATH = path.join(SCANNER_DIR, 'resume-scanner.py');
const VENV_PYTHON  = path.join(SCANNER_DIR, 'venv', 'bin', 'python');
const PYTHON_BIN   = fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : 'python3';

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, os.tmpdir()),
        filename:    (_req, file,  cb) => {
            cb(null, `resume_${Date.now()}_${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`);
        },
    }),
    limits:     { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are accepted'), false);
    },
});

app.post('/api/parse-resume', upload.single('resume'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded.' });

    const tmpPath = req.file.path;
    let stdout = '', stderr = '';
    const py = spawn(PYTHON_BIN, [SCANNER_PATH, tmpPath]);

    py.stdout.on('data', c => { stdout += c.toString(); });
    py.stderr.on('data', c => { stderr += c.toString(); });

    const timer = setTimeout(() => {
        py.kill();
        fs.unlink(tmpPath, () => {});
        if (!res.headersSent) res.status(504).json({ error: 'Resume scanner timed out.' });
    }, 30_000);

    py.on('close', code => {
        clearTimeout(timer);
        fs.unlink(tmpPath, () => {});
        if (code !== 0) {
            console.error('[parse-resume] scanner exited', code, stderr);
            return res.status(500).json({ error: 'Resume scanner failed.', detail: stderr.trim() });
        }
        try {
            res.json(JSON.parse(stdout));
        } catch {
            res.status(500).json({ error: 'Could not parse scanner output.' });
        }
    });

    py.on('error', err => {
        clearTimeout(timer);
        fs.unlink(tmpPath, () => {});
        console.error('[parse-resume] spawn error:', err.message);
        res.status(500).json({ error: `Cannot start Python: ${PYTHON_BIN}` });
    });
});

// ── Multer error handler ──────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File exceeds 10 MB limit.' });
    console.error('[error]', err.message);
    res.status(400).json({ error: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`ITMP API server running on http://localhost:${PORT}`);
    console.log(`Python: ${PYTHON_BIN}`);
});
