class QuickWorkApp {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.init();
    }

    init() {
        this.updateUserInterface();
        this.initializePageSpecificFunctions();
        this.checkAuth();
    }

    checkAuth() {
        if (!this.currentUser && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        if (this.currentUser && window.location.pathname.includes('index.html')) {
            window.location.href = 'dashboard.html';
            return;
        }
    }

    updateUserInterface() {
        this.updateNavigation();
        
        if (window.location.pathname.includes('dashboard.html')) {
            this.updateDashboard();
        }
        
        if (window.location.pathname.includes('profile.html')) {
            this.loadProfileData();
        }
    }

    updateNavigation() {
        const userMenu = document.getElementById('userMenu');
        if (!userMenu) return;

        if (this.currentUser) {
            userMenu.innerHTML = `
                <div class="user-info">
                    <div class="avatar">${this.currentUser.full_name?.charAt(0)?.toUpperCase() || 'U'}</div>
                    <span>${this.currentUser.full_name}</span>
                </div>
                <button class="btn btn-outline" onclick="app.logout()">Logout</button>
            `;
            
            // Show applications link for employers
            const applicationsLinks = document.querySelectorAll('#applicationsLink');
            applicationsLinks.forEach(link => {
                if (this.currentUser.user_type === 'employer') {
                    link.style.display = 'block';
                } else {
                    link.style.display = 'none';
                }
            });
        } else {
            userMenu.innerHTML = `
                <a href="index.html" class="btn btn-outline">Login</a>
            `;
            
            // Hide applications link for logged out users
            const applicationsLinks = document.querySelectorAll('#applicationsLink');
            applicationsLinks.forEach(link => {
                link.style.display = 'none';
            });
        }
    }

    async updateDashboard() {
        if (!this.currentUser) return;

        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.full_name;
        }

        await this.updateDashboardStats();
        
        if (this.currentUser.user_type === 'worker') {
            await this.loadUserApplications();
        } else if (this.currentUser.user_type === 'employer') {
            await this.loadUserWorkPosts();
        }
        
        await this.loadRecentWork();
    }

    async updateDashboardStats() {
        try {
            if (this.currentUser.user_type === 'worker') {
                const response = await fetch(`php/api.php?action=get_user_applications&user_id=${this.currentUser.id}`);
                const result = await response.json();
                
                const activeJobsElement = document.getElementById('activeJobs');
                const totalApplicationsElement = document.getElementById('totalApplications');
                const totalEarningsElement = document.getElementById('totalEarnings');
                const userRatingElement = document.getElementById('userRating');
                
                if (result.success) {
                    const applications = result.data;
                    if (activeJobsElement) activeJobsElement.textContent = applications.filter(app => app.status === 'accepted').length;
                    if (totalApplicationsElement) totalApplicationsElement.textContent = applications.length;
                }
                
                if (totalEarningsElement) totalEarningsElement.textContent = '0';
                if (userRatingElement) userRatingElement.textContent = '0.0';
                
            } else if (this.currentUser.user_type === 'employer') {
                const response = await fetch(`php/api.php?action=get_user_work_posts&user_id=${this.currentUser.id}`);
                const result = await response.json();
                
                const activeJobsElement = document.getElementById('activeJobs');
                const totalApplicationsElement = document.getElementById('totalApplications');
                const totalEarningsElement = document.getElementById('totalEarnings');
                const userRatingElement = document.getElementById('userRating');
                
                if (result.success) {
                    const workPosts = result.data;
                    if (activeJobsElement) activeJobsElement.textContent = workPosts.filter(post => post.status === 'open').length;
                    
                    // Load applications count for employer
                    const appsResponse = await fetch(`php/api.php?action=get_employer_applications&employer_id=${this.currentUser.id}`);
                    const appsResult = await appsResponse.json();
                    if (appsResult.success) {
                        if (totalApplicationsElement) totalApplicationsElement.textContent = appsResult.data.length;
                    }
                }
                
                if (totalEarningsElement) totalEarningsElement.textContent = '0';
                if (userRatingElement) userRatingElement.textContent = '0.0';
            }
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    async loadRecentWork() {
        try {
            const response = await fetch('php/api.php?action=get_work_posts');
            const result = await response.json();
            
            const recentWorkList = document.getElementById('recentWorkList');
            if (!recentWorkList) return;

            if (result.success && result.data.length > 0) {
                const recentWork = result.data.slice(0, 5);
                recentWorkList.innerHTML = recentWork.map(post => `
                    <div class="work-item" style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                        <h4>${post.title}</h4>
                        <p style="color: #718096; margin: 0.5rem 0;">${post.area}, ${post.district} • ৳${post.budget}</p>
                        <span class="status" style="background: #c6f6d5; color: #22543d; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${post.status}</span>
                    </div>
                `).join('');
            } else {
                recentWorkList.innerHTML = '<p>No recent work posts found.</p>';
            }
        } catch (error) {
            console.error('Error loading recent work:', error);
            const recentWorkList = document.getElementById('recentWorkList');
            if (recentWorkList) recentWorkList.innerHTML = '<p>Error loading work posts</p>';
        }
    }

    async loadUserApplications() {
        const applicationsList = document.getElementById('applicationsList');
        if (!applicationsList) return;

        try {
            const response = await fetch(`php/api.php?action=get_user_applications&user_id=${this.currentUser.id}`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const userApps = result.data.slice(0, 5);
                applicationsList.innerHTML = userApps.map(app => `
                    <div class="application-item" style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                        <h4>${app.work_title || 'Unknown Work'}</h4>
                        <p style="color: #718096; margin: 0.5rem 0;">Applied: ${new Date(app.applied_at).toLocaleDateString()}</p>
                        <span class="status" style="background: #fed7d7; color: #742a2a; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${app.status}</span>
                    </div>
                `).join('');
            } else {
                applicationsList.innerHTML = '<p>No applications yet.</p>';
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            applicationsList.innerHTML = '<p>Error loading applications</p>';
        }
    }

    async loadUserWorkPosts() {
        const applicationsList = document.getElementById('applicationsList');
        if (!applicationsList) return;

        try {
            const response = await fetch(`php/api.php?action=get_user_work_posts&user_id=${this.currentUser.id}`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const userPosts = result.data.slice(0, 5);
                applicationsList.innerHTML = userPosts.map(post => `
                    <div class="application-item" style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                        <h4>${post.title}</h4>
                        <p style="color: #718096; margin: 0.5rem 0;">Posted: ${new Date(post.created_at).toLocaleDateString()}</p>
                        <span class="status" style="background: #c6f6d5; color: #22543d; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${post.status}</span>
                    </div>
                `).join('');
            } else {
                applicationsList.innerHTML = '<p>No work posts yet.</p>';
            }
        } catch (error) {
            console.error('Error loading work posts:', error);
            applicationsList.innerHTML = '<p>Error loading work posts</p>';
        }
    }

    initializePageSpecificFunctions() {
        if (window.location.pathname.includes('search.html')) {
            this.initializeSearchPage();
        } else if (window.location.pathname.includes('post-work.html')) {
            this.initializePostWorkPage();
        } else if (window.location.pathname.includes('profile.html')) {
            this.initializeProfilePage();
        } else if (window.location.pathname.includes('messages.html')) {
            this.initializeMessagesPage();
        } else if (window.location.pathname.includes('applications.html')) {
            this.initializeApplicationsPage();
        }
    }

    // Applications Page Functions
    initializeApplicationsPage() {
        if (!this.currentUser || this.currentUser.user_type !== 'employer') {
            window.location.href = 'dashboard.html';
            return;
        }
        
        this.loadEmployerApplications();
        this.setupApplicationFilters();
    }

    setupApplicationFilters() {
        document.querySelectorAll('.filter-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                
                // Update active tab
                document.querySelectorAll('.filter-tabs .tab-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Filter applications
                this.filterApplications(tab);
            });
        });
    }

    async loadEmployerApplications() {
        try {
            const response = await fetch(`php/api.php?action=get_employer_applications&employer_id=${this.currentUser.id}`);
            const result = await response.json();
            
            if (result.success) {
                this.employerApplications = result.data;
                this.displayApplications(this.employerApplications);
            } else {
                this.showNotification('Failed to load applications', 'error');
                this.displayApplications([]);
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            this.showNotification('Error loading applications', 'error');
            this.displayApplications([]);
        }
    }

    displayApplications(applications) {
        const container = document.getElementById('applicationsContainer');
        const noApplications = document.getElementById('noApplications');
        
        if (!container) return;
        
        if (applications.length === 0) {
            container.style.display = 'none';
            if (noApplications) noApplications.style.display = 'block';
            return;
        }
        
        container.style.display = 'block';
        if (noApplications) noApplications.style.display = 'none';
        
        container.innerHTML = applications.map(app => `
            <div class="application-card" data-status="${app.status}" data-application-id="${app.id}">
                <div class="application-header">
                    <h3>${app.work_title}</h3>
                    <span class="application-status status-${app.status}">${app.status}</span>
                </div>
                
                <div class="application-worker">
                    <div class="worker-info">
                        <div class="avatar">${app.worker_name?.charAt(0)?.toUpperCase() || 'W'}</div>
                        <div>
                            <h4>${app.worker_name}</h4>
                            <p>${app.worker_area}, ${app.worker_district}</p>
                        </div>
                    </div>
                    <div class="worker-contact">
                        <span>📞 ${app.worker_phone || 'Not provided'}</span>
                    </div>
                </div>
                
                <div class="application-details">
                    <div class="proposal">
                        <h4>Proposal:</h4>
                        <p>${app.proposal}</p>
                    </div>
                    
                    <div class="application-meta">
                        <div class="meta-item">
                            <span class="label">Bid Amount:</span>
                            <span class="value">৳${app.bid_amount || 'Not specified'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="label">Work Budget:</span>
                            <span class="value">৳${app.work_budget}</span>
                        </div>
                        <div class="meta-item">
                            <span class="label">Applied:</span>
                            <span class="value">${new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    ${app.worker_skills ? `
                    <div class="worker-skills">
                        <h4>Skills:</h4>
                        <p>${app.worker_skills}</p>
                    </div>
                    ` : ''}
                </div>
                
                <div class="application-actions">
                    ${app.status === 'pending' ? `
                        <button class="btn btn-success" onclick="app.updateApplicationStatus(${app.id}, 'accepted')">
                            Accept
                        </button>
                        <button class="btn btn-danger" onclick="app.updateApplicationStatus(${app.id}, 'rejected')">
                            Reject
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-outline" onclick="app.viewApplicationDetails(${app.id})">
                        View Details
                    </button>
                    
                    <button class="btn btn-outline" onclick="app.messageWorker(${app.worker_id}, '${app.worker_name}')">
                        Message
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterApplications(status) {
        if (!this.employerApplications) return;
        
        let filteredApplications = this.employerApplications;
        
        if (status !== 'all') {
            filteredApplications = this.employerApplications.filter(app => app.status === status);
        }
        
        this.displayApplications(filteredApplications);
    }

    async updateApplicationStatus(applicationId, status) {
        if (!confirm(`Are you sure you want to ${status} this application?`)) {
            return;
        }
        
        try {
            const response = await fetch('php/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'update_application_status',
                    application_id: applicationId,
                    status: status,
                    employer_id: this.currentUser.id
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Application ${status} successfully`, 'success');
                this.loadEmployerApplications(); // Reload applications
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            this.showNotification('Failed to update application status', 'error');
        }
    }

    viewApplicationDetails(applicationId) {
        const application = this.employerApplications.find(app => app.id === applicationId);
        if (!application) return;
        
        const modal = document.getElementById('applicationModal');
        const details = document.getElementById('applicationDetails');
        
        if (modal && details) {
            details.innerHTML = `
                <div class="application-detail-view">
                    <div class="detail-section">
                        <h3>Work Information</h3>
                        <p><strong>Title:</strong> ${application.work_title}</p>
                        <p><strong>Budget:</strong> ৳${application.work_budget}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Worker Information</h3>
                        <p><strong>Name:</strong> ${application.worker_name}</p>
                        <p><strong>Phone:</strong> ${application.worker_phone || 'Not provided'}</p>
                        <p><strong>Location:</strong> ${application.worker_area}, ${application.worker_district}, ${application.worker_division}</p>
                        ${application.worker_bio ? `<p><strong>Bio:</strong> ${application.worker_bio}</p>` : ''}
                        ${application.worker_skills ? `<p><strong>Skills:</strong> ${application.worker_skills}</p>` : ''}
                    </div>
                    
                    <div class="detail-section">
                        <h3>Proposal</h3>
                        <div class="proposal-content">
                            ${application.proposal}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Bid Information</h3>
                        <p><strong>Bid Amount:</strong> ${application.bid_amount ? '৳' + application.bid_amount : 'Not specified'}</p>
                        <p><strong>Applied On:</strong> ${new Date(application.applied_at).toLocaleString()}</p>
                        <p><strong>Status:</strong> <span class="status-${application.status}">${application.status}</span></p>
                    </div>
                    
                    ${application.status === 'pending' ? `
                    <div class="detail-actions">
                        <button class="btn btn-success" onclick="app.updateApplicationStatus(${application.id}, 'accepted')">
                            Accept Application
                        </button>
                        <button class="btn btn-danger" onclick="app.updateApplicationStatus(${application.id}, 'rejected')">
                            Reject Application
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
            
            modal.style.display = 'flex';
        }
    }

    closeApplicationModal() {
        const modal = document.getElementById('applicationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    messageWorker(workerId, workerName) {
        this.showNotification(`Messaging feature would open chat with ${workerName}`, 'info');
    }

    // Search Page Functions
    async initializeSearchPage() {
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        if (this.currentUser) {
            const divisionInput = document.getElementById('searchDivision');
            const districtInput = document.getElementById('searchDistrict');
            const areaInput = document.getElementById('searchArea');
            
            if (divisionInput && this.currentUser.division) {
                divisionInput.value = this.currentUser.division;
            }
            if (districtInput && this.currentUser.district) {
                districtInput.value = this.currentUser.district;
            }
            if (areaInput && this.currentUser.area) {
                areaInput.value = this.currentUser.area;
            }
        }

        await this.loadWorkPosts();
        this.initializeApplicationModal();
    }

    async loadWorkPosts() {
        try {
            const response = await fetch('php/api.php?action=get_work_posts');
            const result = await response.json();
            
            if (result.success) {
                this.displayWorkPosts(result.data);
            } else {
                this.displayWorkPosts([]);
            }
        } catch (error) {
            console.error('Error loading work posts:', error);
            this.displayWorkPosts([]);
        }
    }

    async performSearch() {
        const keyword = document.getElementById('searchKeyword')?.value || '';
        const category = document.getElementById('searchCategory')?.value || '';
        const division = document.getElementById('searchDivision')?.value || '';
        const district = document.getElementById('searchDistrict')?.value || '';
        const area = document.getElementById('searchArea')?.value || '';

        try {
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);
            if (category) params.append('category', category);
            if (division) params.append('division', division);
            if (district) params.append('district', district);
            if (area) params.append('area', area);

            const response = await fetch(`php/api.php?action=get_work_posts&${params}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayWorkPosts(result.data);
            } else {
                this.displayWorkPosts([]);
            }
        } catch (error) {
            console.error('Error searching work posts:', error);
            this.displayWorkPosts([]);
        }
    }

    displayWorkPosts(posts) {
        const workResults = document.getElementById('workResults');
        if (!workResults) return;

        if (posts.length === 0) {
            workResults.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <h3>No work found</h3>
                    <p>Try adjusting your search criteria or check back later.</p>
                </div>
            `;
            return;
        }

        workResults.innerHTML = posts.map(post => `
            <div class="work-card">
                <h3>${post.title}</h3>
                <div class="work-meta">
                    <span>📍 ${post.area}, ${post.district}</span>
                    <span>📁 ${post.category}</span>
                    <span>⏱️ ${post.duration || 'Flexible'}</span>
                </div>
                <div class="budget">৳${post.budget}</div>
                <p>${post.description.substring(0, 150)}...</p>
                <div class="work-actions">
                    <button class="btn btn-primary" onclick="app.showApplicationModal(${post.id})">
                        Apply Now
                    </button>
                    <button class="btn btn-outline" onclick="app.viewWorkDetails(${post.id})">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    initializeApplicationModal() {
        const modal = document.getElementById('applicationModal');
        const closeBtn = document.querySelector('.close-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeApplicationModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeApplicationModal();
                }
            });
        }

        const applicationForm = document.getElementById('applicationForm');
        if (applicationForm) {
            applicationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitApplication();
            });
        }
    }

    showApplicationModal(workId) {
        if (!this.currentUser) {
            this.showNotification('Please login to apply for work', 'error');
            return;
        }

        if (this.currentUser.user_type !== 'worker') {
            this.showNotification('Only workers can apply for work', 'error');
            return;
        }

        document.getElementById('applyWorkId').value = workId;
        document.getElementById('applicationModal').style.display = 'flex';
    }

    async submitApplication() {
        const workId = parseInt(document.getElementById('applyWorkId').value);
        const proposal = document.getElementById('proposalText').value;
        const bidAmount = document.getElementById('bidAmount').value;

        if (!proposal) {
            this.showNotification('Please write a proposal', 'error');
            return;
        }

        try {
            const response = await fetch('php/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'apply_work',
                    work_id: workId,
                    worker_id: this.currentUser.id,
                    proposal: proposal,
                    bid_amount: bidAmount || ''
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Application submitted successfully!', 'success');
                this.closeApplicationModal();
                
                if (window.location.pathname.includes('dashboard.html')) {
                    this.loadUserApplications();
                }
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            this.showNotification('Application failed. Please try again.', 'error');
        }
    }

    closeApplicationModal() {
        const modal = document.getElementById('applicationModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        const applicationForm = document.getElementById('applicationForm');
        if (applicationForm) {
            applicationForm.reset();
        }
    }

    viewWorkDetails(workId) {
        this.showNotification('Work details feature would show complete information', 'info');
    }

    // Post Work Functions
    initializePostWorkPage() {
        const postWorkForm = document.getElementById('postWorkForm');
        if (postWorkForm) {
            postWorkForm.addEventListener('submit', (e) => this.handlePostWork(e));
        }

        if (this.currentUser) {
            const divisionInput = document.querySelector('select[name="division"]');
            const districtInput = document.querySelector('input[name="district"]');
            const postCodeInput = document.querySelector('input[name="post_code"]');
            const areaInput = document.querySelector('input[name="area"]');
            
            if (divisionInput && this.currentUser.division) {
                divisionInput.value = this.currentUser.division;
            }
            if (districtInput && this.currentUser.district) {
                districtInput.value = this.currentUser.district;
            }
            if (postCodeInput && this.currentUser.post_code) {
                postCodeInput.value = this.currentUser.post_code;
            }
            if (areaInput && this.currentUser.area) {
                areaInput.value = this.currentUser.area;
            }
        }
    }

    async handlePostWork(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showNotification('Please login to post work', 'error');
            return;
        }

        if (this.currentUser.user_type !== 'employer') {
            this.showNotification('Only employers can post work', 'error');
            return;
        }

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('php/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'post_work',
                    employer_id: this.currentUser.id,
                    ...data
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Work posted successfully!', 'success');
                e.target.reset();
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error posting work:', error);
            this.showNotification('Failed to post work. Please try again.', 'error');
        }
    }

    // Profile Functions
    initializeProfilePage() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }
    }

    loadProfileData() {
        if (!this.currentUser) return;

        const fields = {
            'profileName': 'full_name',
            'profileEmail': 'email',
            'profilePhone': 'phone',
            'profileDivision': 'division',
            'profileDistrict': 'district',
            'profilePostCode': 'post_code',
            'profileArea': 'area',
            'profileBio': 'bio',
            'profileSkills': 'skills'
        };

        Object.entries(fields).forEach(([elementId, userField]) => {
            const element = document.getElementById(elementId);
            if (element && this.currentUser[userField]) {
                if (element.tagName === 'SELECT') {
                    element.value = this.currentUser[userField];
                } else {
                    element.value = this.currentUser[userField];
                }
            }
        });

        this.updateProfileStats();
    }

    updateProfileStats() {
        if (!this.currentUser) return;

        const memberSince = this.currentUser.created_at ? 
            new Date(this.currentUser.created_at).toLocaleDateString() : 'Recently';

        const memberSinceElement = document.getElementById('memberSince');
        if (memberSinceElement) memberSinceElement.textContent = memberSince;
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updates = Object.fromEntries(formData);

        try {
            const response = await fetch('php/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'update_profile',
                    user_id: this.currentUser.id,
                    ...updates
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentUser = { ...this.currentUser, ...updates, ...result.data };
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                this.showNotification('Profile updated successfully!', 'success');
                this.updateNavigation();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Failed to update profile. Please try again.', 'error');
        }
    }

    // Messages Functions
    initializeMessagesPage() {
        this.messages = JSON.parse(localStorage.getItem('messages') || '[]');
        this.loadConversations();
        this.setupChatEventListeners();
    }

    loadConversations() {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        if (this.messages.length === 0) {
            conversationsList.innerHTML = '<p>No conversations yet. Start by applying for work!</p>';
            return;
        }

        conversationsList.innerHTML = '<p>Messaging using database coming soon...</p>';
    }

    setupChatEventListeners() {
        console.log('Chat system initialized (localStorage)');
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
        const existingNotifications = document.querySelectorAll('.custom-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        
        if (type === 'success') {
            notification.style.background = '#48bb78';
        } else if (type === 'error') {
            notification.style.background = '#f56565';
        } else {
            notification.style.background = '#4299e1';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new QuickWorkApp();
});