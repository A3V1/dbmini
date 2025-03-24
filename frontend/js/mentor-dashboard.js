class MentorDashboard {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.mentors = [];
        this.mentees = [];
        this.menteeAcademics = [];
        this.communications = [];
        this.achievements = [];
        this.emergencyAlerts = [];
        this.activityLogs = [];
        this.selectedMentee = null;
        
        this.chartInstances = {};
        
        this.initializeData();
        this.setupEventListeners();
        this.updateDateTime();
        
        // Start real-time updates
        this.startRealTimeUpdates();
    }
    
    initializeData() {
        // Load data from localStorage (set by sample-data.js)
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.mentors = JSON.parse(localStorage.getItem('mentors')) || [];
        this.mentees = JSON.parse(localStorage.getItem('mentees')) || [];
        this.menteeAcademics = JSON.parse(localStorage.getItem('mentee_academics')) || [];
        this.communications = JSON.parse(localStorage.getItem('communications')) || [];
        this.achievements = JSON.parse(localStorage.getItem('achievements')) || [];
        this.emergencyAlerts = JSON.parse(localStorage.getItem('emergency_alerts')) || [];
        this.activityLogs = JSON.parse(localStorage.getItem('activity_logs')) || [];
        
        // Get current user from localStorage (set in sample-data.js for demo)
        const currentUserNo = localStorage.getItem('currentUserNo');
        if (currentUserNo) {
            this.currentUser = this.users.find(user => user.unique_user_no === parseInt(currentUserNo));
            
            // Get mentor information for current user
            if (this.currentUser && this.currentUser.role === 'mentor') {
                this.currentMentor = this.mentors.find(mentor => 
                    mentor.unique_user_no === this.currentUser.unique_user_no
                );
            }
        }
        
        // Update dashboard with loaded data
        this.updateDashboard();
    }
    
    updateDashboard() {
        if (!this.currentUser || this.currentUser.role !== 'mentor') {
            console.error('Current user is not a mentor or not logged in');
            return;
        }
        
        this.updateMentorInfo();
        this.updateDashboardStats();
        this.updateMenteeList();
        this.updateTaskManagement();
        this.updateProgressOverview();
        this.updateUpcomingMeetings();
        this.updateCommunications();
        this.updateEmergencyAlerts();
    }
    
    // Update mentor information in the header
    updateMentorInfo() {
        if (!this.currentUser || !this.currentMentor) return;
        
        document.getElementById('mentor-name').textContent = this.currentUser.name;
        document.getElementById('mentor-department').textContent = `Department: ${this.currentMentor.department}`;
    }
    
    // Update date and time in the header
    updateDateTime() {
        const dateElement = document.getElementById('current-date');
        const timeElement = document.getElementById('current-time');
        
        const updateTime = () => {
            const now = new Date();
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            
            dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
            timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        };
        
        // Update immediately and then every second
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    // Update dashboard stats at the top
    updateDashboardStats() {
        if (!this.currentMentor) return;
        
        // Get assigned mentees for the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        // Count active tasks (tasks with status pending or in-progress)
        const activeTasks = this.communications.filter(comm => 
            comm.message_type === 'task' && 
            comm.sender_id === this.currentUser.unique_user_no &&
            (comm.status === 'pending' || comm.status === 'in-progress')
        );
        
        // Count upcoming meetings
        const upcomingMeetings = this.communications.filter(comm => 
            comm.message_type === 'meeting' && 
            new Date(comm.scheduled_time) > new Date() &&
            (comm.sender_id === this.currentUser.unique_user_no || 
             assignedMentees.some(mentee => mentee.unique_user_no === comm.recipient_id))
        );
        
        // Count pending actions (unread messages, emergency alerts)
        const pendingActions = this.communications.filter(comm => 
            comm.recipient_id === this.currentUser.unique_user_no && 
            comm.status === 'unread'
        ).length + this.emergencyAlerts.filter(alert =>
            alert.status === 'pending' &&
            assignedMentees.some(mentee => mentee.unique_user_no === alert.mentee_id)
        ).length;
        
        // Update the stats in the dashboard
        document.getElementById('total-mentees').textContent = assignedMentees.length;
        document.getElementById('active-tasks').textContent = activeTasks.length;
        document.getElementById('upcoming-meetings').textContent = upcomingMeetings.length;
        document.getElementById('pending-actions').textContent = pendingActions;
    }
    
    // Get mentee name by unique user number
    getMenteeName(uniqueUserNo) {
        const mentee = this.users.find(user => user.unique_user_no === uniqueUserNo);
        return mentee ? mentee.name : 'Unknown Mentee';
    }
    
    // Get mentor name by mentor id
    getMentorName(mentorId) {
        const mentor = this.mentors.find(m => m.mentor_id === mentorId);
        if (!mentor) return 'Unknown Mentor';
        
        const user = this.users.find(u => u.unique_user_no === mentor.unique_user_no);
        return user ? user.name : 'Unknown Mentor';
    }
    
    // Get academic status class based on attendance and context
    getAcademicStatusClass(academics) {
        if (!academics) return 'badge-info';
        
        const attendance = parseInt(academics.attendance);
        if (attendance >= 85) return 'badge-success';
        if (attendance >= 75) return 'badge-info';
        if (attendance >= 60) return 'badge-warning';
        return 'badge-danger';
    }
    
    // Get academic context icon class
    getContextIconClass(context) {
        switch(context) {
            case 'excellent': return 'fas fa-star text-success';
            case 'good': return 'fas fa-thumbs-up text-info';
            case 'average': return 'fas fa-minus-circle text-warning';
            case 'poor': return 'fas fa-exclamation-triangle text-danger';
            default: return 'fas fa-question-circle';
        }
    }
    
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    }
    
    // Format time for display
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
    }

    // Display list of mentees assigned to the current mentor
    updateMenteeList() {
        if (!this.currentMentor) return;
        
        const menteeListContainer = document.getElementById('mentee-list');
        menteeListContainer.innerHTML = '';
        
        // Get mentees assigned to the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        // Get filter value
        const filterValue = document.getElementById('mentee-filter').value;
        
        // Filter mentees based on academic context if filter is not 'all'
        let filteredMentees = assignedMentees;
        if (filterValue !== 'all') {
            filteredMentees = assignedMentees.filter(mentee => {
                const academics = this.menteeAcademics.find(a => a.unique_user_no === mentee.unique_user_no);
                return academics && academics.academic_context === filterValue;
            });
        }
        
        if (filteredMentees.length === 0) {
            menteeListContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users-slash fa-3x"></i>
                    <p>No mentees found with the selected filter</p>
                </div>
            `;
            return;
        }
        
        // Create mentee cards
        filteredMentees.forEach(mentee => {
            const menteeUser = this.users.find(user => user.unique_user_no === mentee.unique_user_no);
            const academics = this.menteeAcademics.find(a => a.unique_user_no === mentee.unique_user_no);
            
            if (!menteeUser) return;
            
            const menteeAchievements = this.achievements.filter(a => a.mentee_id === mentee.unique_user_no);
            const attendanceRate = academics ? academics.attendance : 'N/A';
            const statusClass = this.getAcademicStatusClass(academics);
            const contextIcon = this.getContextIconClass(academics?.academic_context);
            
            const menteeCard = document.createElement('div');
            menteeCard.className = 'mentee-card card';
            menteeCard.innerHTML = `
                <div class="mentee-header">
                    <div class="mentee-avatar">
                        <i class="fas fa-user-graduate fa-2x"></i>
                    </div>
                    <div class="mentee-info">
                        <h3>${menteeUser.name}</h3>
                        <p>${academics ? academics.course : 'N/A'} - Year ${academics ? academics.year : 'N/A'}</p>
                        <div class="mentee-badges">
                            <span class="badge ${statusClass}">${academics ? academics.academic_context.toUpperCase() : 'N/A'}</span>
                            <span class="badge badge-info">PRN: ${menteeUser.prn_id}</span>
                        </div>
                    </div>
                    <div class="mentee-context">
                        <i class="${contextIcon}"></i>
                    </div>
                </div>
                <div class="mentee-body">
                    <div class="mentee-stat">
                        <span>Attendance</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${attendanceRate}%"></div>
                        </div>
                        <span>${attendanceRate}%</span>
                    </div>
                    <div class="mentee-achievements">
                        <span>Achievements: ${menteeAchievements.length}</span>
                    </div>
                </div>
                <div class="mentee-actions">
                    <button class="btn-outline view-details" data-mentee-id="${mentee.unique_user_no}">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn-outline send-message" data-mentee-id="${mentee.unique_user_no}">
                        <i class="fas fa-comment"></i> Message
                    </button>
                </div>
            `;
            
            menteeListContainer.appendChild(menteeCard);
            
            // Add event listener to the view details button
            menteeCard.querySelector('.view-details').addEventListener('click', () => {
                this.openMenteeDetails(mentee.unique_user_no);
            });
            
            // Add event listener to the send message button
            menteeCard.querySelector('.send-message').addEventListener('click', () => {
                this.openMessageModal(mentee.unique_user_no);
            });
        });
    }
    
    // Open mentee details modal
    openMenteeDetails(menteeId) {
        this.selectedMentee = this.mentees.find(mentee => mentee.unique_user_no === menteeId);
        if (!this.selectedMentee) return;
        
        const menteeUser = this.users.find(user => user.unique_user_no === menteeId);
        const academics = this.menteeAcademics.find(a => a.unique_user_no === menteeId);
        
        if (!menteeUser || !academics) return;
        
        // Set mentee profile information
        document.getElementById('profile-name').textContent = menteeUser.name;
        document.getElementById('profile-course').textContent = `${academics.course}`;
        document.getElementById('profile-year').textContent = `Year ${academics.year}`;
        
        const statusBadge = document.getElementById('profile-status');
        statusBadge.textContent = academics.academic_context.toUpperCase();
        statusBadge.className = `badge ${this.getAcademicStatusClass(academics)}`;
        
        // Academic tab
        document.getElementById('attendance-value').textContent = `${academics.attendance}%`;
        document.getElementById('attendance-bar').style.width = `${academics.attendance}%`;
        document.getElementById('academic-background').textContent = academics.academic_background;
        
        // Achievements tab
        this.updateMenteeAchievements(menteeId);
        
        // Communications tab
        this.updateMenteeCommunications(menteeId);
        
        // Meetings tab
        this.updateMenteeMeetings(menteeId);
        
        // Open the modal
        openModal('mentee-details-modal');
    }

    // Setup event listeners for dashboard interactions
    setupEventListeners() {
        // Filter mentees
        document.getElementById('mentee-filter').addEventListener('change', () => {
            this.updateMenteeList();
        });
        
        // Add mentee button
        document.getElementById('add-mentee').addEventListener('click', () => {
            // In a real application, this would open a form to assign a new mentee
            alert('In a production environment, this would open a modal to assign a new mentee.');
        });
        
        // Create task button
        document.getElementById('create-task').addEventListener('click', () => {
            this.openTaskModal();
        });
        
        // Task filter
        document.getElementById('task-filter').addEventListener('change', () => {
            this.updateTaskManagement();
        });
        
        // Progress period filter
        document.getElementById('progress-period').addEventListener('change', () => {
            this.updateProgressOverview();
        });
        
        // Schedule meeting button
        document.getElementById('schedule-meeting').addEventListener('click', () => {
            this.openMeetingModal();
        });
        
        // New message button
        document.getElementById('new-message').addEventListener('click', () => {
            this.openMessageModal();
        });
        
        // Mentee details - Award achievement button
        document.getElementById('award-achievement').addEventListener('click', () => {
            if (this.selectedMentee) {
                this.openAchievementModal(this.selectedMentee.unique_user_no);
            }
        });
        
        // Mentee details - Send message button
        document.getElementById('send-message').addEventListener('click', () => {
            if (this.selectedMentee) {
                this.openMessageModal(this.selectedMentee.unique_user_no);
            }
        });
        
        // Mentee details - Schedule meeting button
        document.getElementById('schedule-mentee-meeting').addEventListener('click', () => {
            if (this.selectedMentee) {
                this.openMeetingModal(this.selectedMentee.unique_user_no);
            }
        });
        
        // Form submissions
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });
        
        document.getElementById('meeting-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.scheduleMeeting();
        });
        
        document.getElementById('message-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
        
        document.getElementById('achievement-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.awardAchievement();
        });
    }
    
    // Start real-time updates for dashboard data
    startRealTimeUpdates() {
        // Check for new messages every 30 seconds
        setInterval(() => {
            this.checkForNewMessages();
        }, 30000);
        
        // Update dashboard stats every minute
        setInterval(() => {
            this.updateDashboardStats();
        }, 60000);
        
        // Check for new emergency alerts every 15 seconds
        setInterval(() => {
            this.checkForEmergencyAlerts();
        }, 15000);
    }
    
    // Check for new messages
    checkForNewMessages() {
        // In a real application, this would make an API call to check for new messages
        console.log('Checking for new messages...');
    }
    
    // Check for emergency alerts
    checkForEmergencyAlerts() {
        // In a real application, this would make an API call to check for emergency alerts
        console.log('Checking for emergency alerts...');
    }

    // Update task management section
    updateTaskManagement() {
        if (!this.currentMentor) return;
        
        const taskListContainer = document.getElementById('task-list');
        taskListContainer.innerHTML = '';
        
        // Get filter value
        const filterValue = document.getElementById('task-filter').value;
        
        // Get tasks created by the current mentor
        let tasks = this.communications.filter(comm => 
            comm.message_type === 'task' && 
            comm.sender_id === this.currentUser.unique_user_no
        );
        
        // Filter tasks based on status
        if (filterValue !== 'all') {
            tasks = tasks.filter(task => task.status === filterValue);
        }
        
        if (tasks.length === 0) {
            taskListContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks fa-3x"></i>
                    <p>No tasks found with the selected filter</p>
                    <button class="btn-primary" id="create-task-empty">
                        <i class="fas fa-plus"></i> Create New Task
                    </button>
                </div>
            `;
            
            document.getElementById('create-task-empty').addEventListener('click', () => {
                this.openTaskModal();
            });
            
            return;
        }
        
        // Sort tasks by deadline, with most urgent first
        tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        
        // Create task cards
        tasks.forEach(task => {
            const recipientName = this.getMenteeName(task.recipient_id);
            const deadline = this.formatDate(task.deadline);
            
            let statusClass = 'badge-info';
            if (task.status === 'completed') statusClass = 'badge-success';
            else if (task.status === 'in-progress') statusClass = 'badge-warning';
            else if (task.status === 'pending') statusClass = 'badge-danger';
            
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card card';
            taskCard.innerHTML = `
                <div class="task-header">
                    <h3>${task.title}</h3>
                    <span class="badge ${statusClass}">${task.status.toUpperCase()}</span>
                </div>
                <div class="task-body">
                    <p>${task.message_content}</p>
                    <div class="task-meta">
                        <span><i class="fas fa-user"></i> ${recipientName}</span>
                        <span><i class="fas fa-calendar"></i> ${deadline}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-outline edit-task" data-task-id="${task.communication_id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-outline delete-task" data-task-id="${task.communication_id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            taskListContainer.appendChild(taskCard);
            
            // Add event listeners for task actions
            taskCard.querySelector('.edit-task').addEventListener('click', () => {
                this.editTask(task.communication_id);
            });
            
            taskCard.querySelector('.delete-task').addEventListener('click', () => {
                this.deleteTask(task.communication_id);
            });
        });
    }
    
    // Update progress overview chart
    updateProgressOverview() {
        if (!this.currentMentor) return;
        
        const chartContainer = document.getElementById('progress-chart');
        
        // Get mentees assigned to the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        if (assignedMentees.length === 0) {
            chartContainer.parentElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-bar fa-3x"></i>
                    <p>No mentees assigned to display progress</p>
                </div>
            `;
            return;
        }
        
        // Get attendance rates for each mentee
        const menteeNames = [];
        const attendanceRates = [];
        
        assignedMentees.forEach(mentee => {
            const menteeUser = this.users.find(user => user.unique_user_no === mentee.unique_user_no);
            const academics = this.menteeAcademics.find(a => a.unique_user_no === mentee.unique_user_no);
            
            if (menteeUser && academics) {
                menteeNames.push(menteeUser.name);
                attendanceRates.push(parseInt(academics.attendance));
            }
        });
        
        // Create chart
        if (this.chartInstances.progressChart) {
            this.chartInstances.progressChart.destroy();
        }
        
        const ctx = chartContainer.getContext('2d');
        this.chartInstances.progressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: menteeNames,
                datasets: [{
                    label: 'Attendance Rate (%)',
                    data: attendanceRates,
                    backgroundColor: attendanceRates.map(rate => {
                        if (rate >= 85) return '#4CAF50';
                        if (rate >= 75) return '#2196F3';
                        if (rate >= 60) return '#FF9800';
                        return '#F44336';
                    }),
                    borderWidth: 1
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
    
    // Update upcoming meetings section
    updateUpcomingMeetings() {
        if (!this.currentMentor) return;
        
        const meetingListContainer = document.getElementById('meeting-list');
        meetingListContainer.innerHTML = '';
        
        // Get assigned mentees for the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        // Get upcoming meetings
        const meetings = this.communications.filter(comm => 
            comm.message_type === 'meeting' && 
            new Date(comm.scheduled_time) > new Date() &&
            (comm.sender_id === this.currentUser.unique_user_no || 
             assignedMentees.some(mentee => mentee.unique_user_no === comm.recipient_id))
        );
        
        if (meetings.length === 0) {
            meetingListContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar fa-3x"></i>
                    <p>No upcoming meetings</p>
                    <button class="btn-primary" id="schedule-meeting-empty">
                        <i class="fas fa-plus"></i> Schedule Meeting
                    </button>
                </div>
            `;
            
            document.getElementById('schedule-meeting-empty').addEventListener('click', () => {
                this.openMeetingModal();
            });
            
            return;
        }
        
        // Sort meetings by scheduled time, with earliest first
        meetings.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
        
        // Create meeting cards
        meetings.forEach(meeting => {
            const participantName = meeting.sender_id === this.currentUser.unique_user_no
                ? this.getMenteeName(meeting.recipient_id)
                : this.users.find(u => u.unique_user_no === meeting.sender_id)?.name || 'Unknown';
            
            const meetingDate = this.formatDate(meeting.scheduled_time);
            const meetingTime = this.formatTime(meeting.scheduled_time);
            
            const meetingCard = document.createElement('div');
            meetingCard.className = 'meeting-card card';
            meetingCard.innerHTML = `
                <div class="meeting-header">
                    <h3>${meeting.title}</h3>
                    <span class="badge badge-primary">SCHEDULED</span>
                </div>
                <div class="meeting-body">
                    <p>${meeting.message_content}</p>
                    <div class="meeting-meta">
                        <span><i class="fas fa-user"></i> ${participantName}</span>
                        <span><i class="fas fa-calendar"></i> ${meetingDate}</span>
                        <span><i class="fas fa-clock"></i> ${meetingTime}</span>
                    </div>
                </div>
                <div class="meeting-actions">
                    <button class="btn-outline edit-meeting" data-meeting-id="${meeting.communication_id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-outline cancel-meeting" data-meeting-id="${meeting.communication_id}">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            `;
            
            meetingListContainer.appendChild(meetingCard);
            
            // Add event listeners for meeting actions
            meetingCard.querySelector('.edit-meeting').addEventListener('click', () => {
                this.editMeeting(meeting.communication_id);
            });
            
            meetingCard.querySelector('.cancel-meeting').addEventListener('click', () => {
                this.cancelMeeting(meeting.communication_id);
            });
        });
    }
    
    // Update communications section
    updateCommunications() {
        if (!this.currentMentor) return;
        
        const communicationListContainer = document.getElementById('communication-list');
        communicationListContainer.innerHTML = '';
        
        // Get assigned mentees for the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        // Get recent communications (only direct messages and feedback)
        const communications = this.communications.filter(comm => 
            (comm.message_type === 'one-to-one' || comm.message_type === 'feedback') &&
            ((comm.sender_id === this.currentUser.unique_user_no && 
              assignedMentees.some(mentee => mentee.unique_user_no === comm.recipient_id)) ||
             (comm.recipient_id === this.currentUser.unique_user_no && 
              assignedMentees.some(mentee => mentee.unique_user_no === comm.sender_id)))
        );
        
        if (communications.length === 0) {
            communicationListContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments fa-3x"></i>
                    <p>No recent communications</p>
                    <button class="btn-primary" id="new-message-empty">
                        <i class="fas fa-paper-plane"></i> New Message
                    </button>
                </div>
            `;
            
            document.getElementById('new-message-empty').addEventListener('click', () => {
                this.openMessageModal();
            });
            
            return;
        }
        
        // Sort communications by time, with most recent first
        communications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Limit to 10 most recent communications
        const recentCommunications = communications.slice(0, 10);
        
        // Create communication cards
        recentCommunications.forEach(comm => {
            const isSender = comm.sender_id === this.currentUser.unique_user_no;
            const otherPartyId = isSender ? comm.recipient_id : comm.sender_id;
            const otherPartyName = this.users.find(u => u.unique_user_no === otherPartyId)?.name || 'Unknown';
            
            let messageTypeIcon = 'fa-comment';
            let messageTypeClass = 'badge-info';
            if (comm.message_type === 'feedback') {
                messageTypeIcon = 'fa-comment-dots';
                messageTypeClass = 'badge-warning';
            }
            
            const timestamp = this.formatDate(comm.timestamp) + ' at ' + this.formatTime(comm.timestamp);
            
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card card';
            messageCard.innerHTML = `
                <div class="message-header">
                    <div class="message-info">
                        <span>${isSender ? 'To: ' : 'From: '}${otherPartyName}</span>
                        <span class="badge ${messageTypeClass}">
                            <i class="fas ${messageTypeIcon}"></i> 
                            ${comm.message_type === 'one-to-one' ? 'DIRECT' : 'FEEDBACK'}
                        </span>
                    </div>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-body">
                    <p>${comm.message_content}</p>
                </div>
                <div class="message-actions">
                    <button class="btn-outline reply-message" data-comm-id="${comm.communication_id}">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                </div>
            `;
            
            communicationListContainer.appendChild(messageCard);
            
            // Add event listener for reply button
            messageCard.querySelector('.reply-message').addEventListener('click', () => {
                this.replyToMessage(comm.communication_id);
            });
        });
    }
    
    // Update emergency alerts section
    updateEmergencyAlerts() {
        if (!this.currentMentor) return;
        
        const alertListContainer = document.getElementById('alert-list');
        alertListContainer.innerHTML = '';
        
        // Get assigned mentees for the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        // Get emergency alerts for mentees assigned to the current mentor
        const alerts = this.emergencyAlerts.filter(alert => 
            assignedMentees.some(mentee => mentee.unique_user_no === alert.mentee_id)
        );
        
        if (alerts.length === 0) {
            alertListContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash fa-3x"></i>
                    <p>No emergency alerts</p>
                </div>
            `;
            return;
        }
        
        // Sort alerts by timestamp, with most recent first
        alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Create alert cards
        alerts.forEach(alert => {
            const menteeName = this.getMenteeName(alert.mentee_id);
            const timestamp = this.formatDate(alert.timestamp) + ' at ' + this.formatTime(alert.timestamp);
            
            let statusClass = 'badge-warning';
            if (alert.status === 'resolved') statusClass = 'badge-success';
            else if (alert.status === 'pending') statusClass = 'badge-danger';
            
            const alertCard = document.createElement('div');
            alertCard.className = 'alert-card card emergency';
            alertCard.innerHTML = `
                <div class="alert-header">
                    <h3>Emergency Meeting Request</h3>
                    <span class="badge ${statusClass}">${alert.status.toUpperCase()}</span>
                </div>
                <div class="alert-body">
                    <p>${alert.description}</p>
                    <div class="alert-meta">
                        <span><i class="fas fa-user"></i> ${menteeName}</span>
                        <span><i class="fas fa-clock"></i> ${timestamp}</span>
                    </div>
                </div>
                ${alert.status !== 'resolved' ? `
                <div class="alert-actions">
                    <button class="btn-primary resolve-alert" data-alert-id="${alert.alert_id}">
                        <i class="fas fa-check"></i> Resolve
                    </button>
                    <button class="btn-outline schedule-emergency" data-mentee-id="${alert.mentee_id}">
                        <i class="fas fa-calendar-plus"></i> Schedule Meeting
                    </button>
                </div>` : ''}
            `;
            
            alertListContainer.appendChild(alertCard);
            
            // Add event listeners for alert actions
            if (alert.status !== 'resolved') {
                alertCard.querySelector('.resolve-alert').addEventListener('click', () => {
                    this.resolveAlert(alert.alert_id);
                });
                
                alertCard.querySelector('.schedule-emergency').addEventListener('click', () => {
                    this.openMeetingModal(alert.mentee_id, true);
                });
            }
        });
    }
    
    // Update mentee achievements tab in details modal
    updateMenteeAchievements(menteeId) {
        const achievementsContainer = document.getElementById('mentee-achievements');
        achievementsContainer.innerHTML = '';
        
        const achievements = this.achievements.filter(a => a.mentee_id === menteeId);
        
        if (achievements.length === 0) {
            achievementsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy fa-3x"></i>
                    <p>No achievements awarded yet</p>
                </div>
            `;
            return;
        }
        
        // Sort achievements by date awarded, with most recent first
        achievements.sort((a, b) => new Date(b.date_awarded) - new Date(a.date_awarded));
        
        // Create achievement items
        achievements.forEach(achievement => {
            const dateAwarded = this.formatDate(achievement.date_awarded);
            const mentorName = this.getMentorName(achievement.mentor_id);
            
            const achievementItem = document.createElement('div');
            achievementItem.className = 'achievement-item';
            achievementItem.innerHTML = `
                <div class="achievement-icon">
                    <i class="${achievement.badge_icon} fa-2x"></i>
                </div>
                <div class="achievement-info">
                    <h3>${achievement.title}</h3>
                    <p>${achievement.description}</p>
                    <div class="achievement-meta">
                        <span><i class="fas fa-user-tie"></i> ${mentorName}</span>
                        <span><i class="fas fa-calendar"></i> ${dateAwarded}</span>
                    </div>
                </div>
            `;
            
            achievementsContainer.appendChild(achievementItem);
        });
    }
    
    // Update mentee communications tab in details modal
    updateMenteeCommunications(menteeId) {
        const communicationsContainer = document.getElementById('mentee-communications');
        communicationsContainer.innerHTML = '';
        
        // Get communications between current mentor and selected mentee
        const communications = this.communications.filter(comm => 
            (comm.message_type === 'one-to-one' || comm.message_type === 'feedback') &&
            ((comm.sender_id === this.currentUser.unique_user_no && comm.recipient_id === menteeId) ||
             (comm.recipient_id === this.currentUser.unique_user_no && comm.sender_id === menteeId))
        );
        
        if (communications.length === 0) {
            communicationsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments fa-3x"></i>
                    <p>No communications yet</p>
                </div>
            `;
            return;
        }
        
        // Sort communications by timestamp, with most recent first
        communications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Create communication items
        communications.forEach(comm => {
            const isSender = comm.sender_id === this.currentUser.unique_user_no;
            const timestamp = this.formatDate(comm.timestamp) + ' at ' + this.formatTime(comm.timestamp);
            
            let messageTypeIcon = 'fa-comment';
            let messageTypeClass = 'badge-info';
            if (comm.message_type === 'feedback') {
                messageTypeIcon = 'fa-comment-dots';
                messageTypeClass = 'badge-warning';
            }
            
            const messageItem = document.createElement('div');
            messageItem.className = `message-item ${isSender ? 'sent' : 'received'}`;
            messageItem.innerHTML = `
                <div class="message-bubble">
                    <div class="message-header">
                        <span class="badge ${messageTypeClass}">
                            <i class="fas ${messageTypeIcon}"></i> 
                            ${comm.message_type === 'one-to-one' ? 'DIRECT' : 'FEEDBACK'}
                        </span>
                        <span class="message-time">${timestamp}</span>
                    </div>
                    <p>${comm.message_content}</p>
                </div>
            `;
            
            communicationsContainer.appendChild(messageItem);
        });
    }
    
    // Update mentee meetings tab in details modal
    updateMenteeMeetings(menteeId) {
        const meetingsContainer = document.getElementById('mentee-meetings');
        meetingsContainer.innerHTML = '';
        
        // Get meetings between current mentor and selected mentee
        const meetings = this.communications.filter(comm => 
            comm.message_type === 'meeting' &&
            ((comm.sender_id === this.currentUser.unique_user_no && comm.recipient_id === menteeId) ||
             (comm.recipient_id === this.currentUser.unique_user_no && comm.sender_id === menteeId))
        );
        
        if (meetings.length === 0) {
            meetingsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar fa-3x"></i>
                    <p>No meetings scheduled</p>
                </div>
            `;
            return;
        }
        
        // Sort meetings by scheduled time, with upcoming first, then past
        meetings.sort((a, b) => {
            const aTime = new Date(a.scheduled_time);
            const bTime = new Date(b.scheduled_time);
            const now = new Date();
            
            // If one is upcoming and one is past, show upcoming first
            if (aTime > now && bTime < now) return -1;
            if (aTime < now && bTime > now) return 1;
            
            // If both are upcoming, show earliest first
            if (aTime > now && bTime > now) return aTime - bTime;
            
            // If both are past, show most recent first
            return bTime - aTime;
        });
        
        // Create meeting items
        meetings.forEach(meeting => {
            const meetingDate = this.formatDate(meeting.scheduled_time);
            const meetingTime = this.formatTime(meeting.scheduled_time);
            const isUpcoming = new Date(meeting.scheduled_time) > new Date();
            
            const meetingItem = document.createElement('div');
            meetingItem.className = 'meeting-item';
            meetingItem.innerHTML = `
                <div class="meeting-info">
                    <h3>${meeting.title}</h3>
                    <p>${meeting.message_content}</p>
                    <div class="meeting-meta">
                        <span><i class="fas fa-calendar"></i> ${meetingDate}</span>
                        <span><i class="fas fa-clock"></i> ${meetingTime}</span>
                        <span class="badge ${isUpcoming ? 'badge-primary' : 'badge-info'}">
                            ${isUpcoming ? 'UPCOMING' : 'PAST'}
                        </span>
                    </div>
                </div>
                ${isUpcoming ? `
                <div class="meeting-actions">
                    <button class="btn-outline edit-meeting" data-meeting-id="${meeting.communication_id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-outline cancel-meeting" data-meeting-id="${meeting.communication_id}">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>` : ''}
            `;
            
            meetingsContainer.appendChild(meetingItem);
            
            // Add event listeners for meeting actions
            if (isUpcoming) {
                meetingItem.querySelector('.edit-meeting').addEventListener('click', () => {
                    this.editMeeting(meeting.communication_id);
                });
                
                meetingItem.querySelector('.cancel-meeting').addEventListener('click', () => {
                    this.cancelMeeting(meeting.communication_id);
                });
            }
        });
    }
    
    // Open task modal
    openTaskModal(taskId = null) {
        const taskModal = document.getElementById('task-modal');
        const taskForm = document.getElementById('task-form');
        const taskTitle = document.getElementById('task-title');
        const taskDescription = document.getElementById('task-description');
        const taskMentee = document.getElementById('task-mentee');
        const taskDeadline = document.getElementById('task-deadline');
        
        // Clear form
        taskForm.reset();
        
        // If editing existing task
        let editingTask = null;
        if (taskId) {
            editingTask = this.communications.find(comm => 
                comm.communication_id === taskId && comm.message_type === 'task'
            );
            
            if (editingTask) {
                taskTitle.value = editingTask.title;
                taskDescription.value = editingTask.message_content;
                taskDeadline.value = new Date(editingTask.deadline).toISOString().split('T')[0];
                
                // Update modal title
                taskModal.querySelector('h2').textContent = 'Edit Task';
                taskForm.querySelector('button[type="submit"]').textContent = 'Update Task';
                
                // Store task ID for later
                taskForm.dataset.taskId = taskId;
            }
        } else {
            // New task
            taskModal.querySelector('h2').textContent = 'Create New Task';
            taskForm.querySelector('button[type="submit"]').textContent = 'Create Task';
            delete taskForm.dataset.taskId;
            
            // Set default deadline to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            taskDeadline.value = tomorrow.toISOString().split('T')[0];
        }
        
        // Populate mentee dropdown
        taskMentee.innerHTML = '';
        
        // Get mentees assigned to the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        assignedMentees.forEach(mentee => {
            const menteeUser = this.users.find(user => user.unique_user_no === mentee.unique_user_no);
            
            if (menteeUser) {
                const option = document.createElement('option');
                option.value = mentee.unique_user_no;
                option.textContent = menteeUser.name;
                
                // If editing, select the correct mentee
                if (editingTask && editingTask.recipient_id === mentee.unique_user_no) {
                    option.selected = true;
                }
                // If opened from mentee details, select the current mentee
                else if (this.selectedMentee && this.selectedMentee.unique_user_no === mentee.unique_user_no) {
                    option.selected = true;
                }
                
                taskMentee.appendChild(option);
            }
        });
        
        // Open modal
        openModal('task-modal');
    }
    
    // Create or update task
    createTask() {
        const taskForm = document.getElementById('task-form');
        const taskTitle = document.getElementById('task-title').value;
        const taskDescription = document.getElementById('task-description').value;
        const taskMentee = parseInt(document.getElementById('task-mentee').value);
        const taskDeadline = document.getElementById('task-deadline').value;
        
        // Check if editing existing task
        const taskId = taskForm.dataset.taskId;
        
        if (taskId) {
            // Find existing task
            const taskIndex = this.communications.findIndex(comm => comm.communication_id === parseInt(taskId));
            
            if (taskIndex !== -1) {
                // Update task
                this.communications[taskIndex].title = taskTitle;
                this.communications[taskIndex].message_content = taskDescription;
                this.communications[taskIndex].recipient_id = taskMentee;
                this.communications[taskIndex].deadline = taskDeadline;
                
                // Save to localStorage
                localStorage.setItem('communications', JSON.stringify(this.communications));
                
                // Update dashboard
                this.updateTaskManagement();
                
                // Close modal
                closeModal('task-modal');
                
                // Log activity
                this.logActivity(`Updated task "${taskTitle}" for mentee ${this.getMenteeName(taskMentee)}`);
                
                return;
            }
        }
        
        // Create new task
        const newTask = {
            communication_id: Date.now(), // Use timestamp as ID
            sender_id: this.currentUser.unique_user_no,
            recipient_id: taskMentee,
            message_type: 'task',
            message_content: taskDescription,
            timestamp: new Date().toISOString(),
            status: 'pending',
            title: taskTitle,
            deadline: taskDeadline,
            has_attachment: false
        };
        
        // Add to communications
        this.communications.push(newTask);
        
        // Save to localStorage
        localStorage.setItem('communications', JSON.stringify(this.communications));
        
        // Update dashboard
        this.updateTaskManagement();
        
        // Close modal
        closeModal('task-modal');
        
        // Log activity
        this.logActivity(`Created new task "${taskTitle}" for mentee ${this.getMenteeName(taskMentee)}`);
    }
    
    // Edit task
    editTask(taskId) {
        this.openTaskModal(taskId);
    }
    
    // Delete task
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskIndex = this.communications.findIndex(comm => comm.communication_id === taskId);
            
            if (taskIndex !== -1) {
                const task = this.communications[taskIndex];
                
                // Remove task
                this.communications.splice(taskIndex, 1);
                
                // Save to localStorage
                localStorage.setItem('communications', JSON.stringify(this.communications));
                
                // Update dashboard
                this.updateTaskManagement();
                
                // Log activity
                this.logActivity(`Deleted task "${task.title}" for mentee ${this.getMenteeName(task.recipient_id)}`);
            }
        }
    }
    
    // Open meeting modal
    openMeetingModal(menteeId = null, isEmergency = false) {
        const meetingModal = document.getElementById('meeting-modal');
        const meetingForm = document.getElementById('meeting-form');
        const meetingTitle = document.getElementById('meeting-title');
        const meetingMentee = document.getElementById('meeting-mentee');
        const meetingDate = document.getElementById('meeting-date');
        const meetingTime = document.getElementById('meeting-time');
        const meetingAgenda = document.getElementById('meeting-agenda');
        
        // Clear form
        meetingForm.reset();
        
        // If it's an emergency meeting
        if (isEmergency) {
            meetingTitle.value = 'Emergency Meeting';
            meetingAgenda.value = 'Emergency meeting requested by mentee.';
            
            // Set meeting time to the next hour
            const now = new Date();
            now.setHours(now.getHours() + 1);
            now.setMinutes(0);
            
            meetingDate.value = now.toISOString().split('T')[0];
            meetingTime.value = now.toTimeString().substring(0, 5);
            
            // Update modal title
            meetingModal.querySelector('h2').textContent = 'Schedule Emergency Meeting';
        } else {
            // Regular meeting
            meetingModal.querySelector('h2').textContent = 'Schedule Meeting';
            
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0);
            
            meetingDate.value = tomorrow.toISOString().split('T')[0];
            meetingTime.value = '10:00';
        }
        
        // Populate mentee dropdown
        meetingMentee.innerHTML = '';
        
        // Get mentees assigned to the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        assignedMentees.forEach(mentee => {
            const menteeUser = this.users.find(user => user.unique_user_no === mentee.unique_user_no);
            
            if (menteeUser) {
                const option = document.createElement('option');
                option.value = mentee.unique_user_no;
                option.textContent = menteeUser.name;
                
                // If opened with specific mentee, select it
                if (menteeId && menteeId === mentee.unique_user_no) {
                    option.selected = true;
                }
                // If opened from mentee details, select the current mentee
                else if (this.selectedMentee && this.selectedMentee.unique_user_no === mentee.unique_user_no) {
                    option.selected = true;
                }
                
                meetingMentee.appendChild(option);
            }
        });
        
        // Open modal
        openModal('meeting-modal');
    }
    
    // Schedule meeting
    scheduleMeeting() {
        const meetingTitle = document.getElementById('meeting-title').value;
        const meetingMentee = parseInt(document.getElementById('meeting-mentee').value);
        const meetingDate = document.getElementById('meeting-date').value;
        const meetingTime = document.getElementById('meeting-time').value;
        const meetingAgenda = document.getElementById('meeting-agenda').value;
        
        // Create scheduled time
        const scheduledTime = new Date(`${meetingDate}T${meetingTime}`).toISOString();
        
        // Create new meeting
        const newMeeting = {
            communication_id: Date.now(), // Use timestamp as ID
            sender_id: this.currentUser.unique_user_no,
            recipient_id: meetingMentee,
            message_type: 'meeting',
            message_content: meetingAgenda,
            timestamp: new Date().toISOString(),
            status: 'pending',
            title: meetingTitle,
            scheduled_time: scheduledTime,
            has_attachment: false
        };
        
        // Add to communications
        this.communications.push(newMeeting);
        
        // Save to localStorage
        localStorage.setItem('communications', JSON.stringify(this.communications));
        
        // Update dashboard
        this.updateUpcomingMeetings();
        
        // If viewing mentee details, update the meetings tab
        if (this.selectedMentee && this.selectedMentee.unique_user_no === meetingMentee) {
            this.updateMenteeMeetings(meetingMentee);
        }
        
        // Close modal
        closeModal('meeting-modal');
        
        // Log activity
        this.logActivity(`Scheduled meeting "${meetingTitle}" with mentee ${this.getMenteeName(meetingMentee)}`);
    }
    
    // Edit meeting
    editMeeting(meetingId) {
        const meeting = this.communications.find(comm => 
            comm.communication_id === meetingId && comm.message_type === 'meeting'
        );
        
        if (!meeting) return;
        
        const meetingModal = document.getElementById('meeting-modal');
        const meetingForm = document.getElementById('meeting-form');
        const meetingTitle = document.getElementById('meeting-title');
        const meetingMentee = document.getElementById('meeting-mentee');
        const meetingDate = document.getElementById('meeting-date');
        const meetingTime = document.getElementById('meeting-time');
        const meetingAgenda = document.getElementById('meeting-agenda');
        
        // Fill form with meeting data
        meetingTitle.value = meeting.title;
        meetingAgenda.value = meeting.message_content;
        
        const meetingDateTime = new Date(meeting.scheduled_time);
        meetingDate.value = meetingDateTime.toISOString().split('T')[0];
        meetingTime.value = meetingDateTime.toTimeString().substring(0, 5);
        
        // Populate mentee dropdown
        meetingMentee.innerHTML = '';
        
        // Get mentees assigned to the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        assignedMentees.forEach(mentee => {
            const menteeUser = this.users.find(user => user.unique_user_no === mentee.unique_user_no);
            
            if (menteeUser) {
                const option = document.createElement('option');
                option.value = mentee.unique_user_no;
                option.textContent = menteeUser.name;
                
                // Select the meeting recipient
                if (meeting.recipient_id === mentee.unique_user_no) {
                    option.selected = true;
                }
                
                meetingMentee.appendChild(option);
            }
        });
        
        // Update modal title
        meetingModal.querySelector('h2').textContent = 'Edit Meeting';
        meetingForm.querySelector('button[type="submit"]').textContent = 'Update Meeting';
        
        // Store meeting ID for later
        meetingForm.dataset.meetingId = meetingId;
        
        // Update form submission handler
        meetingForm.onsubmit = (e) => {
            e.preventDefault();
            this.updateMeeting(meetingId);
        };
        
        // Open modal
        openModal('meeting-modal');
    }
    
    // Update meeting
    updateMeeting(meetingId) {
        const meetingTitle = document.getElementById('meeting-title').value;
        const meetingMentee = parseInt(document.getElementById('meeting-mentee').value);
        const meetingDate = document.getElementById('meeting-date').value;
        const meetingTime = document.getElementById('meeting-time').value;
        const meetingAgenda = document.getElementById('meeting-agenda').value;
        
        // Create scheduled time
        const scheduledTime = new Date(`${meetingDate}T${meetingTime}`).toISOString();
        
        // Find meeting
        const meetingIndex = this.communications.findIndex(comm => comm.communication_id === meetingId);
        
        if (meetingIndex !== -1) {
            // Update meeting
            this.communications[meetingIndex].title = meetingTitle;
            this.communications[meetingIndex].recipient_id = meetingMentee;
            this.communications[meetingIndex].message_content = meetingAgenda;
            this.communications[meetingIndex].scheduled_time = scheduledTime;
            
            // Save to localStorage
            localStorage.setItem('communications', JSON.stringify(this.communications));
            
            // Update dashboard
            this.updateUpcomingMeetings();
            
            // If viewing mentee details, update the meetings tab
            if (this.selectedMentee && this.selectedMentee.unique_user_no === meetingMentee) {
                this.updateMenteeMeetings(meetingMentee);
            }
            
            // Reset form submission handler
            document.getElementById('meeting-form').onsubmit = (e) => {
                e.preventDefault();
                this.scheduleMeeting();
            };
            
            // Close modal
            closeModal('meeting-modal');
            
            // Log activity
            this.logActivity(`Updated meeting "${meetingTitle}" with mentee ${this.getMenteeName(meetingMentee)}`);
        }
    }
    
    // Cancel meeting
    cancelMeeting(meetingId) {
        if (confirm('Are you sure you want to cancel this meeting?')) {
            const meetingIndex = this.communications.findIndex(comm => comm.communication_id === meetingId);
            
            if (meetingIndex !== -1) {
                const meeting = this.communications[meetingIndex];
                
                // Remove meeting
                this.communications.splice(meetingIndex, 1);
                
                // Save to localStorage
                localStorage.setItem('communications', JSON.stringify(this.communications));
                
                // Update dashboard
                this.updateUpcomingMeetings();
                
                // If viewing mentee details, update the meetings tab
                if (this.selectedMentee && this.selectedMentee.unique_user_no === meeting.recipient_id) {
                    this.updateMenteeMeetings(meeting.recipient_id);
                }
                
                // Log activity
                this.logActivity(`Cancelled meeting "${meeting.title}" with mentee ${this.getMenteeName(meeting.recipient_id)}`);
            }
        }
    }
    
    // Open message modal
    openMessageModal(menteeId = null) {
        const messageModal = document.getElementById('message-modal');
        const messageForm = document.getElementById('message-form');
        const messageRecipient = document.getElementById('message-recipient');
        const messageType = document.getElementById('message-type');
        const messageContent = document.getElementById('message-content');
        
        // Clear form
        messageForm.reset();
        
        // Populate recipient dropdown
        messageRecipient.innerHTML = '';
        
        // Get mentees assigned to the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        assignedMentees.forEach(mentee => {
            const menteeUser = this.users.find(user => user.unique_user_no === mentee.unique_user_no);
            
            if (menteeUser) {
                const option = document.createElement('option');
                option.value = mentee.unique_user_no;
                option.textContent = menteeUser.name;
                
                // If opened with specific mentee, select it
                if (menteeId && menteeId === mentee.unique_user_no) {
                    option.selected = true;
                }
                // If opened from mentee details, select the current mentee
                else if (this.selectedMentee && this.selectedMentee.unique_user_no === mentee.unique_user_no) {
                    option.selected = true;
                }
                
                messageRecipient.appendChild(option);
            }
        });
        
        // Open modal
        openModal('message-modal');
    }
    
    // Send message
    sendMessage() {
        const messageRecipient = parseInt(document.getElementById('message-recipient').value);
        const messageType = document.getElementById('message-type').value;
        const messageContent = document.getElementById('message-content').value;
        const messageAttachment = document.getElementById('message-attachment').files[0];
        
        // Create new message
        const newMessage = {
            communication_id: Date.now(), // Use timestamp as ID
            sender_id: this.currentUser.unique_user_no,
            recipient_id: messageRecipient,
            message_type: messageType,
            message_content: messageContent,
            timestamp: new Date().toISOString(),
            status: 'unread',
            has_attachment: messageAttachment ? true : false
        };
        
        // Add to communications
        this.communications.push(newMessage);
        
        // Save to localStorage
        localStorage.setItem('communications', JSON.stringify(this.communications));
        
        // Update dashboard
        this.updateCommunications();
        
        // If viewing mentee details, update the communications tab
        if (this.selectedMentee && this.selectedMentee.unique_user_no === messageRecipient) {
            this.updateMenteeCommunications(messageRecipient);
        }
        
        // Close modal
        closeModal('message-modal');
        
        // Log activity
        this.logActivity(`Sent ${messageType} message to mentee ${this.getMenteeName(messageRecipient)}`);
    }
    
    // Reply to message
    replyToMessage(communicationId) {
        const comm = this.communications.find(c => c.communication_id === communicationId);
        
        if (!comm) return;
        
        // Open message modal
        this.openMessageModal(comm.sender_id === this.currentUser.unique_user_no ? comm.recipient_id : comm.sender_id);
        
        // Pre-fill message type
        document.getElementById('message-type').value = comm.message_type;
        
        // Pre-fill message content with reply prefix
        document.getElementById('message-content').value = `Reply to: "${comm.message_content.substring(0, 50)}${comm.message_content.length > 50 ? '...' : ''}"\n\n`;
        
        // Focus on message content
        document.getElementById('message-content').focus();
    }
    
    // Open achievement modal
    openAchievementModal(menteeId = null) {
        const achievementModal = document.getElementById('achievement-modal');
        const achievementForm = document.getElementById('achievement-form');
        const achievementMentee = document.getElementById('achievement-mentee');
        
        // Clear form
        achievementForm.reset();
        
        // Populate mentee dropdown
        achievementMentee.innerHTML = '';
        
        // Get mentees assigned to the current mentor
        const assignedMentees = this.mentees.filter(mentee => 
            mentee.mentor_id === this.currentMentor.mentor_id
        );
        
        assignedMentees.forEach(mentee => {
            const menteeUser = this.users.find(user => user.unique_user_no === mentee.unique_user_no);
            
            if (menteeUser) {
                const option = document.createElement('option');
                option.value = mentee.unique_user_no;
                option.textContent = menteeUser.name;
                
                // If opened with specific mentee, select it
                if (menteeId && menteeId === mentee.unique_user_no) {
                    option.selected = true;
                }
                // If opened from mentee details, select the current mentee
                else if (this.selectedMentee && this.selectedMentee.unique_user_no === mentee.unique_user_no) {
                    option.selected = true;
                }
                
                achievementMentee.appendChild(option);
            }
        });
        
        // Populate badge options
        const badgeOptions = document.getElementById('badge-options');
        badgeOptions.innerHTML = '';
        
        const badges = [
            { icon: 'fas fa-trophy', name: 'Trophy' },
            { icon: 'fas fa-medal', name: 'Medal' },
            { icon: 'fas fa-star', name: 'Star' },
            { icon: 'fas fa-award', name: 'Award' },
            { icon: 'fas fa-certificate', name: 'Certificate' },
            { icon: 'fas fa-crown', name: 'Crown' }
        ];
        
        badges.forEach((badge, index) => {
            const badgeOption = document.createElement('div');
            badgeOption.className = 'badge-option';
            badgeOption.innerHTML = `
                <input type="radio" name="badge-icon" id="badge-${index}" value="${badge.icon}" ${index === 0 ? 'checked' : ''}>
                <label for="badge-${index}">
                    <i class="${badge.icon} fa-2x"></i>
                    <span>${badge.name}</span>
                </label>
            `;
            
            badgeOptions.appendChild(badgeOption);
        });
        
        // Open modal
        openModal('achievement-modal');
    }
    
    // Award achievement
    awardAchievement() {
        const achievementMentee = parseInt(document.getElementById('achievement-mentee').value);
        const achievementTitle = document.getElementById('achievement-title').value;
        const achievementDescription = document.getElementById('achievement-description').value;
        const badgeIcon = document.querySelector('input[name="badge-icon"]:checked').value;
        
        // Create new achievement
        const newAchievement = {
            achievement_id: Date.now(), // Use timestamp as ID
            mentee_id: achievementMentee,
            mentor_id: this.currentMentor.mentor_id,
            title: achievementTitle,
            description: achievementDescription,
            date_awarded: new Date().toISOString(),
            badge_icon: badgeIcon
        };
        
        // Add to achievements
        this.achievements.push(newAchievement);
        
        // Save to localStorage
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
        
        // If viewing mentee details, update the achievements tab
        if (this.selectedMentee && this.selectedMentee.unique_user_no === achievementMentee) {
            this.updateMenteeAchievements(achievementMentee);
        }
        
        // Update mentee list
        this.updateMenteeList();
        
        // Close modal
        closeModal('achievement-modal');
        
        // Log activity
        this.logActivity(`Awarded achievement "${achievementTitle}" to mentee ${this.getMenteeName(achievementMentee)}`);
    }
    
    // Resolve emergency alert
    resolveAlert(alertId) {
        if (confirm('Are you sure you want to mark this alert as resolved?')) {
            const alertIndex = this.emergencyAlerts.findIndex(alert => alert.alert_id === alertId);
            
            if (alertIndex !== -1) {
                // Update alert status
                this.emergencyAlerts[alertIndex].status = 'resolved';
                this.emergencyAlerts[alertIndex].resolution_time = new Date().toISOString();
                
                // Save to localStorage
                localStorage.setItem('emergency_alerts', JSON.stringify(this.emergencyAlerts));
                
                // Update dashboard
                this.updateEmergencyAlerts();
                this.updateDashboardStats();
                
                // Log activity
                const menteeId = this.emergencyAlerts[alertIndex].mentee_id;
                this.logActivity(`Resolved emergency alert from mentee ${this.getMenteeName(menteeId)}`);
            }
        }
    }
    
    // Log activity
    logActivity(description) {
        const newActivity = {
            activity_id: Date.now(), // Use timestamp as ID
            unique_user_no: this.currentUser.unique_user_no,
            timestamp: new Date().toISOString(),
            ip_address: '127.0.0.1', // Mock IP address
            action: description
        };
        
        // Add to activity logs
        this.activityLogs.push(newActivity);
        
        // Save to localStorage
        localStorage.setItem('activity_logs', JSON.stringify(this.activityLogs));
    }
    
    // Initialize and create a new instance of MentorDashboard
    static init() {
        return new MentorDashboard();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    MentorDashboard.init();
}); 