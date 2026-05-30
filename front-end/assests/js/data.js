/**
 * data.js — ITMP API Client
 * Replaces hardcoded demo data with real API calls.
 * Nginx proxies /api/* to the Node.js backend (port 3000).
 */

const DataService = (() => {
    const API = '/api';

    let _user        = null;
    let _jobs        = [];
    let _candidates  = [];
    let _myJobs      = [];
    let _appliedIds  = new Set();
    let _savedIds    = new Set();
    let _ready       = false;
    const _listeners = [];

    // ── Storage ───────────────────────────────────────────────────────
    function _storedUser() {
        try { return JSON.parse(localStorage.getItem('itmp_user')); }
        catch { return null; }
    }

    // ── Fetch wrapper ─────────────────────────────────────────────────
    async function _fetch(path, opts = {}) {
        const user = _storedUser();
        const headers = { 'Content-Type': 'application/json' };
        if (user?.id) headers['X-User-Id'] = String(user.id);
        const res = await fetch(API + path, {
            ...opts,
            headers: { ...headers, ...(opts.headers || {}) },
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
    }

    // ── Match score (client-side) ──────────────────────────────────────
    function _computeMatch(jobSkills, userSkills) {
        if (!jobSkills.length || !userSkills.length) return 0;
        const ul = userSkills.map(s => s.toLowerCase());
        const matched = jobSkills.filter(s => ul.includes(s.name.toLowerCase())).length;
        return Math.round((matched / jobSkills.length) * 100);
    }

    // ── Init ──────────────────────────────────────────────────────────
    async function init() {
        const stored = _storedUser();

        if (!stored?.id) {
            if (window.location.pathname.includes('/auth/')) {
                window.location.replace('/pages/login.html');
                return;
            }
            _ready = true;
            _listeners.forEach(fn => fn());
            _listeners.length = 0;
            return;
        }

        try {
            _user = await _fetch('/profile/me');
        } catch (e) {
            console.error('DataService: failed to load profile', e);
            _ready = true;
            _listeners.forEach(fn => fn());
            _listeners.length = 0;
            return;
        }

        const isCandidate = _user.account_type === 'candidate';
        const tasks = [
            _fetch('/jobs').catch(() => []),
            _fetch('/candidates').catch(() => []),
            isCandidate ? _fetch('/my/applications').catch(() => []) : Promise.resolve([]),
            isCandidate ? _fetch('/my/saved').catch(() => [])        : Promise.resolve([]),
            !isCandidate ? _fetch('/my/jobs').catch(() => [])        : Promise.resolve([]),
        ];

        const [jobs, candidates, applications, savedIds, myJobs] = await Promise.all(tasks);

        _candidates = candidates;
        _myJobs     = myJobs;
        _appliedIds = new Set(applications.map(a => a.job_id));
        _savedIds   = new Set(savedIds);

        const userSkills = _user.skills || [];
        _jobs = jobs.map(job => ({
            ...job,
            match_score: _computeMatch(job.skills || [], userSkills),
            isApplied:   _appliedIds.has(job.id),
            isSaved:     _savedIds.has(job.id),
        }));

        _ready = true;
        _listeners.forEach(fn => fn());
        _listeners.length = 0;
    }

    function onReady(cb) { if (_ready) cb(); else _listeners.push(cb); }

    // ── User ──────────────────────────────────────────────────────────
    function getCurrentUser()     { return _user; }
    function getCurrentEmployer() { return _user?.account_type === 'company' ? _user : null; }
    function getCurrentRole()     { return _user?.account_type === 'company' ? 'employer' : 'candidate'; }
    function getUserById(id)      { return _candidates.find(c => c.id === Number(id)) ?? null; }
    function getCandidateById(id) { return _candidates.find(c => c.id === Number(id)) ?? null; }

    // ── Jobs ──────────────────────────────────────────────────────────
    function getAllJobs()    { return [..._jobs]; }
    function getJobById(id) { return _jobs.find(j => j.id === Number(id)) ?? null; }

    function getJobsForCurrentUser(query = '') {
        let jobs = getAllJobs();
        if (query.trim()) {
            const q = query.toLowerCase();
            jobs = jobs.filter(j =>
                j.title.toLowerCase().includes(q)   ||
                j.company.toLowerCase().includes(q) ||
                (j.location || '').toLowerCase().includes(q) ||
                (j.skills || []).some(s => s.name.toLowerCase().includes(q))
            );
        }
        return jobs;
    }

    function searchJobs(filters = {}) {
        let jobs = getJobsForCurrentUser(filters.query || '');
        if (filters.workMode?.length)  jobs = jobs.filter(j => filters.workMode.includes(j.work_mode));
        if (filters.jobType?.length)   jobs = jobs.filter(j => filters.jobType.includes(j.job_type));
        if (filters.industry)          jobs = jobs.filter(j => (j.industry||'').toLowerCase().includes(filters.industry.toLowerCase()));
        if (filters.location)          jobs = jobs.filter(j => (j.location||'').toLowerCase().includes(filters.location.toLowerCase()));
        if (filters.salaryMin != null) jobs = jobs.filter(j => j.salary_max >= filters.salaryMin);
        if (filters.salaryMax != null) jobs = jobs.filter(j => j.salary_min <= filters.salaryMax);
        if (filters.matchMin  != null) jobs = jobs.filter(j => j.match_score >= filters.matchMin);
        return jobs;
    }

    function searchCandidates(filters = {}) {
        const currentId = _user?.id;
        let cs = _candidates.filter(c => c.id !== currentId);

        if (filters.query?.trim()) {
            const q = filters.query.toLowerCase();
            cs = cs.filter(c =>
                (c.full_name||'').toLowerCase().includes(q) ||
                (c.headline||'').toLowerCase().includes(q)  ||
                (c.location||'').toLowerCase().includes(q)  ||
                (c.skills||[]).some(s => s.toLowerCase().includes(q))
            );
        }
        if (filters.workMode?.length)  cs = cs.filter(c => filters.workMode.includes(c.work_mode_preference));
        if (filters.location)          cs = cs.filter(c => (c.location||'').toLowerCase().includes(filters.location.toLowerCase()));
        if (filters.yoeMin != null)    cs = cs.filter(c => c.yoe >= filters.yoeMin);
        if (filters.yoeMax != null)    cs = cs.filter(c => c.yoe <= filters.yoeMax);
        if (filters.availability)      cs = cs.filter(c => c.availability === filters.availability);
        if (filters.openToWork)        cs = cs.filter(c => c.open_to_work);
        if (filters.skills?.length)    cs = cs.filter(c =>
            filters.skills.every(fs => (c.skills||[]).some(us => us.toLowerCase().includes(fs.toLowerCase())))
        );
        return cs;
    }

    function getRecommendedJobs() { return _jobs.filter(j => !j.isApplied); }
    function getAppliedJobs()     { return _jobs.filter(j =>  j.isApplied); }
    function getSavedJobs()       { return _jobs.filter(j =>  j.isSaved && !j.isApplied); }
    function getPostedJobs()      { return _myJobs; }
    function getApplicants()      { return []; }
    function getSavedCandidates() { return []; }

    // ── Mutations (optimistic — update local state, call API in background) ──
    function applyForJob(jobId) {
        const id = Number(jobId);
        if (_appliedIds.has(id)) return false;
        _appliedIds.add(id);
        _savedIds.delete(id);
        _jobs = _jobs.map(j => j.id === id ? { ...j, isApplied: true, isSaved: false } : j);
        _fetch(`/jobs/${id}/apply`, { method: 'POST' }).catch(e => console.error('apply error:', e));
        return true;
    }

    function toggleSaveJob(jobId) {
        const id = Number(jobId);
        if (_appliedIds.has(id)) return false;
        const wasSaved = _savedIds.has(id);
        if (wasSaved) _savedIds.delete(id); else _savedIds.add(id);
        _jobs = _jobs.map(j => j.id === id ? { ...j, isSaved: !wasSaved } : j);
        _fetch(`/jobs/${id}/save`, { method: 'POST' }).catch(e => console.error('save error:', e));
        return true;
    }

    function updateProfile(fields) {
        if (_user) Object.assign(_user, fields);
        _fetch('/profile/me', { method: 'PUT', body: JSON.stringify(fields) })
            .catch(e => console.error('updateProfile error:', e));
        return true;
    }

    async function createJob(jobData) {
        try {
            const job = await _fetch('/jobs', { method: 'POST', body: JSON.stringify(jobData) });
            _myJobs.unshift(job);
            return true;
        } catch (e) {
            console.error('createJob error:', e);
            return false;
        }
    }

    function updateResume(filename, date) {
        if (_user) { _user.resume_filename = filename; _user.resume_upload_date = date; }
    }
    function deleteResume() {
        if (_user) { _user.resume_filename = ''; _user.resume_upload_date = ''; }
    }
    function updateAvatar(color) {
        if (_user) _user.avatar_color = color;
    }

    // ── Auth ──────────────────────────────────────────────────────────
    function logout() {
        localStorage.removeItem('itmp_user');
        window.location.replace('/pages/login.html');
    }

    // ── Skills match ──────────────────────────────────────────────────
    function getSkillsWithMatchStatus(job) {
        const ul = (_user?.skills ?? []).map(s => s.toLowerCase());
        return (job.skills || []).map(s => ({ ...s, isMatch: ul.includes(s.name.toLowerCase()) }));
    }

    // ── Utilities ─────────────────────────────────────────────────────
    function timeAgo(isoDate) {
        if (!isoDate) return '';
        const diff = Math.floor((new Date() - new Date(isoDate)) / 86400000);
        if (diff === 0) return 'Today';
        if (diff === 1) return '1 day ago';
        if (diff < 7)  return `${diff} days ago`;
        if (diff < 14) return '1 week ago';
        return `${Math.floor(diff / 7)} weeks ago`;
    }

    function goToJobPage(id)   { window.location.href = `view_job.html?id=${id}`; }
    function goToProfilePage() { window.location.href = 'c_edit_profile.html'; }

    return {
        init, onReady,
        getCurrentUser, getCurrentEmployer, getCurrentRole, getUserById, getCandidateById,
        getAllJobs, getJobById, getJobsForCurrentUser,
        searchJobs, searchCandidates,
        getRecommendedJobs, getAppliedJobs, getSavedJobs,
        getPostedJobs, getApplicants, getSavedCandidates,
        applyForJob, toggleSaveJob, updateProfile, createJob,
        updateResume, deleteResume, updateAvatar,
        logout,
        getSkillsWithMatchStatus, timeAgo,
        goToJobPage, goToProfilePage,
    };
})();

document.addEventListener('DOMContentLoaded', () => DataService.init());
