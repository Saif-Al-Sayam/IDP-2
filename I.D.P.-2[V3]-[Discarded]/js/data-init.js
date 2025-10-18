// Sample data initialization
function initializeSampleData() {
    // Only initialize if no data exists
    if (!localStorage.getItem('jobs')) {
        const sampleJobs = [
            {
                id: 1,
                title: "Frontend Developer",
                type: "Full-time",
                company: "TechCorp",
                logo: "TC",
                location: "San Francisco, CA",
                hours: "40 hrs/week",
                salary: "$80,000 - $120,000",
                description: "We are looking for a skilled Frontend Developer to join our dynamic team. You will be responsible for building responsive web applications using modern JavaScript frameworks.",
                category: "Technology",
                rating: 4.5,
                reviewCount: 34,
                posted: "2024-01-15",
                requirements: "3+ years of experience with React, JavaScript, HTML/CSS",
                benefits: "Health insurance, remote work options, professional development"
            },
            {
                id: 2,
                title: "Marketing Manager",
                type: "Full-time",
                company: "GrowthLabs",
                logo: "GL",
                location: "New York, NY",
                hours: "40 hrs/week",
                salary: "$70,000 - $90,000",
                description: "Seeking an experienced Marketing Manager to lead our marketing initiatives and drive brand awareness.",
                category: "Marketing",
                rating: 4.2,
                reviewCount: 28,
                posted: "2024-01-14",
                requirements: "5+ years marketing experience, SEO/SEM knowledge",
                benefits: "Flexible schedule, bonus structure, team events"
            }
        ];
        
        localStorage.setItem('jobs', JSON.stringify(sampleJobs));
    }
    
    // Initialize other sample data as needed
    if (!localStorage.getItem('applications')) {
        localStorage.setItem('applications', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('savedJobs')) {
        localStorage.setItem('savedJobs', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('employerJobs')) {
        localStorage.setItem('employerJobs', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('employerApplications')) {
        localStorage.setItem('employerApplications', JSON.stringify([]));
    }
}

// Call this function when the app starts
initializeSampleData();