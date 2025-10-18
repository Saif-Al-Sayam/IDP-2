// Employer Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    loadEmployerDashboard();
});

function loadEmployerDashboard() {
    const user = getCurrentUser();
    if (!user || user.accountType !== 'employer') {
        window.location.href = 'index.html';
        return;
    }

    loadEmployerJobs();
    loadEmployerApplications();
    updateDashboardStats();
}

function loadEmployerJobs() {
    const jobsList = document.getElementById('employerJobsList');
    const jobs = JSON.parse(localStorage.getItem('employerJobs')) || [];
    
    document.getElementById('activeJobsCount').textContent = jobs.length;
    
    if (jobs.length === 0) {
        jobsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-briefcase"></i>
                <h3>No Jobs Posted Yet</h3>
                <p>Start posting jobs to attract talented candidates</p>
                <a href="post-job.html" class="btn btn-primary">Post Your First Job</a>
            </div>
        `;
        return;
    }
    
    jobsList.innerHTML = jobs.map(job => `
        <div class="job-item">
            <div class="job-info">
                <h4>${job.title}</h4>
                <p>${job.company} • ${job.location} • ${job.type}</p>
                <div class="job-meta">
                    <span class="applications">${job.applications || 0} applications</span>
                    <span class="status ${job.status}">${job.status}</span>
                </div>
            </div>
            <div class="job-actions">
                <button class="btn btn-outline" onclick="viewJobApplications(${job.id})">
                    <i class="fas fa-users"></i> View Applications
                </button>
                <button class="btn btn-outline" onclick="editJob(${job.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteJob(${job.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function loadEmployerApplications() {
    const applicationsList = document.getElementById('employerApplicationsList');
    const applications = JSON.parse(localStorage.getItem('employerApplications')) || [];
    
    document.getElementById('totalApplications').textContent = applications.length;
    
    if (applications.length === 0) {
        applicationsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-paper-plane"></i>
                <h3>No Applications Yet</h3>
                <p>Applications to your jobs will appear here</p>
            </div>
        `;
        return;
    }
    
    applicationsList.innerHTML = applications.map(app => `
        <div class="application-item">
            <div class="applicant-info">
                <div class="applicant-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="applicant-details">
                    <h4>${app.applicantName}</h4>
                    <p>Applied for: ${app.jobTitle}</p>
                    <small>Applied on ${new Date(app.appliedDate).toLocaleDateString()}</small>
                </div>
            </div>
            <div class="application-actions">
                <span class="status ${app.status}">${app.status}</span>
                <button class="btn btn-outline" onclick="viewApplication(${app.id})">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

function updateDashboardStats() {
    // Update any additional stats
    const profileViews = Math.floor(Math.random() * 50);
    document.getElementById('profileViews').textContent = profileViews;
}

function viewJobApplications(jobId) {
    // Navigate to applications page for this job
    showNotification('Navigating to applications...', 'info');
    // In a real app, this would open a modal or navigate to a dedicated page
}

function editJob(jobId) {
    // Navigate to edit job page
    showNotification('Edit job functionality coming soon...', 'info');
}

function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job posting?')) {
        let jobs = JSON.parse(localStorage.getItem('employerJobs')) || [];
        jobs = jobs.filter(job => job.id !== jobId);
        localStorage.setItem('employerJobs', JSON.stringify(jobs));
        
        showNotification('Job deleted successfully', 'success');
        loadEmployerDashboard();
    }
}

function viewApplication(applicationId) {
    // View application details
    showNotification('Viewing application details...', 'info');
}