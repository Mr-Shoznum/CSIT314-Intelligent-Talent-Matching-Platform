# ITMP — Intelligent Talent Matching Platform

A full-stack recruitment web application built for the UOW CSIT314 group project. ITMP connects candidates with employers through AI-powered job matching, resume parsing, and profile management.

---

## Architecture

```
Browser → nginx (port 80) → static front-end files
                          → /api/* → Node.js (port 3000) → MySQL
                                                          → Python resume scanner
```

| Layer | Technology |
|-------|-----------|
| Front-end | Static HTML / CSS / Vanilla JS |
| API server | Node.js + Express |
| Database | MySQL 8 |
| Web server | nginx |
| Resume parser | Python 3 + spaCy + pdfminer |

---

## Quick Setup (Ubuntu 22.04 / 24.04)

### 1. Clone the repository

```bash
git clone <repo-url>
cd CSIT314-Intelligent-Talent-Matching-Platform-main
```

### 2. Run the installer

The installer handles everything in one command — packages, MySQL, Node.js, nginx, Python venv, and directory creation.

```bash
chmod +x setup/install.sh
sudo ./setup/install.sh
```

What `install.sh` does:
- Installs **nginx**, **mysql-server**, **Node.js 20 LTS**, **python3**, **python3-venv**
- Creates the `itmp_db` MySQL database and applies the full schema
- Writes a `.env` file into `back-end/node-server/` with your DB credentials
- Runs `npm install` for the Node server
- Creates a Python virtual environment and installs **spaCy** + **pdfminer**
- Copies and activates the nginx config
- Creates `back-end/node-server/storage/` directories for file uploads

### 3. Start the backend

```bash
./setup/server.sh start
```

Open **http://localhost** in your browser.

---

## Server Management

All backend lifecycle commands are handled by `setup/server.sh`.

```bash
./setup/server.sh start     # Start the Node.js API server (background)
./setup/server.sh stop      # Stop the server
./setup/server.sh restart   # Restart the server
./setup/server.sh status    # Show running state and PID
./setup/server.sh logs      # Tail the live server log
```

The server reads credentials from `back-end/node-server/.env` automatically on start.  
Logs are written to `logs/node.log`.

---

## Environment Variables

The `.env` file is written by `install.sh`. You can edit it manually at any time:

```
back-end/node-server/.env
```

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=itmp_db
PORT=3000
```

To run the server manually without `.env`:

```bash
DB_USER=root DB_PASS=your_password node back-end/node-server/server.js
```

---

## Project Structure

```
.
├── setup/
│   ├── install.sh          ← Full one-command setup script
│   ├── server.sh           ← Start / stop / restart / status / logs
│   └── nginx.conf          ← nginx site config (template, path substituted by install.sh)
│
├── front-end/
│   ├── pages/
│   │   ├── login.html
│   │   └── auth/           ← All authenticated pages (see table below)
│   └── assests/
│       ├── styling/        ← global.css, dashboard.css
│       ├── js/             ← data.js (API client / DataService)
│       └── images/
│
├── back-end/
│   ├── node-server/
│   │   ├── server.js       ← Express API server
│   │   ├── .env            ← DB credentials (created by install.sh)
│   │   ├── storage/        ← Uploaded resumes and avatars
│   │   └── package.json
│   └── scripting/
│       ├── mysql-scripts/
│       │   └── schema.sql  ← Full DB schema
│       ├── python-scripts/
│       │   ├── resume-scanner.py
│       │   └── venv/       ← Python virtualenv (created by install.sh)
│       └── bash-scripts/
│           ├── start-site.sh
│           └── kill-site.sh
│
└── logs/
    ├── node.log            ← Node.js server output
    └── node.pid            ← PID file for server.sh
```

---

## Frontend Pages

All pages live in `front-end/pages/auth/`. Pages are strictly split by role — candidate pages are prefixed `c_`, employer pages `e_`.

### Candidate Pages

| Page | Description |
|------|-------------|
| `c_dashboard.html` | Home dashboard — recommended jobs, application history, saved jobs |
| `c_edit_profile.html` | Edit profile — skills, experience, education, resume |
| `c_search_result.html` | Search jobs and browse employers with filters |
| `c_view_job.html` | Full job detail — skill match, one-click apply, save |
| `c_view_employer.html` | Employer profile — about, open positions |
| `c_applications.html` | All applications with status tracking and filters |
| `c_settings.html` | Account, avatar, resume, membership, privacy, notifications |

### Employer Pages

| Page | Description |
|------|-------------|
| `e_dashboard.html` | Home dashboard — recommended candidates, postings, applicants |
| `e_edit_profile.html` | Edit company profile |
| `e_search_result.html` | Browse and filter candidates |
| `e_view_job.html` | Job listing detail with full applicant list |
| `e_view_profile.html` | Candidate profile — skills match, invite to apply |
| `e_my_jobs.html` | All job postings with applicant counts and management |
| `e_create_job.html` | Post a new job listing |
| `e_settings.html` | Company account, avatar, membership, privacy, notifications |

---

## API Routes

The Node.js server exposes all routes under `/api/`. nginx proxies `/api/*` to `http://localhost:3000`.

Authentication is header-based — pass `X-User-Id: <id>` with every request.

### Auth

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/register` | Create a new account |
| POST | `/api/login` | Log in, returns user object |
| POST | `/api/logout` | Log out |

### Profile

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/profile/me` | Get current user's profile |
| PUT | `/api/profile/me` | Update current user's profile |
| POST | `/api/profile/resume` | Upload resume (multipart) |
| DELETE | `/api/profile/resume` | Remove resume |
| GET | `/api/profile/candidate/:id` | Get a candidate's public profile |
| GET | `/api/profile/employer/:id` | Get an employer's public profile |

### Jobs

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/jobs` | List all active jobs |
| GET | `/api/jobs/:id` | Get a single job |
| POST | `/api/jobs` | Create a job posting (employer only) |
| DELETE | `/api/jobs/:id` | Delete a job posting |
| POST | `/api/jobs/:id/apply` | Apply for a job |
| POST | `/api/jobs/:id/save` | Toggle save/unsave a job |
| GET | `/api/jobs/:id/applicants` | Get applicants for a job (employer/owner only) |

### Discovery

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/candidates` | List all candidate profiles |
| GET | `/api/employers` | List all employer profiles |
| GET | `/api/my/jobs` | Employer's own posted jobs |
| GET | `/api/my/applications` | Candidate's application history |
| GET | `/api/my/saved` | Candidate's saved job IDs |

### Files

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/files/*` | Serve uploaded files (resumes, avatars) |

### Resume Parsing

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/parse-resume` | Parse a PDF resume with the Python scanner |

---

## Database Schema

The MySQL schema is in `back-end/scripting/mysql-scripts/schema.sql` and is applied automatically by `install.sh`.

### Tables

| Table | Description |
|-------|-------------|
| `users` | Core accounts — email, password, account_type (candidate/company) |
| `candidate_profiles` | Skills, experience, education, resume path, availability |
| `company_profiles` | Company name, ABN, description, website, industry |
| `jobs` | Job listings with full detail, skills JSON, status |
| `applications` | Many-to-many: candidates ↔ jobs, with status tracking |
| `saved_jobs` | Many-to-many: users ↔ jobs saved for later |

---

## Resume Scanner

The Python resume scanner is at `back-end/scripting/python-scripts/resume-scanner.py`. It is called automatically by the Node server when a resume is uploaded to `/api/parse-resume`.

To run it manually:

```bash
# Activate the venv first
source back-end/scripting/python-scripts/venv/bin/activate

python3 back-end/scripting/python-scripts/resume-scanner.py path/to/resume.pdf
```

### Output

```json
{
  "name": "John Doe",
  "contact": {
    "email": "john.doe@email.com",
    "phone": "+61 412 345 678",
    "github": "github.com/johndoe",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "skills": ["python", "react", "docker", "aws"],
  "experience": "...",
  "education": "...",
  "certifications": ["aws-certified", "first-aid"],
  "raw_text": "..."
}
```

> **Note:** Name, contact, and skills extraction works well. Experience and education sections produce partial results.

---

## nginx Configuration

The nginx config template is at `setup/nginx.conf`. `install.sh` copies it to `/etc/nginx/sites-available/itmp` with the correct front-end path substituted in.

To manually reload nginx after editing the config:

```bash
sudo nginx -t          # Test config syntax
sudo systemctl reload nginx
```

---

## Troubleshooting

**Server won't start:**
```bash
./setup/server.sh logs    # Check the log output
cat logs/node.log
```

**MySQL connection refused:**
```bash
sudo systemctl status mysql
# Ensure .env credentials match your MySQL root password
cat back-end/node-server/.env
```

**nginx 502 Bad Gateway:**  
The Node server is not running. Start it with `./setup/server.sh start`.

**Port 3000 already in use:**
```bash
./setup/server.sh stop
# Or find and kill the process:
lsof -ti:3000 | xargs kill -9
```

**Reset the database:**
```bash
mysql -u root -p -e "DROP DATABASE itmp_db;"
mysql -u root -p < back-end/scripting/mysql-scripts/schema.sql
```
