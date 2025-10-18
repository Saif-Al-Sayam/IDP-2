class JobPortal {
    constructor() {
        this.currentUser = this.getStoredUser();
        this.jobs = JSON.parse(localStorage.getItem('jobs')) || [];
        this.applications = JSON.parse(localStorage.getItem('applications')) || [];
        this.init();
    }

    getStoredUser() {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user:', error);
            return null;
        }
    }

    init() {
        this.initAuthModal();
        this.initSearch();
        this.loadJobs();
        this.updateUI();
        
        if (window.location.pathname.includes('dashboard.html')) {
            this.loadDashboard();
        }
    }

    initAuthModal() {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        // Re-attach event listeners for auth buttons
        document.getElementById('loginBtn')?.addEventListener('click', () => this.openAuthModal('login'));
        document.getElementById('signupBtn')?.addEventListener('click', () => this.openAuthModal('signup'));

        // Close modal
        document.querySelector('.close-modal')?.addEventListener('click', () => this.closeAuthModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeAuthModal();
        });

        // Switch tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchAuthTab(tab);
            });
        });

        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm')?.addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('postJobForm')?.addEventListener('submit', (e) => this.handlePostJob(e));
    }

    initSearch() {
        document.getElementById('searchBtn')?.addEventListener('click', () => this.performSearch());
        
        const searchInputs = document.querySelectorAll('#jobSearch, #locationSearch');
        searchInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        });
    }

    performSearch() {
        const jobQuery = document.getElementById('jobSearch')?.value.toLowerCase() || '';
        const locationQuery = document.getElementById('locationSearch')?.value.toLowerCase() || '';
        
        let filteredJobs = this.jobs;
        
        if (jobQuery) {
            filteredJobs = filteredJobs.filter(job => 
                job.title.toLowerCase().includes(jobQuery) ||
                job.company.toLowerCase().includes(jobQuery)
            );
        }
        
        if (locationQuery) {
            filteredJobs = filteredJobs.filter(job => 
                job.location.toLowerCase().includes(locationQuery)
            );
        }
        
        this.displayJobs(filteredJobs);
    }

    openAuthModal(tab = 'login') {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('active');
            this.switchAuthTab(tab);
        }
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
        });
        
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}Form`);
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const btn = e.target.querySelector('button');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Logging in...';

        try {
            const response = await fetch('auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'login',
                    ...data
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentUser = result.data;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showNotification('Login successful!', 'success');
                this.closeAuthModal();
                this.updateUI();
                
                // Redirect to dashboard after successful login
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const btn = e.target.querySelector('button');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Creating account...';

        try {
            const response = await fetch('auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'signup',
                    ...data
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentUser = result.data;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showNotification('Account created successfully!', 'success');
                this.closeAuthModal();
                this.updateUI();
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showNotification('Signup failed. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    loadJobs() {
        // Only load from localStorage - no demo jobs
        const storedJobs = localStorage.getItem('jobs');
        this.jobs = storedJobs ? JSON.parse(storedJobs) : [];
        this.displayJobs(this.jobs);
    }

    displayJobs(jobsToDisplay = null) {
        const grid = document.getElementById('jobsGrid');
        if (!grid) return;

        const jobs = jobsToDisplay || this.jobs;

        if (jobs.length === 0) {
            grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; padding: 2rem;">No jobs available. Check back later!</p>';
            return;
        }

        grid.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p><strong>${job.company}</strong></p>
                <div class="job-meta">
                    <span>${job.type}</span>
                    <span>${job.location}</span>
                    <span>${job.salary}</span>
                </div>
                <p>${job.description.substring(0, 150)}...</p>
                <div class="job-actions">
                    <button class="btn btn-primary" onclick="app.applyForJob(${job.id})">
                        Apply Now
                    </button>
                    <button class="btn btn-outline" onclick="app.saveJob(${job.id})">
                        Save
                    </button>
                </div>
            </div>
        `).join('');
    }

    handlePostJob(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (!this.currentUser) {
            this.showNotification('Please log in to post jobs', 'error');
            return;
        }

        if (this.currentUser.account_type !== 'employer') {
            this.showNotification('Only employers can post jobs', 'error');
            return;
        }

        // Create new job
        const newJob = {
            id: Date.now(),
            employer_id: this.currentUser.id,
            title: data.title,
            company: data.company,
            type: data.type,
            location: data.location,
            salary: data.salary,
            description: data.description,
            created_at: new Date().toISOString()
        };

        // Add to jobs array
        this.jobs.unshift(newJob); // Add to beginning
        localStorage.setItem('jobs', JSON.stringify(this.jobs));

        this.showNotification('Job posted successfully!', 'success');
        e.target.reset();
        
        // Hide form and refresh display
        const jobForm = document.getElementById('jobForm');
        if (jobForm) {
            jobForm.style.display = 'none';
        }
        
        // Refresh appropriate view
        if (window.location.pathname.includes('dashboard.html')) {
            this.loadEmployerDashboard();
        } else {
            this.displayJobs();
        }
    }

    applyForJob(jobId) {
        if (!this.currentUser) {
            this.showNotification('Please log in to apply for jobs', 'error');
            this.openAuthModal('login');
            return;
        }

        const job = this.jobs.find(j => j.id === jobId);
        if (!job) {
            this.showNotification('Job not found', 'error');
            return;
        }

        // Check if already applied
        const existingApp = this.applications.find(app => 
            app.jobId === jobId && app.userId === this.currentUser.id
        );

        if (existingApp) {
            this.showNotification('You have already applied for this job', 'info');
            return;
        }

        // Add application
        const newApplication = {
            id: Date.now(),
            jobId: jobId,
            userId: this.currentUser.id,
            jobTitle: job.title,
            company: job.company,
            appliedAt: new Date().toISOString(),
            status: 'pending'
        };

        this.applications.push(newApplication);
        localStorage.setItem('applications', JSON.stringify(this.applications));
        
        this.showNotification(`Application submitted for ${job.title}!`, 'success');
        
        if (window.location.pathname.includes('dashboard.html')) {
            this.loadJobSeekerDashboard();
        }
    }

    saveJob(jobId) {
        if (!this.currentUser) {
            this.showNotification('Please log in to save jobs', 'error');
            this.openAuthModal('login');
            return;
        }

        let savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
        const job = this.jobs.find(j => j.id === jobId);
        
        if (!job) {
            this.showNotification('Job not found', 'error');
            return;
        }

        const alreadySaved = savedJobs.find(j => j.jobId === jobId && j.userId === this.currentUser.id);
        
        if (!alreadySaved) {
            savedJobs.push({
                jobId: jobId,
                userId: this.currentUser.id,
                jobTitle: job.title,
                company: job.company,
                savedAt: new Date().toISOString()
            });
            
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
            this.showNotification('Job saved successfully!', 'success');
            
            if (window.location.pathname.includes('dashboard.html')) {
                this.loadJobSeekerDashboard();
            }
        } else {
            this.showNotification('Job already saved', 'info');
        }
    }

    loadDashboard() {
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        this.updateUI();

        if (this.currentUser.account_type === 'job_seeker') {
            this.loadJobSeekerDashboard();
        } else {
            this.loadEmployerDashboard();
        }
    }

    loadJobSeekerDashboard() {
        const seekerDashboard = document.getElementById('jobSeekerDashboard');
        const employerDashboard = document.getElementById('employerDashboard');
        
        if (seekerDashboard) seekerDashboard.style.display = 'block';
        if (employerDashboard) employerDashboard.style.display = 'none';
        
        const userApplications = this.applications.filter(app => app.userId === this.currentUser.id);
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
        const userSavedJobs = savedJobs.filter(job => job.userId === this.currentUser.id);

        document.getElementById('applicationsCount').textContent = userApplications.length;
        document.getElementById('savedJobsCount').textContent = userSavedJobs.length;

        const appsList = document.getElementById('applicationsList');
        if (appsList) {
            if (userApplications.length === 0) {
                appsList.innerHTML = '<p>No applications yet. Start applying to jobs!</p>';
            } else {
                appsList.innerHTML = userApplications.map(app => `
                    <div class="job-card">
                        <h3>${app.jobTitle}</h3>
                        <p>${app.company} • Applied on ${new Date(app.appliedAt).toLocaleDateString()}</p>
                        <span class="status" style="background: #ffeaa7; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${app.status}</span>
                    </div>
                `).join('');
            }
        }
    }

    loadEmployerDashboard() {
        const seekerDashboard = document.getElementById('jobSeekerDashboard');
        const employerDashboard = document.getElementById('employerDashboard');
        
        if (seekerDashboard) seekerDashboard.style.display = 'none';
        if (employerDashboard) employerDashboard.style.display = 'block';
        
        const employerJobs = this.jobs.filter(job => job.employer_id === this.currentUser.id);
        const allApplications = this.applications.filter(app => 
            employerJobs.some(job => job.id === app.jobId)
        );

        document.getElementById('activeJobsCount').textContent = employerJobs.length;
        document.getElementById('totalApplications').textContent = allApplications.length;

        const jobsList = document.getElementById('employerJobsList');
        if (jobsList) {
            if (employerJobs.length === 0) {
                jobsList.innerHTML = '<p>No jobs posted yet. Click "Post New Job" to get started!</p>';
            } else {
                jobsList.innerHTML = employerJobs.map(job => {
                    const jobApplications = allApplications.filter(app => app.jobId === job.id);
                    return `
                        <div class="job-card">
                            <h3>${job.title}</h3>
                            <p>${job.company} • ${job.location} • ${jobApplications.length} applications</p>
                            <div class="job-actions">
                                <button class="btn btn-outline" onclick="app.viewApplications(${job.id})">
                                    View Applications (${jobApplications.length})
                                </button>
                                <button class="btn btn-outline" onclick="app.deleteJob(${job.id})">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    deleteJob(jobId) {
        if (confirm('Are you sure you want to delete this job posting?')) {
            this.jobs = this.jobs.filter(job => job.id !== jobId);
            localStorage.setItem('jobs', JSON.stringify(this.jobs));
            
            this.applications = this.applications.filter(app => app.jobId !== jobId);
            localStorage.setItem('applications', JSON.stringify(this.applications));
            
            this.showNotification('Job deleted successfully', 'success');
            this.loadEmployerDashboard();
        }
    }

    updateUI() {
        this.updateAuthUI();
    }

    updateAuthUI() {
        const authSection = document.getElementById('authSection');
        if (!authSection) return;

        if (this.currentUser) {
            authSection.innerHTML = `
                <span style="margin-right: 10px;">Welcome, ${this.currentUser.full_name}</span>
                <a href="dashboard.html" class="btn btn-outline">Dashboard</a>
                <button class="btn btn-primary" onclick="app.logout()">Logout</button>
            `;
        } else {
            authSection.innerHTML = `
                <button class="btn btn-outline" id="loginBtn">Login</button>
                <button class="btn btn-primary" id="signupBtn">Sign Up</button>
            `;
            // Re-attach event listeners
            setTimeout(() => this.initAuthModal(), 100);
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showNotification('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.custom-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = 'custom-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    viewApplications(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        const jobApplications = this.applications.filter(app => app.jobId === jobId);
        
        if (jobApplications.length === 0) {
            this.showNotification('No applications for this job yet', 'info');
            return;
        }
        
        const applicationList = jobApplications.map(app => 
            `• ${app.jobTitle} - Applied: ${new Date(app.appliedAt).toLocaleDateString()} - Status: ${app.status}`
        ).join('\n');
        
        alert(`Applications for "${job.title}":\n\n${applicationList}`);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    window.app = new JobPortal();
});