
// this script will handle dynamic content rendering for the home page based on user status and data from DataService.
document.addEventListener('DOMContentLoaded', () => {
    if (typeof DataService === 'undefined') {
        console.warn('DataService is not loaded. Ensure data.js is included before home.js.');
        return;
    }

    DataService.onReady(() => {
        renderHomePage();
    });
    DataService.init();
});

// Renders the home page content based on user status and data thats available
function renderHomePage() {
    const user = DataService.getCurrentUser();
    const isPremium = Boolean(user?.is_premium);
    const itemLimit = isPremium ? 10 : 3;

    const jobsContainer = document.getElementById('jobs-listings');
    const candidatesContainer = document.getElementById('candidates-listings');
    const banner = document.getElementById('membership-upgrade-banner');

    if (!jobsContainer || !candidatesContainer) return;

    jobsContainer.innerHTML = '';
    candidatesContainer.innerHTML = '';

    const jobs = DataService.getRecommendedJobs().slice(0, itemLimit);
    const candidates = DataService.searchCandidates({}).slice(0, itemLimit);

    if (jobs.length === 0) {
        jobsContainer.innerHTML = '<p class="empty-message">No job matches are available right now.</p>';
    } else {
        jobs.forEach(job => jobsContainer.appendChild(createJobCard(job)));
    }

    if (candidates.length === 0) {
        candidatesContainer.innerHTML = '<p class="empty-message">No candidate profiles are available right now.</p>';
    } else {
        candidates.forEach(candidate => candidatesContainer.appendChild(createCandidateCard(candidate)));
    }

    if (banner) {
        banner.style.display = isPremium ? 'none' : '';
    }
}

// Creates a job listing card element
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
        <h3>${escapeHtml(job.title)}</h3>
        <p>Location: ${escapeHtml(job.location)}</p>
        <p>Contract: ${escapeHtml(job.job_type)}</p>
        <p>Work from: ${escapeHtml(job.work_mode)}</p>
        <p>Pay: ${escapeHtml(job.salary_display || '$0')}</p>
        <button onclick="openModal('job')">View Details</button>
    `;
    return card;
}

// Creates a candidate profile card element
function createCandidateCard(candidate) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
        <h3>${escapeHtml(candidate.full_name)}</h3>
        <p>Location: ${escapeHtml(candidate.location)}</p>
        <p>Status: ${escapeHtml(candidate.headline)}</p>
        <p>Skills: ${escapeHtml(candidate.skills.slice(0, 4).join(', '))}</p>
        <p>Experience: ${escapeHtml(candidate.yoe)} years</p>
        <button onclick="openModal('candidate')">Reach Out</button>
    `;
    return card;
}

// Simple utility to escape HTML to prevent XSS attacks when rendering user-generated content
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
