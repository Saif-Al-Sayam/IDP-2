class AuthSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.init();
    }

    init() {
        this.initAuthTabs();
        this.initForms();
        this.checkAuthState();
    }

    initAuthTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
    }

    initForms() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
    }

    switchTab(tab) {
        // Update tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
        });
        
        // Update forms
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
            const response = await fetch('php/auth.php', {
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
            const response = await fetch('php/auth.php', {
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

    checkAuthState() {
        if (this.currentUser && window.location.pathname.includes('index.html')) {
            window.location.href = 'dashboard.html';
        }
        
        if (!this.currentUser && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
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
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});