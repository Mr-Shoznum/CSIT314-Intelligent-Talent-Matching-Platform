# CSIT314 Intelligent Talent Matching Platform

Software repository for the UOW CSIT314 group project. This web application is a
recruitment system designed to improve the efficiency of job searching and talent acquisition.

---

## Frontend Pages

All frontend pages are static HTML/CSS/JS files located in the `sandbox/dashsystem/files/` directory.
They require no server to run — open directly in a browser via `file://`.

### Page Overview

| File | Description |
|------|-------------|
| `c_dashboard.html` | Candidate dashboard — recommended jobs, applied history, saved jobs |
| `profile.html` | Candidate profile page with resume display and edit modal |
| `settings.html` | Full settings page — avatar, resume, membership, billing, privacy |
| `search_result.html` | Dual-mode search — find jobs or find candidates with filters |
| `job.html` | Job detail page — full listing, skill match, apply/save actions |
| `data.js` | Shared data service — embedded JSON, localStorage persistence |
| `jobs.json` | Reference job listings (also embedded in `data.js`) |
| `accounts.json` | Reference user accounts (also embedded in `data.js`) |
| `global.css` | Shared base styles and CSS variables |
| `dashboard.css` | Dashboard and card component styles |

---

## What Was Added

### `data.js` — Shared Data Service

A single JavaScript module that replaces all `fetch()` / JSON file calls.
All data is **embedded inline as JavaScript objects**, so every page works
on `file://` without a local server (no CORS errors).

**Key API methods:**

| Method | Description |
|--------|-------------|
| `DataService.init()` | Deep-clones embedded data, merges `localStorage` overrides |
| `DataService.onReady(cb)` | Queue or immediate callback once data is ready |
| `DataService.getCurrentUser()` | Returns the active session user object |
| `DataService.getRecommendedJobs()` | Jobs not yet applied to, sorted by match score |
| `DataService.getAppliedJobs()` | Jobs the current user has applied to |
| `DataService.getSavedJobs()` | Jobs the current user has saved (excluding applied) |
| `DataService.searchJobs(filters)` | Filter jobs by query, work mode, job type, salary, industry, location, match % |
| `DataService.searchCandidates(filters)` | Filter candidates by query, work mode, YOE, location, availability, skills |
| `DataService.applyForJob(id)` | Apply and persist to `localStorage` |
| `DataService.toggleSaveJob(id)` | Save/unsave and persist to `localStorage` |
| `DataService.updateProfile(fields)` | Merge profile fields and persist to `localStorage` |
| `DataService.updateAvatar(color)` | Update avatar hex colour and persist |
| `DataService.updateResume(filename, date)` | Store resume filename and upload date |
| `DataService.deleteResume()` | Clear stored resume |
| `DataService.getSkillsWithMatchStatus(job)` | Returns job skills with `isMatch` flag vs current user |
| `DataService.timeAgo(isoDate)` | Human-readable relative date string |

**Embedded data:**
- 5 job listings (`job_001` to `job_005`) — each with `responsibilities`, `requirements`, `nice_to_have`, `benefits`, and per-skill `required` flag
- 8 user accounts — user ID 1 is the logged-in demo user (Jane Doe); IDs 3–8 are searchable candidates with varied skills, locations, and availability statuses

---

### `c_dashboard.html` — Candidate Dashboard (Updated)

- Profile card header is now a clickable `<a href="profile.html">` link — clicking the avatar or name navigates to the profile page
- Job card titles are `<a href="job.html?id=...">` links to the job detail page
- Added **Saved Jobs** section below Application History
- All job and user data sourced from `DataService` instead of hardcoded objects
- Header search bar submits to `search_result.html?q=...`
- `handleApply()`, `handleSave()`, `handleUnsave()` call `DataService` mutations then re-render without a page reload

---

### `profile.html` — Candidate Profile Page (Updated)

- Avatar reads `avatar_color` from `DataService`, reflecting any changes made in Settings
- **⚙️ Settings** button in hero links to `settings.html`
- **📄 Update Resume** button in hero links to `settings.html#resume`
- **Resume section** — shows filename and upload date if present, or prompts the user to upload via Settings
- **Saved Jobs section** — lists all saved jobs with company badge, title, location, salary
- **Edit Profile modal** — inline edit for name, headline, bio, location, work mode, YOE, availability, and skills; writes back via `DataService.updateProfile()`
- Section-level edit shortcuts route to the correct Settings panel or open the modal directly

---

### `job.html` — Job Detail Page (New)

Reads `?id=` from the URL and renders the full job listing.

**Left column sections:**
- Hero card — company logo, title, company name, meta badges (location, work mode, job type, industry, posted date, applicant count), match score
- About the Role (`full_description`)
- Key Responsibilities (bulleted)
- Requirements + Nice to Have (bulleted)
- Skills Match — colour-coded chips:
  - Green ✔ = user has the skill
  - Red ✕ = required and user is missing it
  - Grey ○ = optional, user doesn't have it
- Benefits & Perks (bulleted)

**Right sidebar:**
- Salary range, One-Click Apply / Applied state, Save/Saved toggle
- Job meta table (type, work mode, location, applicants, expiry)
- Company about card (description, industry, size)

---

### `search_result.html` — Search Page (New)

Dual-mode page toggled by a pill selector in the hero bar.
Accepts `?q=` and `?mode=candidates` URL parameters.

#### Job Search Mode

Filters (all live — update on every keystroke or checkbox change):

| Filter | Input Type |
|--------|-----------|
| Location | Free-text |
| Work Mode | Checkboxes (Remote / Hybrid / On-site) |
| Salary Range | Min/Max number inputs |
| Job Type | Checkboxes (Full-time / Part-time / Contract) |
| Industry | Dropdown |
| Minimum Match Score | Dropdown (Any / 50%+ / 70%+ / 80%+ / 90%+) |

Sort options: Best Match, Salary High→Low, Salary Low→High, Newest First, Fewest Applicants.

Result cards show: company badge, job title (links to `job.html`), meta tags, skill chips with match highlighting, inline apply and save buttons.

#### Candidate Search Mode

Filters:

| Filter | Input Type |
|--------|-----------|
| Location | Free-text |
| Work Mode | Checkboxes |
| Years of Experience | Min/Max number inputs |
| Availability | Dropdown (Immediate / 2 weeks / 1 month) |
| Skills | Comma-separated text (all listed skills must match) |
| Open to Work Only | Toggle switch |

Candidate cards show: coloured avatar, name, headline, location/work mode/YOE meta tags, availability badge, top 6 skills, "Invite to Apply" and "Save Candidate" buttons, and profile view count.

---

### `settings.html` — Settings Page (New)

Left-nav sidebar with 8 named sections. Navigating via the sidebar or URL hash (e.g. `settings.html#resume`) jumps directly to that section. All changes show a toast notification on save.

#### Account
- Edit name, headline, bio, location, work mode, availability, YOE, skills list
- Separate contact & links form — email, phone, LinkedIn, GitHub, personal website
- Change password form — validates match and minimum length (8 chars)
- Writes via `DataService.updateProfile()` and persists to `localStorage`

#### Profile Picture
- 16-colour swatch grid with live avatar preview
- Saved via `DataService.updateAvatar()` and reflected on all pages immediately

#### Resume
- Drag-and-drop upload zone (PDF/DOCX, max 5 MB)
- Displays current resume filename and upload date
- Remove button calls `DataService.deleteResume()`
- Note: filename is stored in `localStorage` for the demo; no file is actually transmitted

#### Membership
- Premium plan banner with feature checklist (unlimited applications, priority matching, analytics, resume boost)
- **Cancel Membership** triggers a confirmation modal and downgrades the plan in-memory
- Free plan users see an Upgrade CTA instead

#### Billing
- Payment card display (Visa ending 4242)
- Update card form — card number, expiry, CVC, cardholder name
- Billing history table — 4 past invoices with Paid status badges

#### Notifications
Five email preference toggles:
- New Job Matches
- Application Updates
- Profile Views
- Product Updates & Tips
- Marketing Emails

#### Privacy
Five visibility/consent toggles:
- Profile Visible to Employers
- Open to Work Badge
- Show Contact Details to Employers
- Allow Profile Analytics
- Hide Profile from Current Employer

#### Danger Zone
All destructive actions require a confirmation modal.

| Action | Behaviour |
|--------|-----------|
| Pause Account | Shows toast; in a real app would hide profile from search |
| Download My Data | Exports current user object as a real downloadable `itmp_my_data.json` |
| Delete All Applications | Clears `applied_jobs` and `saved_jobs` via `DataService` |
| Delete Account | Clears data, redirects to `login.html` after 1.8 s |

---

### `jobs.json` — Job Listing Schema

Each job object contains:

```json
{
  "id": "job_001",
  "title": "",
  "company": "",
  "company_initials": "",
  "company_about": "",
  "company_size": "",
  "industry": "",
  "match_score": 0,
  "location": "",
  "work_mode": "",
  "salary_min": 0,
  "salary_max": 0,
  "salary_display": "",
  "job_type": "",
  "posted_date": "YYYY-MM-DD",
  "expires_date": "YYYY-MM-DD",
  "applications_count": 0,
  "description": "",
  "full_description": "",
  "responsibilities": [],
  "requirements": [],
  "nice_to_have": [],
  "benefits": [],
  "skills": [
    { "name": "", "required": true }
  ]
}
```

---

### `accounts.json` — User Account Schema (Updated)

Extended from the original schema. New and changed fields vs the original:

| Field | Type | Description |
|-------|------|-------------|
| `avatar_initials` | string | 2-letter initials derived from full name |
| `avatar_color` | string | Hex colour for avatar background |
| `headline` | string | Short professional title shown on cards |
| `bio` | string | About/summary paragraph |
| `contact.linkedin` | string | LinkedIn profile URL |
| `contact.github` | string | GitHub profile URL |
| `contact.website` | string | Personal website URL |
| `location` | string | City, State display string |
| `work_mode_preference` | string | Remote / Hybrid / On-site |
| `education` | array | Array of education objects (institution, degree, major, years, GPA) |
| `experience` | array | Array of work history objects (title, company, dates, description) |
| `is_premium` | boolean | Premium membership status |
| `applied_jobs` | string[] | Array of applied job IDs |
| `saved_jobs` | string[] | Array of saved job IDs |
| `profile_views` | number | Employer profile view count |
| `resume_filename` | string | Uploaded resume filename |
| `resume_upload_date` | string | ISO date of last resume upload |
| `availability` | string | Immediate / 2 weeks / 1 month |
| `open_to_work` | boolean | Shown as green badge on profile and search results |
| `joined_date` | string | ISO date account was created |

Full schema:

```json
{
  "id": 1,
  "password": "",
  "full_name": "",
  "avatar_initials": "",
  "avatar_color": "#1a56db",
  "dob": "",
  "headline": "",
  "bio": "",
  "contact": {
    "phone": "",
    "email": "",
    "linkedin": "",
    "github": "",
    "website": ""
  },
  "location": "",
  "work_mode_preference": "",
  "education": [
    {
      "institution": "",
      "degree": "",
      "major": "",
      "start_year": 0,
      "end_year": 0,
      "gpa": ""
    }
  ],
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM",
      "current": false,
      "description": ""
    }
  ],
  "skills": [],
  "yoe": 0,
  "is_candidate": true,
  "is_premium": false,
  "applied_jobs": [],
  "saved_jobs": [],
  "profile_views": 0,
  "resume_filename": "",
  "resume_upload_date": "",
  "availability": "",
  "open_to_work": true,
  "joined_date": ""
}
```

---

## Resume Scanner/Parser

The project has been restructured for a webserver to run the latest
version of [ubuntu server](https://ubuntu.com/download/server) and [apache2](https://www.apache.org/licenses/LICENSE-2.0)

The resume scanner application has been moved to the directory [resume-scanner.py](https://github.com/Mr-Horrigan/CSIT314-Intelligent-Talent-Matching-Platform/tree/main/back-end/scripting/python-scripts/resume-scanner.py)

Currently, the experience and education sections are not producing great results in the
JSON output. However, name, contact info, and skills are working well, and certifications
are partially working.

The following steps will provide the information necessary to get the
[resume-scanner.py](https://github.com/Mr-Horrigan/CSIT314-Intelligent-Talent-Matching-Platform/tree/main/back-end/scripting/python-scritps) running.

### Step 1

Use `pip` or `pipx` to install the following libraries:

```
sudo pip install spacy
sudo pip install pdfminer
```

or

```
sudo pipx install spacy
sudo pipx install pdfminer
```

### Step 2

To run the resume parser script, use the following command:

```
python3 resumeScanner.py john_doe_resume.pdf
```

### Output

```json
{
  "name": "John Doe\n\nSUMMARY",
  "contact": {
    "email": "john.doe@email.com",
    "phone": "+61 412 345 678",
    "github": "github.com/johndoe",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "summary": "Results-driven Mechanical Engineer with 6+ years of experience...",
  "experience": "Senior Mechanical Engineer\nAerotek Engineering Solutions | Sydney, NSW | Mar 2021 – Present\n...",
  "education": "Bachelor of Engineering (Mechanical) — Honours\nUniversity of New South Wales (UNSW) | Sydney, NSW | 2014 – 2017\n...",
  "skills": [
    "abaqus", "ansys", "as9100", "autocad", "c", "catia", "fea",
    "gd&t", "iso 9001", "lean", "lean manufacturing", "matlab",
    "ms project", "python", "r", "solidworks"
  ],
  "projects": "Solar-Powered Water Pump — Personal Project (2022)\n...",
  "certifications": [
    "ca", "en", "engineers australia", "first aid",
    "general construction induction", "mieaust",
    "ndis worker screening", "ner", "white card"
  ],
  "raw_text": "..."
}
```