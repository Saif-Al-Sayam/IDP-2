// API service for database operations
class ApiService {
    constructor() {
        this.baseUrl = window.location.origin + '/jobportal/php/';
    }

    async request(endpoint, data = {}, method = 'POST') {
        try {
            const formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: method,
                body: method === 'POST' ? formData : null
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API request failed:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // Auth methods
    async login(email, password) {
        return await this.request('auth.php', {
            action: 'login',
            email: email,
            password: password
        });
    }

    async signup(userData) {
        return await this.request('auth.php', {
            action: 'signup',
            ...userData
        });
    }

    async logout() {
        return await this.request('auth.php', { action: 'logout' });
    }

    // Jobs methods
    async postJob(jobData) {
        return await this.request('jobs.php', {
            action: 'post_job',
            ...jobData
        });
    }

    async getJobs(filters = {}) {
        const params = new URLSearchParams({
            action: 'get_jobs',
            ...filters
        });
        
        const response = await fetch(`${this.baseUrl}jobs.php?${params}`, {
            method: 'GET'
        });
        return await response.json();
    }

    async applyForJob(jobId) {
        return await this.request('jobs.php', {
            action: 'apply_job',
            job_id: jobId
        });
    }
}

// Global API instance
const api = new ApiService();