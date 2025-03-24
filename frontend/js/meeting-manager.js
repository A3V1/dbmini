class MeetingManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.communications = JSON.parse(localStorage.getItem('communications')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.mentors = JSON.parse(localStorage.getItem('mentors')) || [];
        this.mentees = JSON.parse(localStorage.getItem('mentees')) || [];
        
        this.initializeEventListeners();
        this.setupNotifications();
    }

    initializeEventListeners() {
        // Meeting request form
        document.getElementById('meeting-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMeetingSubmit(e);
        });

        // Meeting actions
        document.getElementById('request-meeting').addEventListener('click', () => {
            this.showMeetingModal();
        });

        document.getElementById('request-first-meeting').addEventListener('click', () => {
            this.showMeetingModal();
        });

        // Close modal handlers
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                this.closeModal(button.closest('.modal').id);
            });
        });

        // Modal outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Meeting type change handler
        document.getElementById('meeting-type').addEventListener('change', (e) => {
            this.handleMeetingTypeChange(e.target.value);
        });

        // Meeting mode change handler
        document.getElementById('meeting-mode').addEventListener('change', (e) => {
            this.handleMeetingModeChange(e.target.value);
        });

        // Date and time validation
        document.getElementById('meeting-date').addEventListener('change', () => {
            this.validateDateTime();
        });
        document.getElementById('meeting-time').addEventListener('change', () => {
            this.validateDateTime();
        });
    }

    setupNotifications() {
        // Check for upcoming meetings every minute
        setInterval(() => {
            this.checkUpcomingMeetings();
        }, 60000);
    }

    checkUpcomingMeetings() {
        const now = new Date();
        const meetings = this.communications.filter(comm => 
            comm.type === 'meeting_req' &&
            comm.message_status === 'approved' &&
            !comm.notified
        );

        meetings.forEach(meeting => {
            const meetingTime = new Date(meeting.timestamp);
            const timeDiff = meetingTime.getTime() - now.getTime();
            const minutesDiff = Math.floor(timeDiff / (1000 * 60));

            if (minutesDiff === 15) {
                this.showNotification('Meeting Reminder', `Your meeting "${meeting.title}" starts in 15 minutes.`);
                meeting.notified = true;
                this.saveCommunications();
            }
        });
    }

    showNotification(title, message) {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body: message });
                }
            });
        }
    }

    validateDateTime() {
        const dateInput = document.getElementById('meeting-date');
        const timeInput = document.getElementById('meeting-time');
        const now = new Date();
        const selected = new Date(`${dateInput.value}T${timeInput.value}`);

        if (selected <= now) {
            alert('Please select a future date and time for the meeting.');
            dateInput.value = this.formatDateForInput(new Date(now.getTime() + 24 * 60 * 60 * 1000));
            timeInput.value = '10:00';
        }
    }

    handleMeetingTypeChange(type) {
        const agendaInput = document.getElementById('meeting-agenda');
        const durationSelect = document.getElementById('meeting-duration');

        switch (type) {
            case 'emergency':
                agendaInput.placeholder = 'Please describe the emergency situation...';
                durationSelect.value = '30';
                this.setEmergencyDefaults();
                break;
            case 'academic-review':
                agendaInput.placeholder = 'Topics to review: grades, assignments, progress...';
                durationSelect.value = '60';
                break;
            case 'project-discussion':
                agendaInput.placeholder = 'Project details, challenges, requirements...';
                durationSelect.value = '90';
                break;
            default:
                agendaInput.placeholder = 'Please provide details about what you\'d like to discuss';
                durationSelect.value = '60';
        }
    }

    handleMeetingModeChange(mode) {
        const locationSection = document.getElementById('meeting-location-section');
        const linkSection = document.getElementById('meeting-link-section');

        if (mode === 'offline') {
            locationSection.style.display = 'block';
            linkSection.style.display = 'none';
        } else {
            locationSection.style.display = 'none';
            linkSection.style.display = 'block';
        }
    }

    setEmergencyDefaults() {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        
        document.getElementById('meeting-date').value = this.formatDateForInput(now);
        document.getElementById('meeting-time').value = this.formatTimeForInput(now);
        document.getElementById('meeting-priority').value = 'urgent';
        document.getElementById('meeting-mode').value = 'online';
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    formatTimeForInput(date) {
        return date.toTimeString().slice(0, 5);
    }

    showMeetingModal(isEmergency = false) {
        const modal = document.getElementById('meeting-modal');
        const form = document.getElementById('meeting-form');
        
        form.reset();
        
        if (isEmergency) {
            document.getElementById('meeting-type').value = 'emergency';
            this.handleMeetingTypeChange('emergency');
        } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0);
            
            document.getElementById('meeting-date').value = this.formatDateForInput(tomorrow);
            document.getElementById('meeting-time').value = '10:00';
        }
        
        modal.style.display = 'flex';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    handleMeetingSubmit(event) {
        const formData = new FormData(event.target);
        const meetingData = {
            title: formData.get('meeting-title'),
            type: formData.get('meeting-type'),
            mode: formData.get('meeting-mode'),
            date: formData.get('meeting-date'),
            time: formData.get('meeting-time'),
            duration: formData.get('meeting-duration'),
            agenda: formData.get('meeting-agenda'),
            priority: formData.get('meeting-priority')
        };

        if (this.validateMeetingData(meetingData)) {
            this.createMeetingRequest(meetingData);
            this.closeModal('meeting-modal');
            this.updateMeetingList();
        }
    }

    validateMeetingData(data) {
        const meetingDateTime = new Date(`${data.date}T${data.time}`);
        const now = new Date();

        if (meetingDateTime <= now) {
            alert('Please select a future date and time for the meeting.');
            return false;
        }

        if (data.type === 'emergency' && data.priority !== 'urgent') {
            alert('Emergency meetings must have urgent priority.');
            return false;
        }

        return true;
    }

    createMeetingRequest(data) {
        const mentee = this.mentees.find(m => m.unique_user_no === this.currentUser.unique_user_no);
        if (!mentee) {
            alert('Error: Could not find your mentor information.');
            return;
        }

        const mentor = this.mentors.find(m => m.mentor_id === mentee.mentor_id);
        if (!mentor) {
            alert('Error: Could not find your mentor information.');
            return;
        }

        const meetingContent = this.formatMeetingContent(data);
        const newMeeting = {
            communication_id: Date.now(),
            sender_id: this.currentUser.unique_user_no,
            receiver_id: mentor.unique_user_no,
            message_content: meetingContent,
            message_status: 'sent',
            attached_file: null,
            type: 'meeting_req',
            timestamp: `${data.date}T${data.time}:00`,
            title: data.title,
            meeting_data: {
                type: data.type,
                mode: data.mode,
                duration: data.duration,
                priority: data.priority
            }
        };

        this.communications.push(newMeeting);
        this.saveCommunications();
        this.logActivity(`Requested meeting: ${data.title}`);
    }

    formatMeetingContent(data) {
        return `${data.title}
Type: ${data.type}
Mode: ${data.mode}
Date: ${data.date}
Time: ${data.time}
Duration: ${data.duration} minutes
Priority: ${data.priority}

Agenda:
${data.agenda}`;
    }

    updateMeetingList() {
        const container = document.getElementById('meeting-list');
        const noMeetingsMessage = document.getElementById('no-meetings-message');
        
        const meetings = this.communications.filter(comm => 
            (comm.receiver_id === this.currentUser.unique_user_no || 
             comm.sender_id === this.currentUser.unique_user_no) && 
            comm.type === 'meeting_req'
        );

        if (meetings.length === 0) {
            noMeetingsMessage.style.display = 'flex';
            container.innerHTML = '';
            return;
        }

        noMeetingsMessage.style.display = 'none';
        container.innerHTML = meetings.map(meeting => this.createMeetingCard(meeting)).join('');
    }

    createMeetingCard(meeting) {
        const otherPartyId = meeting.sender_id === this.currentUser.unique_user_no ? 
            meeting.receiver_id : meeting.sender_id;
        const otherParty = this.users.find(user => user.unique_user_no === otherPartyId);
        
        const meetingData = meeting.meeting_data || this.parseMeetingContent(meeting.message_content);
        const dateTime = new Date(meeting.timestamp);

        return `
            <div class="meeting-item" onclick="meetingManager.showMeetingDetails(${meeting.communication_id})">
                <div class="meeting-icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="meeting-content">
                    <div class="meeting-header">
                        <h3 class="meeting-title">${meeting.title}</h3>
                        <span class="meeting-status ${this.getStatusClass(meeting.message_status)}">
                            ${this.getStatusText(meeting.message_status)}
                        </span>
                    </div>
                    <div class="meeting-details">
                        <div class="meeting-detail">
                            <i class="fas fa-user"></i>
                            <span>With: ${otherParty ? otherParty.name : 'Unknown'}</span>
                        </div>
                        <div class="meeting-detail">
                            <i class="fas fa-clock"></i>
                            <span>${this.formatDateTime(dateTime)}</span>
                        </div>
                        <div class="meeting-detail">
                            <i class="fas fa-tag"></i>
                            <span>${meetingData.type}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    parseMeetingContent(content) {
        const lines = content.split('\n');
        const data = {
            type: 'general-mentoring',
            mode: 'online',
            duration: '60',
            priority: 'normal'
        };

        lines.forEach(line => {
            if (line.startsWith('Type:')) data.type = line.split(':')[1].trim();
            if (line.startsWith('Mode:')) data.mode = line.split(':')[1].trim();
            if (line.startsWith('Duration:')) data.duration = line.split(':')[1].trim().split(' ')[0];
            if (line.startsWith('Priority:')) data.priority = line.split(':')[1].trim();
        });

        return data;
    }

    getStatusClass(status) {
        switch (status) {
            case 'approved': return 'scheduled';
            case 'rejected': return 'cancelled';
            case 'completed': return 'completed';
            default: return 'pending';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'approved': return 'Scheduled';
            case 'rejected': return 'Cancelled';
            case 'completed': return 'Completed';
            default: return 'Pending';
        }
    }

    formatDateTime(date) {
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    saveCommunications() {
        localStorage.setItem('communications', JSON.stringify(this.communications));
    }

    logActivity(activity) {
        const activityLogs = JSON.parse(localStorage.getItem('activity_logs')) || [];
        const newLog = {
            log_id: activityLogs.length + 1,
            user_id: this.currentUser.unique_user_no,
            activity: activity,
            log_time: new Date().toISOString(),
            ip_address: '192.168.1.1',
            last_login: this.currentUser.last_login || new Date().toISOString()
        };
        
        activityLogs.push(newLog);
        localStorage.setItem('activity_logs', JSON.stringify(activityLogs));
    }
}

// Initialize meeting manager
const meetingManager = new MeetingManager(); 