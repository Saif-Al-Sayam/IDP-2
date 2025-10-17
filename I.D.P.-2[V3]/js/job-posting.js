// Job posting functionality
document.addEventListener('DOMContentLoaded', function() {
    const postJobForm = document.getElementById('postJobForm');
    
    if (postJobForm) {
        postJobForm.addEventListener('submit', handleJobPosting);
    }
});

function handleJobPosting(e) {
    e.preventDefault();
    
    const user = getCurrentUser();
    if (!user || user.accountType !== 'employer') {
        showNotification('Please log in as an employer to post jobs', 'error');
        openAuthModal('login');
        return;
    }
    
    const formData = {
        title: document.getElementById('jobTitle').value,
        company: document.getElementById('company').value,
        type: document.getElementById('jobType').value,
        location: document.getElementById('location').value,
        salary: document.getElementById('salary').value,
        experience: document.getElementById('experience').value,
        description: document.getElementById('description').value,
        requirements: document.getElementById('requirements').value,
        benefits: document.getElementById('benefits').value
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting Job...';
    submitBtn.disabled = true;
    
    // Simulate API call
    simulateJobPosting(formData)
        .then(job => {
            showNotification('Job posted successfully!', 'success');
            e.target.reset();
            setTimeout(() => {
                window.location.href = 'employer-dashboard.html';
            }, 1500);
        })
        .catch(error => {
            showNotification(error.message, 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

function simulateJobPosting(jobData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!jobData.title || !jobData.company) {
                reject(new Error('Please fill in all required fields'));
            } else {
                resolve({
                    id: Math.floor(Math.random() * 1000),
                    ...jobData,
                    postedAt: new Date().toISOString()
                });
            }
        }, 2000);
    });
}