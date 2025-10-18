// Main application functionality with database integration
class JobPortalApp {
    constructor() {
        this.api = api;
        this.init();
    }

    init() {
        this.initNavigation();
        this.initAuth();
        this.initNotifications();
        this.loadUserState();
    }

    initNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        this.highlightCurrentPage();
    }

    highlightCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }

    initAuth() {
        this.initAuthModal();
        this.initAuthForms();
    }

    initAuthModal() {
        const authModal = document.getElementById('authModal');
        if (!authModal) return;

        document.addEventListener('click', (e) => {
            if (e.target.id === 'loginBtn' || e.target.closest('#loginBtn')) {
                this.openAuthModal('login');
            } else if (e.target.id === 'signupBtn' || e.target.closest('#signupBtn')) {
                this.openAuthModal('signup');
            } else if (e.target === authModal || e.target.classList.contains('close-modal')) {
                this.closeAuthModal();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('switch-to-signup')) {
                e.preventDefault();
                this.switchAuthTab('signup');
            } else if (e.target.classList.contains('switch-to-login')) {
                e.preventDefault();
                this.switchAuthTab('login');
            }
        });
    }

    openAuthModal(tab = 'login') {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.add('active');
            this.switchAuthTab(tab);
        }
    }

    closeAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.remove('active');
        }
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}Tab`);
        });
    }

    initAuthForms() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        await this.submitAuthForm('login', data, e.target);
    }

    async handleSignup(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (data.password !== data.confirm_password) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (data.password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        await this.submitAuthForm('signup', data, e.target);
    }

    async submitAuthForm(type, data, form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        try {
            const result = type === 'login' 
                ? await this.api.login(data.email, data.password)
                : await this.api.signup(data);

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.closeAuthModal();
                this.updateUIForLoggedInUser(result.data);
                form.reset();
                
                // Redirect based on account type
                setTimeout(() => {
                    if (result.data.account_type === 'employer') {
                        window.location.href = 'employer-dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 1000);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Network error occurred', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    initNotifications() {
        // Notification system is ready to use
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    // User management
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    removeCurrentUser() {
        localStorage.removeItem('currentUser');
    }

    updateUIForLoggedInUser(user) {
        this.setCurrentUser(user);
        const authSection = document.getElementById('authSection') || document.querySelector('.auth-buttons');
        if (!authSection) return;
        
        authSection.innerHTML = `
            <div class="user-menu">
                <span class="user-welcome">Welcome, ${user.full_name}</span>
                <button class="btn btn-outline" onclick="app.viewDashboard()">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </button>
                <button class="btn btn-outline" onclick="app.handleLogout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
    }

    async handleLogout() {
        try {
            await this.api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        this.removeCurrentUser();
        const authSection = document.getElementById('authSection') || document.querySelector('.auth-buttons');
        
        if (authSection) {
            authSection.innerHTML = `
                <button class="btn btn-outline" id="loginBtn">Log In</button>
                <button class="btn btn-primary" id="signupBtn">Sign Up</button>
            `;
        }
        
        this.showNotification('Logged out successfully', 'success');
        this.initAuthModal();
        
        // Redirect to home if not already there
        if (!window.location.pathname.includes('index.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    viewDashboard() {
        const user = this.getCurrentUser();
        if (user) {
            if (user.account_type === 'employer') {
                window.location.href = 'employer-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    }

    loadUserState() {
        const user = this.getCurrentUser();
        if (user) {
            this.updateUIForLoggedInUser(user);
        }
    }
}

// Initialize app
const app = new JobPortalApp();

// Utility Functions
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced job search with debouncing
function initEnhancedJobSearch() {
    const searchInput = document.getElementById('jobSearch');
    if (searchInput) {
        const debouncedSearch = debounce(performSearch, 500);
        searchInput.addEventListener('input', debouncedSearch);
    }
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    initEnhancedJobSearch();
});