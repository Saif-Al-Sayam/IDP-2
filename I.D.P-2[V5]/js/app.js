class QuickWorkApp {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.workPosts = JSON.parse(localStorage.getItem('workPosts') || '[]');
        this.applications = JSON.parse(localStorage.getItem('applications') || '[]');
        this.messages = JSON.parse(localStorage.getItem('messages') || '[]');
        this.currentConversation = null;
        this.init();
    }

    init() {
        this.updateUserInterface();
        this.initializePageSpecificFunctions();
        this.loadUserLocation();
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
        } else {
            userMenu.innerHTML = `
                <a href="index.html" class="btn btn-outline">Login</a>
            `;
        }
    }

    updateDashboard() {
        if (!this.currentUser) return;

        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.full_name;
        }
        
        const userWorkPosts = this.workPosts.filter(post => post.employer_id === this.currentUser.id);
        const userApplications = this.applications.filter(app => app.worker_id === this.currentUser.id);
        
        const activeJobsElement = document.getElementById('activeJobs');
        const totalApplicationsElement = document.getElementById('totalApplications');
        
        if (activeJobsElement) {
            activeJobsElement.textContent = userWorkPosts.filter(post => post.status === 'open').length;
        }
        
        if (totalApplicationsElement) {
            totalApplicationsElement.textContent = userApplications.length;
        }
        
        this.loadRecentWork();
        this.loadUserApplications();
    }

    loadRecentWork() {
        const recentWorkList = document.getElementById('recentWorkList');
        if (!recentWorkList) return;

        const recentWork = this.workPosts
            .filter(post => post.status === 'open')
            .slice(0, 5);

        if (recentWork.length === 0) {
            recentWorkList.innerHTML = '<p>No recent work posts found.</p>';
            return;
        }

        recentWorkList.innerHTML = recentWork.map(post => `
            <div class="work-item" style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                <h4>${post.title}</h4>
                <p style="color: #718096; margin: 0.5rem 0;">${post.area}, ${post.district} • ৳${post.budget}</p>
                <span class="status" style="background: #c6f6d5; color: #22543d; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${post.status}</span>
            </div>
        `).join('');
    }

    loadUserApplications() {
        const applicationsList = document.getElementById('applicationsList');
        if (!applicationsList) return;

        const userApps = this.applications
            .filter(app => app.worker_id === this.currentUser.id)
            .slice(0, 5);

        if (userApps.length === 0) {
            applicationsList.innerHTML = '<p>No applications yet.</p>';
            return;
        }

        applicationsList.innerHTML = userApps.map(app => {
            const workPost = this.workPosts.find(post => post.id === app.work_id);
            return `
                <div class="application-item" style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                    <h4>${workPost?.title || 'Unknown Work'}</h4>
                    <p style="color: #718096; margin: 0.5rem 0;">Applied: ${new Date(app.applied_at).toLocaleDateString()}</p>
                    <span class="status" style="background: #fed7d7; color: #742a2a; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${app.status}</span>
                </div>
            `;
        }).join('');
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
        }
    }

    initializeSearchPage() {
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        const divisionInput = document.getElementById('searchDivision');
        const districtInput = document.getElementById('searchDistrict');
        const areaInput = document.getElementById('searchArea');
        
        if (divisionInput && this.currentUser?.division) {
            divisionInput.value = this.currentUser.division;
        }
        if (districtInput && this.currentUser?.district) {
            districtInput.value = this.currentUser.district;
        }
        if (areaInput && this.currentUser?.area) {
            areaInput.value = this.currentUser.area;
        }

        this.displayWorkPosts(this.workPosts.filter(post => post.status === 'open'));
        this.initializeApplicationModal();
    }

    performSearch() {
        const keyword = document.getElementById('searchKeyword')?.value.toLowerCase() || '';
        const category = document.getElementById('searchCategory')?.value || '';
        const division = document.getElementById('searchDivision')?.value || '';
        const district = document.getElementById('searchDistrict')?.value.toLowerCase() || '';
        const area = document.getElementById('searchArea')?.value.toLowerCase() || '';

        let filteredPosts = this.workPosts.filter(post => post.status === 'open');

        if (keyword) {
            filteredPosts = filteredPosts.filter(post => 
                post.title.toLowerCase().includes(keyword) ||
                post.description.toLowerCase().includes(keyword)
            );
        }

        if (category) {
            filteredPosts = filteredPosts.filter(post => post.category === category);
        }

        if (division) {
            filteredPosts = filteredPosts.filter(post => post.division === division);
        }

        if (district) {
            filteredPosts = filteredPosts.filter(post => 
                post.district.toLowerCase().includes(district)
            );
        }

        if (area) {
            filteredPosts = filteredPosts.filter(post => 
                post.area.toLowerCase().includes(area)
            );
        }

        this.displayWorkPosts(filteredPosts);
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

        const existingApplication = this.applications.find(app => 
            app.work_id === workId && app.worker_id === this.currentUser.id
        );

        if (existingApplication) {
            this.showNotification('You have already applied for this work', 'error');
            return;
        }

        const newApplication = {
            id: Date.now(),
            work_id: workId,
            worker_id: this.currentUser.id,
            worker_name: this.currentUser.full_name,
            proposal: proposal,
            bid_amount: bidAmount || null,
            status: 'pending',
            applied_at: new Date().toISOString()
        };

        this.applications.push(newApplication);
        localStorage.setItem('applications', JSON.stringify(this.applications));

        this.showNotification('Application submitted successfully!', 'success');
        this.closeApplicationModal();
        
        if (window.location.pathname.includes('dashboard.html')) {
            this.loadUserApplications();
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
        const work = this.workPosts.find(post => post.id === workId);
        if (work) {
            alert(`
Work Details:
-------------
Title: ${work.title}
Category: ${work.category}
Budget: ৳${work.budget}
Location: ${work.area}, ${work.district}, ${work.division} - ${work.post_code}
Duration: ${work.duration || 'Flexible'}
Urgency: ${work.urgency}

Description:
${work.description}
            `);
        }
    }

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

    handlePostWork(e) {
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

        const newWork = {
            id: Date.now(),
            employer_id: this.currentUser.id,
            employer_name: this.currentUser.full_name,
            ...data,
            status: 'open',
            created_at: new Date().toISOString()
        };

        this.workPosts.unshift(newWork);
        localStorage.setItem('workPosts', JSON.stringify(this.workPosts));

        this.showNotification('Work posted successfully!', 'success');
        e.target.reset();
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

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

        const completedJobs = this.applications.filter(app => 
            app.worker_id === this.currentUser.id && app.status === 'completed'
        ).length;

        const memberSince = this.currentUser.created_at ? 
            new Date(this.currentUser.created_at).toLocaleDateString() : 'Recently';

        const completedJobsElement = document.getElementById('completedJobs');
        const memberSinceElement = document.getElementById('memberSince');
        const successRateElement = document.getElementById('successRate');

        if (completedJobsElement) completedJobsElement.textContent = completedJobs;
        if (memberSinceElement) memberSinceElement.textContent = memberSince;
        if (successRateElement) successRateElement.textContent = completedJobs > 0 ? '100%' : '0%';
    }

    handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updates = Object.fromEntries(formData);

        this.currentUser = { ...this.currentUser, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        this.showNotification('Profile updated successfully!', 'success');
        this.updateNavigation();
    }

    initializeMessagesPage() {
        this.loadConversations();
        this.setupChatEventListeners();
        this.loadQuickContacts();
    }

    loadConversations() {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        const conversations = {};
        
        this.messages.forEach(message => {
            const otherUserId = message.from_user_id === this.currentUser.id ? 
                message.to_user_id : message.from_user_id;
            const otherUserName = message.from_user_id === this.currentUser.id ? 
                message.to_user_name : message.from_user_name;
            const conversationId = [this.currentUser.id, otherUserId].sort().join('_');
            
            if (!conversations[conversationId]) {
                conversations[conversationId] = {
                    id: conversationId,
                    other_user_id: otherUserId,
                    other_user_name: otherUserName,
                    last_message: message.message,
                    last_message_time: message.sent_at,
                    unread: message.to_user_id === this.currentUser.id && !message.is_read
                };
            }
        });

        this.displayConversations(Object.values(conversations));
    }

    displayConversations(conversations) {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        if (conversations.length === 0) {
            conversationsList.innerHTML = '<p>No conversations yet. Start by applying for work!</p>';
            return;
        }

        conversationsList.innerHTML = conversations.map(conv => `
            <div class="conversation-item" onclick="app.openConversation(${conv.other_user_id}, '${conv.other_user_name}')">
                <div class="avatar">${conv.other_user_name.charAt(0).toUpperCase()}</div>
                <div class="conversation-info">
                    <h4>${conv.other_user_name}</h4>
                    <p>${conv.last_message.substring(0, 50)}${conv.last_message.length > 50 ? '...' : ''}</p>
                </div>
                <div class="conversation-meta">
                    <span>${new Date(conv.last_message_time).toLocaleDateString()}</span>
                    ${conv.unread ? '<span class="unread-badge"></span>' : ''}
                </div>
            </div>
        `).join('');
    }

    openConversation(otherUserId, otherUserName) {
        this.currentConversation = otherUserId;
        
        document.getElementById('chatUserName').textContent = otherUserName;
        document.getElementById('chatUserAvatar').textContent = otherUserName.charAt(0).toUpperCase();
        document.getElementById('chatUserStatus').textContent = 'Online';
        
        document.getElementById('messageInputArea').style.display = 'block';
        
        this.loadMessages(otherUserId);
    }

    loadMessages(otherUserId) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const conversationMessages = this.messages.filter(msg => 
            (msg.from_user_id === this.currentUser.id && msg.to_user_id === otherUserId) ||
            (msg.from_user_id === otherUserId && msg.to_user_id === this.currentUser.id)
        ).sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));

        if (conversationMessages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="no-messages">
                    <p>No messages yet. Start a conversation!</p>
                </div>
            `;
            return;
        }

        messagesContainer.innerHTML = conversationMessages.map(msg => `
            <div class="message ${msg.from_user_id === this.currentUser.id ? 'sent' : 'received'}">
                <div class="message-content">
                    <p>${msg.message}</p>
                    <span class="message-time">${new Date(msg.sent_at).toLocaleTimeString()}</span>
                </div>
            </div>
        `).join('');

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.markMessagesAsRead(otherUserId);
    }

    setupChatEventListeners() {
        const sendBtn = document.getElementById('sendMessageBtn');
        const messageInput = document.getElementById('messageText');

        if (sendBtn && messageInput) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        const searchInput = document.getElementById('searchConversations');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchConversations(e.target.value);
            });
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('messageText');
        const message = messageInput.value.trim();

        if (!message || !this.currentConversation) {
            return;
        }

        const otherUserName = document.getElementById('chatUserName').textContent;

        const newMessage = {
            id: Date.now(),
            conversation_id: [this.currentUser.id, this.currentConversation].sort().join('_'),
            from_user_id: this.currentUser.id,
            from_user_name: this.currentUser.full_name,
            to_user_id: this.currentConversation,
            to_user_name: otherUserName,
            message: message,
            is_read: false,
            sent_at: new Date().toISOString()
        };

        this.messages.push(newMessage);
        localStorage.setItem('messages', JSON.stringify(this.messages));

        messageInput.value = '';
        this.loadMessages(this.currentConversation);
        this.loadConversations();
    }

    markMessagesAsRead(otherUserId) {
        this.messages.forEach(msg => {
            if (msg.from_user_id === otherUserId && msg.to_user_id === this.currentUser.id) {
                msg.is_read = true;
            }
        });
        localStorage.setItem('messages', JSON.stringify(this.messages));
        this.loadConversations();
    }

    searchConversations(query) {
        const allConversations = this.messages.reduce((acc, msg) => {
            const otherUserId = msg.from_user_id === this.currentUser.id ? 
                msg.to_user_id : msg.from_user_id;
            const otherUserName = msg.from_user_id === this.currentUser.id ? 
                msg.to_user_name : msg.from_user_name;
            const conversationId = [this.currentUser.id, otherUserId].sort().join('_');
            
            if (!acc[conversationId]) {
                acc[conversationId] = {
                    id: conversationId,
                    other_user_id: otherUserId,
                    other_user_name: otherUserName,
                    last_message: msg.message,
                    last_message_time: msg.sent_at,
                    unread: msg.to_user_id === this.currentUser.id && !message.is_read
                };
            }
            return acc;
        }, {});

        const filteredConversations = Object.values(allConversations).filter(conv =>
            conv.other_user_name.toLowerCase().includes(query.toLowerCase()) ||
            conv.last_message.toLowerCase().includes(query.toLowerCase())
        );

        this.displayConversations(filteredConversations);
    }

    // New Messaging Features
    showNewConversationModal() {
        document.getElementById('newConversationModal').style.display = 'flex';
        this.loadRecentContacts();
        this.loadQuickContacts();
    }

    closeNewConversationModal() {
        document.getElementById('newConversationModal').style.display = 'none';
    }

    loadQuickContacts() {
        const quickContacts = document.getElementById('quickContacts');
        if (!quickContacts) return;

        const allUsers = [];
        
        if (this.currentUser.user_type === 'employer') {
            const employerWorkIds = this.workPosts
                .filter(post => post.employer_id === this.currentUser.id)
                .map(post => post.id);
                
            const applicants = this.applications
                .filter(app => employerWorkIds.includes(app.work_id))
                .map(app => ({
                    id: app.worker_id,
                    name: app.worker_name,
                    type: 'applicant'
                }));
            
            allUsers.push(...applicants);
        }
        
        if (this.currentUser.user_type === 'worker') {
            const appliedWorkIds = this.applications
                .filter(app => app.worker_id === this.currentUser.id)
                .map(app => app.work_id);
                
            const employers = this.workPosts
                .filter(post => appliedWorkIds.includes(post.id))
                .map(post => ({
                    id: post.employer_id,
                    name: post.employer_name,
                    type: 'employer'
                }));
            
            allUsers.push(...employers);
        }

        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );

        if (uniqueUsers.length === 0) {
            quickContacts.innerHTML = '<p>Apply for work or post jobs to start conversations</p>';
            return;
        }

        quickContacts.innerHTML = uniqueUsers.map(user => `
            <div class="quick-contact" onclick="app.startConversation(${user.id}, '${user.name}')">
                <div class="avatar">${user.name.charAt(0).toUpperCase()}</div>
                <span>${user.name}</span>
                <small>${user.type}</small>
            </div>
        `).join('');
    }

    loadRecentContacts() {
        const recentContactsList = document.getElementById('recentContactsList');
        if (!recentContactsList) return;

        const contactIds = new Set();
        const recentContacts = [];

        this.messages.forEach(message => {
            const otherUserId = message.from_user_id === this.currentUser.id ? 
                message.to_user_id : message.from_user_id;
            const otherUserName = message.from_user_id === this.currentUser.id ? 
                message.to_user_name : message.from_user_name;
            
            if (!contactIds.has(otherUserId)) {
                contactIds.add(otherUserId);
                recentContacts.push({
                    id: otherUserId,
                    name: otherUserName
                });
            }
        });

        if (recentContacts.length === 0) {
            recentContactsList.innerHTML = '<p>No recent contacts</p>';
            return;
        }

        recentContactsList.innerHTML = recentContacts.map(contact => `
            <div class="contact-item" onclick="app.startConversation(${contact.id}, '${contact.name}')">
                <div class="avatar">${contact.name.charAt(0).toUpperCase()}</div>
                <span>${contact.name}</span>
            </div>
        `).join('');
    }

    searchUsers(query) {
        const searchResults = document.getElementById('userSearchResults');
        if (!searchResults) return;

        if (query.length < 2) {
            searchResults.innerHTML = '<p>Type at least 2 characters to search</p>';
            return;
        }

        const allUsers = new Set();
        
        this.workPosts.forEach(post => {
            allUsers.add(JSON.stringify({
                id: post.employer_id,
                name: post.employer_name,
                type: 'employer'
            }));
        });
        
        this.applications.forEach(app => {
            allUsers.add(JSON.stringify({
                id: app.worker_id,
                name: app.worker_name,
                type: 'worker'
            }));
        });
        
        this.messages.forEach(message => {
            allUsers.add(JSON.stringify({
                id: message.from_user_id,
                name: message.from_user_name,
                type: 'user'
            }));
            allUsers.add(JSON.stringify({
                id: message.to_user_id,
                name: message.to_user_name,
                type: 'user'
            }));
        });

        const usersArray = Array.from(allUsers).map(str => JSON.parse(str));
        
        const filteredUsers = usersArray.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) &&
            user.id !== this.currentUser.id
        );

        const uniqueUsers = filteredUsers.filter((user, index, self) =>
            index === self.findIndex(u => u.id === user.id)
        );

        if (uniqueUsers.length === 0) {
            searchResults.innerHTML = '<p>No users found</p>';
            return;
        }

        searchResults.innerHTML = uniqueUsers.map(user => `
            <div class="search-result-item" onclick="app.startConversation(${user.id}, '${user.name}')">
                <div class="avatar">${user.name.charAt(0).toUpperCase()}</div>
                <div>
                    <strong>${user.name}</strong>
                    <small>${user.type}</small>
                </div>
            </div>
        `).join('');
    }

    startConversation(otherUserId, otherUserName) {
        this.closeNewConversationModal();
        this.openConversation(otherUserId, otherUserName);
        
        const existingMessages = this.messages.filter(msg =>
            (msg.from_user_id === this.currentUser.id && msg.to_user_id === otherUserId) ||
            (msg.from_user_id === otherUserId && msg.to_user_id === this.currentUser.id)
        );

        if (existingMessages.length === 0) {
            setTimeout(() => {
                const greetingMessage = this.currentUser.user_type === 'worker' 
                    ? "Hello! I'm interested in discussing the work opportunity."
                    : "Hello! Thanks for your interest in my work post.";
                
                const autoMessage = {
                    id: Date.now(),
                    conversation_id: [this.currentUser.id, otherUserId].sort().join('_'),
                    from_user_id: this.currentUser.id,
                    from_user_name: this.currentUser.full_name,
                    to_user_id: otherUserId,
                    to_user_name: otherUserName,
                    message: greetingMessage,
                    is_read: false,
                    sent_at: new Date().toISOString()
                };

                this.messages.push(autoMessage);
                localStorage.setItem('messages', JSON.stringify(this.messages));
                this.loadMessages(otherUserId);
                this.loadConversations();
            }, 500);
        }
    }

    loadUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('Location access granted');
                },
                (error) => {
                    console.log('Location access denied or unavailable');
                }
            );
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