// Jobs listing functionality
document.addEventListener('DOMContentLoaded', function() {
    loadJobs();
    setupFilters();
});

function loadJobs() {
    const jobsList = document.getElementById('jobsList');
    if (!jobsList) return;

    // Mock jobs data
    const jobs = [
        {
            id: 1,
            title: "Senior Web Developer",
            company: "Tech Solutions Inc",
            location: "New York, NY",
            type: "Full Time",
            salary: "$90,000 - $120,000",
            description: "We are looking for an experienced web developer to join our team...",
            posted: "2 days ago"
        },
        {
            id: 2,
            title: "UX Designer",
            company: "Creative Agency",
            location: "Remote",
            type: "Remote",
            salary: "$70,000 - $90,000",
            description: "Join our design team to create amazing user experiences...",
            posted: "1 week ago"
        }
        // Add more mock jobs as needed
    ];

    jobsList.innerHTML = jobs.map(job => `
        <div class="job-card">
            <h3 class="job-title">${job.title}</h3>
            <div class="job-company">${job.company}</div>
            <div class="job-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                <span><i class="fas fa-clock"></i> ${job.type}</span>
                <span><i class="fas fa-dollar-sign"></i> ${job.salary}</span>
                <span><i class="fas fa-calendar"></i> ${job.posted}</span>
            </div>
            <p class="job-description">${job.description}</p>
            <div class="job-actions">
                <button class="btn btn-primary" onclick="applyForJob(${job.id})">Apply Now</button>
                <button class="btn btn-outline" onclick="saveJob(${job.id})">Save</button>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
}

function performSearch() {
    // Implement search functionality
    showNotification('Searching for jobs...', 'info');
}

function applyForJob(jobId) {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please log in to apply for jobs', 'error');
        openAuthModal('login');
        return;
    }
    
    showNotification('Application submitted successfully!', 'success');
}

function saveJob(jobId) {
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please log in to save jobs', 'error');
        openAuthModal('login');
        return;
    }
    
    showNotification('Job saved to your favorites', 'success');
}

function getCurrentUser() {
    // This would typically check localStorage or a global variable
    return JSON.parse(localStorage.getItem('currentUser'));
}