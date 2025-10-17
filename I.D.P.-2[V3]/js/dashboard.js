// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});

function loadDashboardData() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Load applications
    loadApplications();
    
    // Load saved jobs count
    loadSavedJobsCount();
    
    // Load recommended jobs
    loadRecommendedJobs();
}

function loadApplications() {
    const applicationsList = document.getElementById('applicationsList');
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    
    document.getElementById('applicationsCount').textContent = applications.length;
    
    if (applications.length === 0) {
        applicationsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-paper-plane"></i>
                <h3>No Applications Yet</h3>
                <p>Start applying to jobs to see them here</p>
                <a href="find-jobs.html" class="btn btn-primary">Browse Jobs</a>
            </div>
        `;
        return;
    }
    
    applicationsList.innerHTML = applications.map(app => `
        <div class="application-item">
            <div class="application-info">
                <h4>${app.jobTitle}</h4>
                <p>${app.company} • Applied on ${new Date(app.appliedDate).toLocaleDateString()}</p>
                <span class="status ${app.status}">${app.status}</span>
            </div>
            <div class="application-actions">
                <button class="btn btn-outline" onclick="viewJob(${app.jobId})">View Job</button>
            </div>
        </div>
    `).join('');
}

function loadSavedJobsCount() {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
    document.getElementById('savedJobsCount').textContent = savedJobs.length;
}

function loadRecommendedJobs() {
    const recommendedJobs = document.getElementById('recommendedJobs');
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    
    // Show first 3 jobs as recommendations
    const recommended = jobs.slice(0, 3);
    
    if (recommended.length === 0) {
        recommendedJobs.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-briefcase"></i>
                <h3>No Jobs Available</h3>
                <p>Check back later for new job opportunities</p>
            </div>
        `;
        return;
    }
    
    recommendedJobs.innerHTML = recommended.map(job => `
        <div class="job-card">
            <h3 class="job-title">${job.title}</h3>
            <div class="job-company">${job.company}</div>
            <div class="job-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                <span><i class="fas fa-clock"></i> ${job.type}</span>
                <span><i class="fas fa-dollar-sign"></i> ${job.salary}</span>
            </div>
            <div class="job-actions">
                <button class="btn btn-primary" onclick="applyForJob(${job.id})">Apply Now</button>
                <button class="btn btn-outline" onclick="saveJob(${job.id})">Save</button>
            </div>
        </div>
    `).join('');
}

function viewJob(jobId) {
    // Navigate to job details or find-jobs page
    window.location.href = 'find-jobs.html';
}