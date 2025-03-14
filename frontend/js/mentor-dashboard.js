class MentorDashboard {
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
        this.updateMentorInfo();
        this.updateDashboardStats();
        this.updateMenteeList();
        this.updateTaskManagement();
        this.updateProgressOverview();
        this.updateUpcomingMeetings();
        this.updateCommunications();
    }

    updateMentorInfo() {
        const mentorData = this.data.mentors.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        
        document.getElementById('mentor-name').textContent = this.currentUser.name;
        document.getElementById('mentor-department').textContent = mentorData?.department || 'Not Assigned';
    }

    updateDashboardStats() {
        const mentorData = this.data.mentors.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        
        // Count mentees
        const totalMentees = this.data.mentees.filter(m => m.mentor_id === mentorData?.mentor_id).length;
        
        // Count active tasks (example calculation)
        const activeTasks = 5;
        
        // Count upcoming meetings (example calculation)
        const upcomingMeetings = 3;
        
        // Count pending actions (example calculation)
        const pendingActions = 2;

        // Update stats display
        document.getElementById('total-mentees').textContent = totalMentees;
        document.getElementById('active-tasks').textContent = activeTasks;
        document.getElementById('upcoming-meetings').textContent = upcomingMeetings;
        document.getElementById('pending-actions').textContent = pendingActions;
    }

    updateMenteeList() {
        const mentorData = this.data.mentors.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        const myMentees = this.data.mentees
            .filter(m => m.mentor_id === mentorData?.mentor_id)
            .map(mentee => {
                const user = this.data.users.find(u => u.unique_user_no === mentee.unique_user_no);
                const academics = this.data.mentee_academics.find(a => a.mentee_id === mentee.mentee_id);
                return { ...mentee, user, academics };
            });

        const menteeList = document.getElementById('mentee-list');
        if (menteeList) {
            menteeList.innerHTML = `
                ${myMentees.map(mentee => `
                    <div class="mentee-card">
                        <div class="mentee-header">
                            <div class="mentee-avatar">
                                <i class="fas fa-user-graduate fa-2x"></i>
                            </div>
                            <div class="mentee-info">
                                <h3>${mentee.user.name}</h3>
                                <p>${mentee.academics.course} - Year ${mentee.academics.year}</p>
                            </div>
                            <div class="mentee-status ${this.getStatusClass(mentee.academics.academic_context)}">
                                ${mentee.academics.academic_context}
                            </div>
                        </div>
                        <div class="mentee-stats">
                            <div class="stat">
                                <i class="fas fa-chart-line"></i>
                                <span>Attendance: ${mentee.academics.attendance}%</span>
                            </div>
                            <div class="stat">
                                <i class="fas fa-trophy"></i>
                                <span>Achievements: ${this.countAchievements(mentee.mentee_id)}</span>
                            </div>
                        </div>
                        <div class="mentee-actions">
                            <button class="btn-primary" onclick="dashboard.viewMenteeDetails(${mentee.mentee_id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="btn-secondary" onclick="dashboard.scheduleMeeting(${mentee.mentee_id})">
                                <i class="fas fa-calendar-plus"></i> Schedule Meeting
                            </button>
                        </div>
                    </div>
                `).join('')}
                ${myMentees.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-users fa-3x"></i>
                        <p>No mentees assigned yet.</p>
                    </div>
                ` : ''}
            `;
        }
    }

    updateTaskManagement() {
        const mentorData = this.data.mentors.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        
        // Example task data (in a real app, this would come from the database)
        const tasks = [
            {
                id: 1,
                title: 'Review Project Proposal',
                mentee: 'John Smith',
                deadline: '2024-03-20',
                status: 'pending'
            },
            {
                id: 2,
                title: 'Evaluate Mid-term Progress',
                mentee: 'Alice Johnson',
                deadline: '2024-03-25',
                status: 'in-progress'
            },
            {
                id: 3,
                title: 'Provide Feedback on Report',
                mentee: 'David Wilson',
                deadline: '2024-03-18',
                status: 'completed'
            }
        ];

        const taskList = document.getElementById('task-list');
        if (taskList) {
            taskList.innerHTML = `
                ${tasks.map(task => `
                    <div class="task-card ${task.status}">
                        <div class="task-header">
                            <h3>${task.title}</h3>
                            <span class="task-status">${task.status}</span>
                        </div>
                        <div class="task-details">
                            <div class="detail">
                                <i class="fas fa-user-graduate"></i>
                                <span>${task.mentee}</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-calendar"></i>
                                <span>Due: ${new Date(task.deadline).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="btn-secondary" onclick="dashboard.editTask(${task.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-primary" onclick="dashboard.completeTask(${task.id})">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            `;
        }
    }

    updateProgressOverview() {
        const mentorData = this.data.mentors.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        const myMentees = this.data.mentees.filter(m => m.mentor_id === mentorData?.mentor_id);
        
        // Initialize progress chart
        const ctx = document.getElementById('progress-chart')?.getContext('2d');
        if (ctx) {
            this.charts.progress = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: myMentees.map(m => {
                        const user = this.data.users.find(u => u.unique_user_no === m.unique_user_no);
                        return user.name;
                    }),
                    datasets: [{
                        label: 'Attendance Rate',
                        data: myMentees.map(m => {
                            const academics = this.data.mentee_academics.find(a => a.mentee_id === m.mentee_id);
                            return academics?.attendance || 0;
                        }),
                        backgroundColor: '#4CAF50'
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

    updateUpcomingMeetings() {
        // Example meetings data (in a real app, this would come from the database)
        const meetings = [
            {
                id: 1,
                title: 'Project Review Meeting',
                mentee: 'John Smith',
                date: '2024-03-18',
                time: '10:00 AM',
                status: 'scheduled'
            },
            {
                id: 2,
                title: 'Academic Progress Discussion',
                mentee: 'Alice Johnson',
                date: '2024-03-19',
                time: '2:30 PM',
                status: 'confirmed'
            },
            {
                id: 3,
                title: 'Emergency Consultation',
                mentee: 'David Wilson',
                date: '2024-03-17',
                time: '11:00 AM',
                status: 'pending'
            }
        ];

        const meetingList = document.getElementById('meeting-list');
        if (meetingList) {
            meetingList.innerHTML = `
                ${meetings.map(meeting => `
                    <div class="meeting-card ${meeting.status}">
                        <div class="meeting-header">
                            <h3>${meeting.title}</h3>
                            <span class="meeting-status">${meeting.status}</span>
                        </div>
                        <div class="meeting-details">
                            <div class="detail">
                                <i class="fas fa-user-graduate"></i>
                                <span>${meeting.mentee}</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-calendar"></i>
                                <span>${meeting.date}</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-clock"></i>
                                <span>${meeting.time}</span>
                            </div>
                        </div>
                        <div class="meeting-actions">
                            <button class="btn-secondary" onclick="dashboard.editMeeting(${meeting.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-primary" onclick="dashboard.startMeeting(${meeting.id})">
                                <i class="fas fa-video"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            `;
        }
    }

    updateCommunications() {
        const communications = this.data.communications
            .filter(c => c.sender_id === this.currentUser.unique_user_no || c.receiver_id === this.currentUser.unique_user_no)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const communicationList = document.getElementById('communication-list');
        if (communicationList) {
            communicationList.innerHTML = `
                ${communications.map(comm => {
                    const isReceived = comm.receiver_id === this.currentUser.unique_user_no;
                    const otherUser = this.data.users.find(u => 
                        u.unique_user_no === (isReceived ? comm.sender_id : comm.receiver_id)
                    );
                    
                    return `
                        <div class="message-card ${isReceived ? 'received' : 'sent'} ${comm.type}">
                            <div class="message-header">
                                <span class="user">
                                    <i class="fas ${isReceived ? 'fa-user-graduate' : 'fa-user-tie'}"></i>
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
            `;
        }
    }

    // Helper methods
    getStatusClass(status) {
        const classes = {
            'excellent': 'status-success',
            'good': 'status-info',
            'average': 'status-warning',
            'poor': 'status-danger'
        };
        return classes[status.toLowerCase()] || 'status-secondary';
    }

    getMessageStatusIcon(status) {
        const icons = {
            'sent': 'fa-check',
            'delivered': 'fa-check-double',
            'read': 'fa-check-double text-primary'
        };
        return icons[status] || 'fa-clock';
    }

    countAchievements(menteeId) {
        return this.data.achievements.filter(a => a.mentee_id === menteeId).length;
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

        // Task filter
        const taskFilter = document.getElementById('task-filter');
        if (taskFilter) {
            taskFilter.addEventListener('change', (e) => {
                this.filterTasks(e.target.value);
            });
        }

        // Progress period selector
        const progressPeriod = document.getElementById('progress-period');
        if (progressPeriod) {
            progressPeriod.addEventListener('change', (e) => {
                this.updateProgressOverview(e.target.value);
            });
        }

        // Form submission handlers
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createTask();
            });
        }

        const meetingForm = document.getElementById('meeting-form');
        if (meetingForm) {
            meetingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.scheduleMeeting();
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
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new MentorDashboard();
}); 