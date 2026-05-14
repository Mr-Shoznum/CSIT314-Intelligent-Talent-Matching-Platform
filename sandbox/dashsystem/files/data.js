/**
 * ITMP Data Service (data.js)
 * Loads jobs and user accounts from JSON files.
 * Uses localStorage to track the active session and application state.
 *
 * Usage: include this script before page-specific scripts.
 *   <script src="data.js"></script>
 */

const DataService = (() => {

    // -------------------------------------------------------------------------
    // Internal cache
    // -------------------------------------------------------------------------
    let _jobs    = null;   // Array of job objects
    let _users   = null;   // Array of user objects
    let _ready   = false;
    const _listeners = [];

    // -------------------------------------------------------------------------
    // Session helpers (localStorage)
    // Active session key stores the logged-in user's id.
    // Applied/saved job mutations are persisted to localStorage so page
    // navigations don't reset state.
    // -------------------------------------------------------------------------
    const SESSION_KEY  = 'itmp_session_user_id';
    const APPLIED_KEY  = (userId) => `itmp_applied_${userId}`;
    const SAVED_KEY    = (userId) => `itmp_saved_${userId}`;

    function _getSessionUserId() {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? parseInt(raw, 10) : 1; // Default to user id 1 for demo
    }

    function _loadApplied(userId) {
        const raw = localStorage.getItem(APPLIED_KEY(userId));
        return raw ? JSON.parse(raw) : null;
    }

    function _saveApplied(userId, list) {
        localStorage.setItem(APPLIED_KEY(userId), JSON.stringify(list));
    }

    function _loadSaved(userId) {
        const raw = localStorage.getItem(SAVED_KEY(userId));
        return raw ? JSON.parse(raw) : null;
    }

    function _saveSaved(userId, list) {
        localStorage.setItem(SAVED_KEY(userId), JSON.stringify(list));
    }

    // -------------------------------------------------------------------------
    // Fetch helpers
    // -------------------------------------------------------------------------
    async function _fetchJSON(path) {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        return res.json();
    }

    // -------------------------------------------------------------------------
    // Initialisation — load both JSON files in parallel
    // -------------------------------------------------------------------------
    async function init() {
        try {
            const [jobsData, accountsData] = await Promise.all([
                _fetchJSON('jobs.json'),
                _fetchJSON('accounts.json')
            ]);

            _jobs  = jobsData.jobs;
            _users = accountsData.users;

            // Merge any persisted applied/saved state into the user objects
            _users.forEach(user => {
                const persisted_applied = _loadApplied(user.id);
                const persisted_saved   = _loadSaved(user.id);
                if (persisted_applied !== null) user.applied_jobs = persisted_applied;
                if (persisted_saved   !== null) user.saved_jobs   = persisted_saved;
            });

            _ready = true;
            _listeners.forEach(fn => fn());
        } catch (err) {
            console.error('[DataService] init error:', err);
        }
    }

    // Calls cb immediately if already ready, otherwise queues it.
    function onReady(cb) {
        if (_ready) { cb(); } else { _listeners.push(cb); }
    }

    // -------------------------------------------------------------------------
    // User API
    // -------------------------------------------------------------------------
    function getCurrentUser() {
        const id = _getSessionUserId();
        return _users?.find(u => u.id === id) ?? null;
    }

    function getUserById(id) {
        return _users?.find(u => u.id === id) ?? null;
    }

    // -------------------------------------------------------------------------
    // Jobs API
    // -------------------------------------------------------------------------
    function getAllJobs() {
        return _jobs ? [..._jobs] : [];
    }

    function getJobById(id) {
        return _jobs?.find(j => j.id === id) ?? null;
    }

    /**
     * Returns jobs with isApplied / isSaved flags set for the current user.
     * Optionally filters by a search query (title, company, location, skills).
     */
    function getJobsForCurrentUser(query = '') {
        const user = getCurrentUser();
        const applied = user?.applied_jobs ?? [];
        const saved   = user?.saved_jobs   ?? [];

        let jobs = getAllJobs().map(job => ({
            ...job,
            isApplied: applied.includes(job.id),
            isSaved:   saved.includes(job.id)
        }));

        if (query.trim()) {
            const q = query.trim().toLowerCase();
            jobs = jobs.filter(job =>
                job.title.toLowerCase().includes(q) ||
                job.company.toLowerCase().includes(q) ||
                job.location.toLowerCase().includes(q) ||
                job.skills.some(s => s.name.toLowerCase().includes(q))
            );
        }

        return jobs;
    }

    function getRecommendedJobs() {
        return getJobsForCurrentUser().filter(j => !j.isApplied);
    }

    function getAppliedJobs() {
        return getJobsForCurrentUser().filter(j => j.isApplied);
    }

    function getSavedJobs() {
        return getJobsForCurrentUser().filter(j => j.isSaved);
    }

    // -------------------------------------------------------------------------
    // Mutations
    // -------------------------------------------------------------------------
    function applyForJob(jobId) {
        const user = getCurrentUser();
        if (!user) return false;
        if (user.applied_jobs.includes(jobId)) return false;

        user.applied_jobs.push(jobId);
        // Remove from saved if it was saved
        user.saved_jobs = user.saved_jobs.filter(id => id !== jobId);
        _saveApplied(user.id, user.applied_jobs);
        _saveSaved(user.id, user.saved_jobs);
        return true;
    }

    function toggleSaveJob(jobId) {
        const user = getCurrentUser();
        if (!user) return false;
        if (user.applied_jobs.includes(jobId)) return false; // can't save applied jobs

        const idx = user.saved_jobs.indexOf(jobId);
        if (idx === -1) {
            user.saved_jobs.push(jobId);
        } else {
            user.saved_jobs.splice(idx, 1);
        }
        _saveSaved(user.id, user.saved_jobs);
        return true;
    }

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------
    /**
     * Computes which of the user's skills match a job's required skills.
     * Returns an array of skill objects with an `isMatch` boolean added.
     */
    function getSkillsWithMatchStatus(job) {
        const user = getCurrentUser();
        const userSkills = (user?.skills ?? []).map(s => s.toLowerCase());
        return job.skills.map(skill => ({
            ...skill,
            isMatch: userSkills.includes(skill.name.toLowerCase())
        }));
    }

    /** Formats a salary number as a compact string, e.g. 120000 -> "$120k" */
    function formatSalary(amount) {
        return `$${Math.round(amount / 1000)}k`;
    }

    /** Returns "X days ago" / "today" from an ISO date string */
    function timeAgo(isoDate) {
        const posted = new Date(isoDate);
        const now    = new Date();
        const diff   = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return '1 day ago';
        if (diff < 7)  return `${diff} days ago`;
        if (diff < 14) return '1 week ago';
        return `${Math.floor(diff / 7)} weeks ago`;
    }

    /** Navigates to the job detail page */
    function goToJobPage(jobId) {
        window.location.href = `job.html?id=${jobId}`;
    }

    /** Navigates to the candidate profile page */
    function goToProfilePage() {
        window.location.href = 'profile.html';
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------
    return {
        init,
        onReady,
        getCurrentUser,
        getUserById,
        getAllJobs,
        getJobById,
        getJobsForCurrentUser,
        getRecommendedJobs,
        getAppliedJobs,
        getSavedJobs,
        applyForJob,
        toggleSaveJob,
        getSkillsWithMatchStatus,
        formatSalary,
        timeAgo,
        goToJobPage,
        goToProfilePage
    };

})();

// Auto-initialise when the DOM is ready
document.addEventListener('DOMContentLoaded', () => DataService.init());
