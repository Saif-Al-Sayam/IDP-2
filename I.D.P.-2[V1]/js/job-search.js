// Job search and filtering functionality

document.addEventListener('DOMContentLoaded', function() {
    initJobSearch();
    initJobFilters();
    loadJobs();
});

function initJobSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const jobSearchInput = document.getElementById('jobSearch');
    const locationSearchInput = document.getElementById('locationSearch');
    
    searchBtn.addEventListener('click', performSearch);
    
    // Allow Enter key to trigger search
    jobSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    locationSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

function performSearch() {
    const jobQuery = document.getElementById('jobSearch').value;
    const locationQuery = document.getElementById('locationSearch').value;
    
    if (!jobQuery && !locationQuery) {
        showNotification('Please enter a job title or location to search', 'error');
        return;
    }
    
    showNotification(`Searching for "${jobQuery}" jobs in "${locationQuery}"`);
    
    // Simulate search with loading state
    const jobsContainer = document.getElementById('jobsContainer');
    jobsContainer.innerHTML = '<div class="loading">Searching jobs...</div>';
    
    setTimeout(() => {
        filterJobs(jobQuery, locationQuery);
    }, 1000);
}

function initJobFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const salaryFilter = document.getElementById('salaryFilter');
    
    categoryFilter.addEventListener('change', applyFilters);
    locationFilter.addEventListener('change', applyFilters);
    salaryFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const location = document.getElementById('locationFilter').value;
    const salary = document.getElementById('salaryFilter').value;
    
    filterJobs('', '', { category, location, salary });
}

function loadJobs() {
    const jobs = [
        {
            id: 1,
            title: "Retail Sales Associate",
            type: "Part-time",
            company: "Fashion Store",
            logo: "FS",
            location: "Downtown",
            hours: "20-25 hrs/week",
            salary: "$15-$18/hr",
            description: "Looking for a friendly and motivated sales associate for our downtown location. Weekend availability required.",
            category: "Retail",
            rating: 4.5,
            reviewCount: 28,
            posted: "2 hours ago"
        },
        {
            id: 2,
            title: "Food Delivery Driver",
            type: "Part-time",
            company: "FastDelivery",
            logo: "FD",
            location: "Citywide",
            hours: "Flexible hours",
            salary: "$12-$25/hr",
            description: "Become a delivery driver with our app. Set your own schedule and earn competitive pay plus tips.",
            category: "Delivery",
            rating: 4.0,
            reviewCount: 42,
            posted: "5 hours ago"
        },
        {
            id: 3,
            title: "Math Tutor",
            type: "Part-time",
            company: "Learning Center",
            logo: "LC",
            location: "Westside",
            hours: "10-15 hrs/week",
            salary: "$20-$30/hr",
            description: "Seeking qualified math tutors for high school students. Evenings and weekends available.",
            category: "Tutoring",
            rating: 5.0,
            reviewCount: 15,
            posted: "1 day ago"
        },
        {
            id: 4,
            title: "Barista",
            type: "Part-time",
            company: "Coffee Corner",
            logo: "CC",
            location: "Midtown",
            hours: "15-20 hrs/week",
            salary: "$14-$16/hr",
            description: "Join our team as a barista. No experience required - we provide full training.",
            category: "Food Service",
            rating: 4.2,
            reviewCount: 36,
            posted: "3 hours ago"
        },
        {
            id: 5,
            title: "Customer Service Representative",
            type: "Part-time",
            company: "Support Solutions",
            logo: "SS",
            location: "Remote",
            hours: "25-30 hrs/week",
            salary: "$16-$20/hr",
            description: "Work from home customer service role. Must have reliable internet and quiet workspace.",
            category: "Customer Service",
            rating: 4.3,
            reviewCount: 52,
            posted: "6 hours ago"
        },
        {
            id: 6,
            title: "Warehouse Associate",
            type: "Part-time",
            company: "QuickShip",
            logo: "QS",
            location: "Industrial Park",
            hours: "20-25 hrs/week",
            salary: "$15-$17/hr",
            description: "Help with order fulfillment in our warehouse. Evening shifts available.",
            category: "Logistics",
            rating: 3.8,
            reviewCount: 24,
            posted: "1 day ago"
        }
    ];
    
    // Store jobs in localStorage for persistence
    localStorage.setItem('jobs', JSON.stringify(jobs));
    displayJobs(jobs);
}

function displayJobs(jobs) {
    const jobsContainer = document.getElementById('jobsContainer');
    
    if (jobs.length === 0) {
        jobsContainer.innerHTML = `
            <div class="no-jobs">
                <i class="fas fa-search"></i>
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria or filters</p>
            </div>
        `;
        return;
    }
    
    jobsContainer.innerHTML = jobs.map(job => `
        <div class="job-card" data-job-id="${job.id}">
            <div class="job-header">
                <h3 class="job-title">${job.title}</h3>
                <span class="job-type">${job.type}</span>
            </div>
            
            <div class="job-company">
                <div class="company-logo">${job.logo}</div>
                <div>
                    <h4>${job.company}</h4>
                    <div class="rating">
                        ${generateStarRating(job.rating)}
                        <span>${job.rating} (${job.reviewCount})</span>
                    </div>
                </div>
            </div>
            
            <div class="job-details">
                <div><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
                <div><i class="far fa-clock"></i> ${job.hours}</div>
            </div>
            
            <p>${job.description}</p>
            
            <div class="job-footer">
                <div class="job-salary">${job.salary}</div>
                <div class="job-actions">
                    <button class="btn btn-primary apply-btn" data-job-id="${job.id}">Apply Now</button>
                    <button class="btn btn-outline save-btn" data-job-id="${job.id}">
                        <i class="far fa-bookmark"></i>
                    </button>
                </div>
            </div>
            
            <div class="job-meta">
                <small>Posted ${job.posted}</small>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to job actions
    initJobActions();
}

function filterJobs(jobQuery = '', locationQuery = '', filters = {}) {
    const allJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    let filteredJobs = allJobs;
    
    // Filter by search query
    if (jobQuery) {
        filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(jobQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(jobQuery.toLowerCase())
        );
    }
    
    // Filter by location query
    if (locationQuery) {
        filteredJobs = filteredJobs.filter(job => 
            job.location.toLowerCase().includes(locationQuery.toLowerCase())
        );
    }
    
    // Apply additional filters
    if (filters.category && filters.category !== 'All Categories') {
        filteredJobs = filteredJobs.filter(job => job.category === filters.category);
    }
    
    if (filters.location && filters.location !== 'Any Location') {
        // Simulate distance filtering
        filteredJobs = filteredJobs.filter(job => 
            job.location.toLowerCase().includes('downtown') || 
            job.location.toLowerCase().includes('midtown') ||
            job.location.toLowerCase().includes('westside')
        );
    }
    
    if (filters.salary && filters.salary !== 'Any Pay Range') {
        filteredJobs = filteredJobs.filter(job => {
            const salaryRange = filters.salary;
            if (salaryRange === '$10-$15/hr') {
                return job.salary.includes('$12') || job.salary.includes('$14') || job.salary.includes('$15');
            } else if (salaryRange === '$15-$20/hr') {
                return job.salary.includes('$16') || job.salary.includes('$18') || job.salary.includes('$20');
            } else if (salaryRange === '$20+/hr') {
                return job.salary.includes('$20') || job.salary.includes('$25') || job.salary.includes('$30');
            }
            return true;
        });
    }
    
    displayJobs(filteredJobs);
}

function initJobActions() {
    // Apply button functionality
    document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            applyForJob(jobId);
        });
    });
    
    // Save job functionality
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            toggleSaveJob(jobId, this);
        });
    });
}

function applyForJob(jobId) {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobs.find(j => j.id == jobId);
    
    if (!job) {
        showNotification('Job not found', 'error');
        return;
    }
    
    // Check if user is logged in (simplified check)
    const isLoggedIn = document.querySelector('.user-menu');
    
    if (!isLoggedIn) {
        showNotification('Please log in to apply for jobs', 'error');
        openAuthModal('login');
        return;
    }
    
    // Simulate application process
    showNotification(`Applying for ${job.title} at ${job.company}...`);
    
    setTimeout(() => {
        showNotification(`Application submitted for ${job.title}!`, 'success');
        
        // Track applied jobs in localStorage
        const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
        if (!appliedJobs.includes(jobId)) {
            appliedJobs.push(jobId);
            localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        }
    }, 2000);
}

function toggleSaveJob(jobId, button) {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
    const icon = button.querySelector('i');
    
    if (savedJobs.includes(jobId)) {
        // Unsaved job
        const index = savedJobs.indexOf(jobId);
        savedJobs.splice(index, 1);
        icon.className = 'far fa-bookmark';
        showNotification('Job removed from saved jobs');
    } else {
        // Save job
        savedJobs.push(jobId);
        icon.className = 'fas fa-bookmark';
        showNotification('Job saved successfully!');
    }
    
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
}

// View All Jobs button
document.getElementById('viewAllJobs').addEventListener('click', function() {
    const allJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    displayJobs(allJobs);
    showNotification('Showing all available jobs');
});
