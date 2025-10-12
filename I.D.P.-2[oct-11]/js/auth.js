// Authentication functionality

document.addEventListener('DOMContentLoaded', function() {
    initAuthModal();
    initAuthForms();
});

function initAuthModal() {
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const closeModal = document.querySelector('.close-modal');
    const switchToSignup = document.querySelector('.switch-to-signup');
    const switchToLogin = document.querySelector('.switch-to-login');
    
    // Open modal
    if (loginBtn) {
        loginBtn.addEventListener('click', () => openAuthModal('login'));
    }
    if (signupBtn) {
        signupBtn.addEventListener('click', () => openAuthModal('signup'));
    }
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', closeAuthModal);
    }
    
    // Switch between login and signup
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthTab('signup');
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthTab('login');
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });
}

function openAuthModal(tab = 'login') {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.add('active');
        switchAuthTab(tab);
    }
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.remove('active');
    }
}

function switchAuthTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tab}Tab`) {
            content.classList.add('active');
        }
    });
}

function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

function handleLogin(e) {
    e.preventDefault();
    const mobileNumber = e.target.querySelector('input[type="tel"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    // Simulate API call
    simulateAuthRequest('login', { mobileNumber, password })
        .then(user => {
            showNotification('Login successful!', 'success');
            closeAuthModal();
            updateUIForLoggedInUser(user);
            e.target.reset();
        })
        .catch(error => {
            showNotification(error.message, 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

function handleSignup(e) {
    e.preventDefault();
    const userData = {
        fullName: e.target.querySelector('input[type="text"]').value,
        mobileNumber: e.target.querySelector('input[type="tel"]').value,
        accountType: e.target.querySelector('select').value,
        password: e.target.querySelector('input[type="password"]').value
    };
    
    // Validate mobile number
    if (!isValidMobileNumber(userData.mobileNumber)) {
        showNotification('Please enter a valid mobile number', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    // Simulate API call
    simulateAuthRequest('signup', userData)
        .then(user => {
            showNotification('Account created successfully!', 'success');
            closeAuthModal();
            updateUIForLoggedInUser(user);
            e.target.reset();
        })
        .catch(error => {
            showNotification(error.message, 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

function isValidMobileNumber(number) {
    // Simple mobile number validation
    const mobileRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return mobileRegex.test(number.replace(/\D/g, ''));
}

function simulateAuthRequest(type, data) {
    return new Promise((resolve, reject) => {
        // Simulate API delay
        setTimeout(() => {
            if (type === 'login') {
                // Mock login validation
                if (data.password.length < 6) {
                    reject(new Error('Invalid credentials'));
                } else {
                    resolve({
                        id: 1,
                        fullName: 'Demo User',
                        mobileNumber: data.mobileNumber,
                        accountType: 'job-seeker',
                        isVerified: true
                    });
                }
            } else if (type === 'signup') {
                // Mock signup validation
                if (data.mobileNumber === '1234567890') {
                    reject(new Error('Mobile number already registered'));
                } else if (data.password.length < 6) {
                    reject(new Error('Password must be at least 6 characters'));
                } else {
                    resolve({
                        id: Math.floor(Math.random() * 1000),
                        fullName: data.fullName,
                        mobileNumber: data.mobileNumber,
                        accountType: data.accountType,
                        isVerified: false
                    });
                }
            }
        }, 1500);
    });
}

function updateUIForLoggedInUser(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    authButtons.innerHTML = `
        <div class="user-menu">
            <button class="btn btn-outline" id="userProfileBtn">
                <i class="fas fa-user"></i> ${user.fullName}
            </button>
            <button class="btn btn-outline" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Update navigation based on user type
    if (user.accountType === 'employer') {
        updateNavigationForEmployer();
    }
}

function handleLogout() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    authButtons.innerHTML = `
        <button class="btn btn-outline" id="loginBtn">Log In</button>
        <button class="btn btn-primary" id="signupBtn">Sign Up</button>
    `;
    
    // Re-initialize auth buttons
    initAuthModal();
    showNotification('Logged out successfully', 'success');
}

function updateNavigationForEmployer() {
    const nav = document.querySelector('nav ul');
    if (!nav) return;
    
    const postJobLink = nav.querySelector('a[href="#"]:nth-child(3)');
    if (postJobLink) {
        postJobLink.innerHTML = '<i class="fas fa-plus"></i> Post Job';
    }
}

// Export functions for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAuthModal,
        openAuthModal,
        closeAuthModal,
        switchAuthTab,
        handleLogin,
        handleSignup,
        isValidMobileNumber,
        updateUIForLoggedInUser,
        handleLogout
    };
}