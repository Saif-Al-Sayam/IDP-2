// auth.js - Simple authentication check
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!user && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Run auth check on dashboard pages
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', checkAuth);
}