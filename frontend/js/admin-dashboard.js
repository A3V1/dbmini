class AdminDashboard {
    constructor() {
        this.data = {};
        this.charts = {};
        this.initializeData();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    initializeData() {
        // Load data from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const mentors = JSON.parse(localStorage.getItem('mentors')) || [];
        const mentees = JSON.parse(localStorage.getItem('mentees')) || [];
        const activityLogs = JSON.parse(localStorage.getItem('activity_logs')) || [];
        const emergencyAlerts = JSON.parse(localStorage.getItem('emergency_alerts')) || [];

        this.data = {
            users,
            mentors,
            mentees,
            activityLogs,
            emergencyAlerts
        };

        this.updateDashboardStats();
        this.updateActivityLogs();
        this.updateEmergencyAlerts();
        this.renderDepartmentCharts();
    }

    updateDashboardStats() {
        // Update quick stats
        document.getElementById('total-users').textContent = this.data.users.length;
        document.getElementById('total-mentors').textContent = this.data.mentors.length;
        document.getElementById('total-mentees').textContent = this.data.mentees.length;
        document.getElementById('total-alerts').textContent = this.data.emergencyAlerts.filter(alert => alert.status === 'pending').length;

        // Update department breakdown
        const departmentStats = this.getDepartmentStats();
        const deptStatsContainer = document.getElementById('department-stats');
        deptStatsContainer.innerHTML = '';

        Object.entries(departmentStats).forEach(([dept, stats]) => {
            deptStatsContainer.innerHTML += `
                <div class="dept-stat-item">
                    <h4>${dept}</h4>
                    <div class="dept-stat-numbers">
                        <span>Mentors: ${stats.mentors}</span>
                        <span>Mentees: ${stats.mentees}</span>
                    </div>
                </div>
            `;
        });
    }

    getDepartmentStats() {
        const stats = {};
        this.data.mentors.forEach(mentor => {
            if (!stats[mentor.department]) {
                stats[mentor.department] = { mentors: 0, mentees: 0 };
            }
            stats[mentor.department].mentors++;
        });

        this.data.mentees.forEach(mentee => {
            const mentor = this.data.mentors.find(m => m.mentor_id === mentee.mentor_id);
            if (mentor && mentor.department) {
                stats[mentor.department].mentees++;
            }
        });

        return stats;
    }

    updateActivityLogs() {
        const logsContainer = document.getElementById('activity-logs');
        const recentLogs = this.data.activityLogs
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        logsContainer.innerHTML = recentLogs.map(log => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${this.getActivityIcon(log.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${log.description}</div>
                    <div class="activity-meta">
                        <span>${new Date(log.timestamp).toLocaleString()}</span>
                        <span class="activity-ip">${log.ip_address}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            login: 'fa-sign-in-alt',
            logout: 'fa-sign-out-alt',
            user_created: 'fa-user-plus',
            user_updated: 'fa-user-edit',
            alert_created: 'fa-exclamation-triangle',
            alert_resolved: 'fa-check-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    updateEmergencyAlerts() {
        const alertsContainer = document.getElementById('emergency-alerts');
        const alerts = this.data.emergencyAlerts
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-card ${alert.status}">
                <div class="alert-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="alert-content">
                    <h3>${alert.title}</h3>
                    <p>${alert.description}</p>
                    <div class="alert-meta">
                        <span class="alert-status">${alert.status}</span>
                        ${alert.status === 'pending' ? `
                            <button class="btn-resolve" data-alert-id="${alert.id}">
                                Resolve
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderDepartmentCharts() {
        const stats = this.getDepartmentStats();
        const ctx = document.getElementById('department-chart').getContext('2d');

        if (this.charts.department) {
            this.charts.department.destroy();
        }

        this.charts.department = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(stats),
                datasets: [
                    {
                        label: 'Mentors',
                        data: Object.values(stats).map(s => s.mentors),
                        backgroundColor: '#3b82f6'
                    },
                    {
                        label: 'Mentees',
                        data: Object.values(stats).map(s => s.mentees),
                        backgroundColor: '#10b981'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Alert resolution
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-resolve')) {
                const alertId = e.target.dataset.alertId;
                this.resolveAlert(alertId);
            }
        });

        // Alert filtering
        document.getElementById('alert-filter').addEventListener('change', (e) => {
            const status = e.target.value;
            this.filterAlerts(status);
        });

        // Quick action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    resolveAlert(alertId) {
        const alert = this.data.emergencyAlerts.find(a => a.id === alertId);
        if (alert) {
            alert.status = 'resolved';
            alert.resolved_at = new Date().toISOString();
            localStorage.setItem('emergency_alerts', JSON.stringify(this.data.emergencyAlerts));
            this.updateEmergencyAlerts();
            this.updateDashboardStats();
        }
    }

    filterAlerts(status) {
        const alertsContainer = document.getElementById('emergency-alerts');
        const alerts = this.data.emergencyAlerts.filter(alert => 
            status === 'all' || alert.status === status
        );
        
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-card ${alert.status}">
                <div class="alert-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="alert-content">
                    <h3>${alert.title}</h3>
                    <p>${alert.description}</p>
                    <div class="alert-meta">
                        <span class="alert-status">${alert.status}</span>
                        ${alert.status === 'pending' ? `
                            <button class="btn-resolve" data-alert-id="${alert.id}">
                                Resolve
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    handleQuickAction(action) {
        switch (action) {
            case 'add-user':
                window.location.href = 'add-user.html';
                break;
            case 'manage-departments':
                window.location.href = 'manage-departments.html';
                break;
            case 'send-announcement':
                window.location.href = 'send-announcement.html';
                break;
            case 'generate-report':
                this.generateReport();
                break;
        }
    }

    generateReport() {
        const stats = this.getDepartmentStats();
        const report = {
            timestamp: new Date().toISOString(),
            total_users: this.data.users.length,
            total_mentors: this.data.mentors.length,
            total_mentees: this.data.mentees.length,
            department_stats: stats,
            pending_alerts: this.data.emergencyAlerts.filter(a => a.status === 'pending').length
        };

        // Convert report to CSV
        const csv = this.convertToCSV(report);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    convertToCSV(report) {
        const rows = [
            ['Report Generated', new Date(report.timestamp).toLocaleString()],
            ['Total Users', report.total_users],
            ['Total Mentors', report.total_mentors],
            ['Total Mentees', report.total_mentees],
            ['Pending Alerts', report.pending_alerts],
            [],
            ['Department', 'Mentors', 'Mentees']
        ];

        Object.entries(report.department_stats).forEach(([dept, stats]) => {
            rows.push([dept, stats.mentors, stats.mentees]);
        });

        return rows.map(row => row.join(',')).join('\n');
    }

    startRealTimeUpdates() {
        // Update date and time
        setInterval(() => {
            const now = new Date();
            document.getElementById('current-date').textContent = now.toLocaleDateString();
            document.getElementById('current-time').textContent = now.toLocaleTimeString();
        }, 1000);

        // Refresh data every 5 minutes
        setInterval(() => {
            this.initializeData();
        }, 300000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new AdminDashboard();
}); 