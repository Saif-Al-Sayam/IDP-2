// Main JavaScript file for general functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initSmoothScrolling();
    initPopularSearches();
    loadTestimonials();
});

// Navigation functionality
function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Popular searches functionality
function initPopularSearches() {
    const popularSearches = document.querySelectorAll('.popular-searches span');
    
    popularSearches.forEach(search => {
        search.addEventListener('click', function() {
            const searchText = this.textContent;
            document.getElementById('jobSearch').value = searchText;
            document.getElementById('searchBtn').click();
        });
    });
}

// Load testimonials dynamically
function loadTestimonials() {
    const testimonials = [
        {
            content: "I found three different part-time jobs through this platform that fit perfectly with my college schedule. The location-based search made it so easy to find opportunities near my campus.",
            author: "Sarah Johnson",
            role: "Student & Part-time Worker",
            rating: 5,
            avatar: "SJ"
        },
        {
            content: "As a small business owner, I needed reliable part-time staff without the hassle of traditional hiring. This platform connected me with great local candidates quickly.",
            author: "Michael Roberts",
            role: "Cafe Owner",
            rating: 4.5,
            avatar: "MR"
        },
        {
            content: "The rating system gives me confidence in the employers I work with. I've built a solid reputation through positive reviews, which helps me get better opportunities.",
            author: "Alex Davis",
            role: "Freelance Tutor",
            rating: 5,
            avatar: "AD"
        }
    ];
    
    const testimonialsContainer = document.getElementById('testimonialsContainer');
    
    testimonials.forEach(testimonial => {
        const testimonialCard = document.createElement('div');
        testimonialCard.className = 'testimonial-card';
        
        testimonialCard.innerHTML = `
            <div class="testimonial-content">
                "${testimonial.content}"
            </div>
            <div class="testimonial-author">
                <div class="author-avatar">${testimonial.avatar}</div>
                <div class="author-info">
                    <h4>${testimonial.author}</h4>
                    <p>${testimonial.role}</p>
                    <div class="rating">
                        ${generateStarRating(testimonial.rating)}
                        <span>${testimonial.rating} (${Math.floor(Math.random() * 50) + 10})</span>
                    </div>
                </div>
            </div>
        `;
        
        testimonialsContainer.appendChild(testimonialCard);
    });
}

// Generate star rating HTML
function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 4px;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initMobileMenu();
});

function initNavigation() {
    // Highlight current page in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || 
            (currentPage === 'index.html' && linkPage === 'index.html') ||
            (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Notification system (if not already in auth.js)
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = 'notification ' + type;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}