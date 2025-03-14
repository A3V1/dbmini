class MenteeDashboard {
    constructor() {
        this.data = {};
        this.charts = {};
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.initializeData();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    initializeData() {
        // Load data from localStorage
        this.data = {
            users: JSON.parse(localStorage.getItem('users')) || [],
            mentors: JSON.parse(localStorage.getItem('mentors')) || [],
            mentees: JSON.parse(localStorage.getItem('mentees')) || [],
            mentee_academics: JSON.parse(localStorage.getItem('mentee_academics')) || [],
            communications: JSON.parse(localStorage.getItem('communications')) || [],
            achievements: JSON.parse(localStorage.getItem('achievements')) || [],
            emergency_alerts: JSON.parse(localStorage.getItem('emergency_alerts')) || [],
            activity_logs: JSON.parse(localStorage.getItem('activity_logs')) || []
        };

        // Initialize all dashboard components
        this.updateDashboard();
    }

    updateDashboard() {
        this.updateMenteeInfo();
        this.updateDashboardStats();
        this.updateMentorCard();
        this.updateAcademicProgress();
        this.updateAchievementList();
        this.updateCommunicationList();
        this.updateActivityLog();
        this.updateEmergencyAlerts();
        this.initializeCharts();
    }

    updateMenteeInfo() {
        const menteeData = this.data.mentees.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        const academics = this.data.mentee_academics.find(a => a.mentee_id === menteeData?.mentee_id);
        
        document.getElementById('mentee-name').textContent = this.currentUser.name;
        document.getElementById('mentee-department').textContent = academics?.course || 'Not Assigned';
    }

    updateDashboardStats() {
        const menteeData = this.data.mentees.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        const achievements = this.data.achievements.filter(a => a.mentee_id === menteeData?.mentee_id);
        const academics = this.data.mentee_academics.find(a => a.mentee_id === menteeData?.mentee_id);
        
        // Update quick stats
        document.getElementById('total-achievements').textContent = achievements.length;
        document.getElementById('completed-tasks').textContent = '5'; // Example static value
        document.getElementById('upcoming-meetings').textContent = '2'; // Example static value
        document.getElementById('pending-tasks').textContent = '3'; // Example static value

        // Update academic stats if available
        if (academics) {
            const attendanceElement = document.getElementById('attendance-rate');
            if (attendanceElement) {
                attendanceElement.textContent = `${academics.attendance}%`;
                attendanceElement.className = `stat-number ${this.getAttendanceClass(academics.attendance)}`;
            }
        }
    }

    updateMentorCard() {
        const menteeData = this.data.mentees.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        const mentor = this.data.mentors.find(m => m.mentor_id === menteeData?.mentor_id);
        const mentorUser = mentor ? this.data.users.find(u => u.unique_user_no === mentor.unique_user_no) : null;

        const mentorCard = document.getElementById('mentor-card');
        if (mentorCard && mentor && mentorUser) {
            mentorCard.innerHTML = `
                <div class="mentor-header">
                    <div class="mentor-avatar">
                        <i class="fas fa-user-tie fa-3x"></i>
                    </div>
                    <div class="mentor-info">
                        <h3>${mentorUser.name}</h3>
                        <p>${mentor.department}</p>
                    </div>
                </div>
                <div class="mentor-details">
                    <div class="detail-item">
                        <i class="fas fa-door-open"></i>
                        <span>${mentor.room_no}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${mentor.timetable}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${mentor.academic_background}</span>
                    </div>
                </div>
                <div class="mentor-actions">
                    <button class="btn-primary" onclick="dashboard.requestEmergencyMeeting()">
                        <i class="fas fa-exclamation-circle"></i> Request Emergency Meeting
                    </button>
                    <button class="btn-secondary" onclick="dashboard.sendMessage()">
                        <i class="fas fa-envelope"></i> Send Message
                    </button>
                </div>
            `;
        }
    }

    updateAcademicProgress() {
        const menteeData = this.data.mentees.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        const academics = this.data.mentee_academics.find(a => a.mentee_id === menteeData?.mentee_id);

        const progressSection = document.querySelector('.progress-tracking');
        if (progressSection && academics) {
            progressSection.innerHTML = `
                <div class="section-header">
                    <h2>Academic Progress</h2>
                    <div class="progress-actions">
                        <button class="btn-secondary" onclick="dashboard.downloadAcademicReport()">
                            <i class="fas fa-download"></i> Download Report
                        </button>
                    </div>
                </div>
                <div class="progress-content">
                    <div class="progress-stats">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Course</h4>
                                <p>${academics.course}</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-user-graduate"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Year</h4>
                                <p>${academics.year}</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon ${this.getAttendanceIconClass(academics.attendance)}">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Attendance</h4>
                                <p>${academics.attendance}%</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon ${this.getContextIconClass(academics.academic_context)}">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Status</h4>
                                <p>${academics.academic_context}</p>
                            </div>
                        </div>
                    </div>
                    <div class="progress-chart">
                        <canvas id="progress-chart"></canvas>
                    </div>
                    <div class="academic-background">
                        <h4>Academic Background</h4>
                        <p>${academics.academic_background}</p>
                    </div>
                </div>
            `;

            // Initialize the progress chart
            this.initializeProgressChart();
        }
    }

    updateAchievementList() {
        const menteeData = this.data.mentees.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        const achievements = this.data.achievements
            .filter(a => a.mentee_id === menteeData?.mentee_id)
            .sort((a, b) => new Date(b.date_awarded) - new Date(a.date_awarded));

        const achievementSection = document.querySelector('.achievements');
        if (achievementSection) {
            achievementSection.innerHTML = `
                <div class="section-header">
                    <h2>Achievements</h2>
                    <div class="achievement-filter">
                        <select onchange="dashboard.filterAchievements(this.value)">
                            <option value="all">All Time</option>
                            <option value="month">This Month</option>
                            <option value="semester">This Semester</option>
                        </select>
                    </div>
                </div>
                <div class="achievement-list">
                    ${achievements.map(achievement => `
                        <div class="achievement-card">
                            <div class="achievement-icon">
                                <img src="${achievement.badge_icon}" alt="${achievement.title}">
                            </div>
                            <div class="achievement-content">
                                <h3>${achievement.title}</h3>
                                <p>${achievement.description}</p>
                                <div class="achievement-meta">
                                    <span class="date">
                                        <i class="fas fa-calendar"></i>
                                        ${new Date(achievement.date_awarded).toLocaleDateString()}
                                    </span>
                                    <span class="mentor">
                                        <i class="fas fa-user-tie"></i>
                                        ${this.getMentorName(achievement.mentor_id)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${achievements.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-trophy fa-3x"></i>
                        <p>No achievements yet. Keep working hard!</p>
                    </div>
                ` : ''}
            `;
        }
    }

    updateCommunicationList() {
        const communications = this.data.communications
            .filter(c => c.sender_id === this.currentUser.unique_user_no || c.receiver_id === this.currentUser.unique_user_no)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const communicationSection = document.querySelector('.communications');
        if (communicationSection) {
            communicationSection.innerHTML = `
                <div class="section-header">
                    <h2>Communications</h2>
                    <button class="btn-primary" onclick="dashboard.openMessageModal()">
                        <i class="fas fa-paper-plane"></i> New Message
                    </button>
                </div>
                <div class="communication-list">
                    ${communications.map(comm => {
                        const isReceived = comm.receiver_id === this.currentUser.unique_user_no;
                        const otherUser = this.data.users.find(u => 
                            u.unique_user_no === (isReceived ? comm.sender_id : comm.receiver_id)
                        );
                        
                        return `
                            <div class="message-card ${isReceived ? 'received' : 'sent'} ${comm.type}">
                                <div class="message-header">
                                    <span class="user">
                                        <i class="fas ${isReceived ? 'fa-user-tie' : 'fa-user'}"></i>
                                        ${otherUser ? otherUser.name : 'Unknown'}
                                    </span>
                                    <span class="type">${comm.type}</span>
                                    <span class="time">
                                        <i class="fas fa-clock"></i>
                                        ${new Date(comm.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div class="message-content">
                                    <p>${comm.message_content}</p>
                                    ${comm.attached_file ? `
                                        <div class="attachment">
                                            <i class="fas fa-paperclip"></i>
                                            <a href="#" onclick="dashboard.downloadAttachment('${comm.attached_file}')">
                                                ${comm.attached_file}
                                            </a>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="message-status">
                                    <i class="fas ${this.getMessageStatusIcon(comm.message_status)}"></i>
                                    ${comm.message_status}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${communications.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-comments fa-3x"></i>
                        <p>No messages yet. Start a conversation with your mentor!</p>
                    </div>
                ` : ''}
            `;
        }
    }

    // Helper methods
    getMessageStatusIcon(status) {
        const icons = {
            'sent': 'fa-check',
            'delivered': 'fa-check-double',
            'read': 'fa-check-double text-primary'
        };
        return icons[status] || 'fa-clock';
    }

    getAttendanceClass(attendance) {
        if (attendance >= 90) return 'text-success';
        if (attendance >= 75) return 'text-info';
        if (attendance >= 60) return 'text-warning';
        return 'text-danger';
    }

    getContextIconClass(context) {
        const classes = {
            'excellent': 'text-success',
            'good': 'text-info',
            'average': 'text-warning',
            'poor': 'text-danger'
        };
        return classes[context.toLowerCase()] || 'text-secondary';
    }

    getMentorName(mentorId) {
        const mentor = this.data.mentors.find(m => m.mentor_id === mentorId);
        if (mentor) {
            const user = this.data.users.find(u => u.unique_user_no === mentor.unique_user_no);
            return user ? user.name : 'Unknown Mentor';
        }
        return 'Unknown Mentor';
    }

    // Event handlers
    setupEventListeners() {
        // Add event listeners for buttons and forms
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action && this[action]) {
                    this[action]();
                }
            });
        });

        // Add form submission handlers
        const messageForm = document.getElementById('message-form');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        const meetingForm = document.getElementById('meeting-form');
        if (meetingForm) {
            meetingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.requestMeeting();
            });
        }
    }

    startRealTimeUpdates() {
        // Update date and time
        setInterval(() => {
            const now = new Date();
            const dateElement = document.getElementById('current-date');
            const timeElement = document.getElementById('current-time');
            
            if (dateElement) dateElement.textContent = now.toLocaleDateString();
            if (timeElement) timeElement.textContent = now.toLocaleTimeString();
        }, 1000);

        // Refresh data every 5 minutes
        setInterval(() => {
            this.initializeData();
        }, 300000);
    }

    // Initialize charts
    initializeProgressChart() {
        const ctx = document.getElementById('progress-chart')?.getContext('2d');
        if (ctx) {
            this.charts.progress = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Academic Progress',
                        data: [65, 70, 75, 80, 85, 90],
                        borderColor: '#4CAF50',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new MenteeDashboard();
}); 