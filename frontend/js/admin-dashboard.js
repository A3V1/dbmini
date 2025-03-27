class AdminDashboard {
    constructor() {
        this.data = {};
        this.initializeData();
        this.setupEventListeners();
    }

    initializeData() {
        // Load data from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const mentors = JSON.parse(localStorage.getItem('mentors')) || [];
        const mentees = JSON.parse(localStorage.getItem('mentees')) || [];
        const emergencyAlerts = JSON.parse(localStorage.getItem('emergency_alerts')) || [];

        this.data = { users, mentors, mentees, emergencyAlerts };
        this.updateDashboardStats();
    }

    updateDashboardStats() {
        document.getElementById('total-users').textContent = this.data.users.length;
        document.getElementById('total-mentors').textContent = this.data.mentors.length;
        document.getElementById('total-mentees').textContent = this.data.mentees.length;
    }

    setupEventListeners() {
        document.querySelectorAll('.feature-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = e.currentTarget.getAttribute('href');
                window.location.href = href;
            });
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});