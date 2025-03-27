class MentorDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.updateDateTime();
        this.renderMenteeList();
        this.renderTaskList();
        this.setupEventListeners();
    }

    updateDateTime() {
        const updateTime = () => {
            const now = new Date();
            document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: true 
            });
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

    renderMenteeList() {
        const menteeList = document.getElementById('mentee-list');
        const sampleMentees = [
            { 
                name: 'Alex Johnson', 
                course: 'Computer Science', 
                year: 3, 
                attendance: 85, 
                achievements: 4,
                prn: 'CS2021001'
            },
            { 
                name: 'Sarah Martinez', 
                course: 'Data Science', 
                year: 2, 
                attendance: 92, 
                achievements: 6,
                prn: 'DS2022002'
            },
            { 
                name: 'Michael Chen', 
                course: 'Software Engineering', 
                year: 4, 
                attendance: 75, 
                achievements: 3,
                prn: 'SE2020003'
            }
        ];

        menteeList.innerHTML = sampleMentees.map(mentee => `
            <div class="mentee-card card">
                <div class="mentee-header">
                    <div class="mentee-avatar"><i class="fas fa-user-graduate fa-2x"></i></div>
                    <div class="mentee-info">
                        <h3>${mentee.name}</h3>
                        <p>${mentee.course} - Year ${mentee.year}</p>
                        <div class="mentee-badges">
                            <span class="badge ${this.getStatusClass(mentee.attendance)}">
                                ${this.getAttendanceStatus(mentee.attendance)}
                            </span>
                            <span class="badge badge-info">PRN: ${mentee.prn}</span>
                        </div>
                    </div>
                </div>
                <div class="mentee-body">
                    <div class="mentee-stat">
                        <span>Attendance</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${mentee.attendance}%"></div>
                        </div>
                        <span>${mentee.attendance}%</span>
                    </div>
                    <div class="mentee-achievements">Achievements: ${mentee.achievements}</div>
                </div>
            </div>
        `).join('');
    }

    renderTaskList() {
        const taskList = document.getElementById('task-list');
        const sampleTasks = [
            { title: 'Career Guidance Meeting', dueDate: '2024-04-15', status: 'Pending' },
            { title: 'Internship Preparation Workshop', dueDate: '2024-04-20', status: 'In Progress' },
            { title: 'Research Paper Review', dueDate: '2024-04-25', status: 'Completed' }
        ];

        taskList.innerHTML = sampleTasks.map(task => `
            <div class="task-card">
                <h4>${task.title}</h4>
                <p>Due: ${task.dueDate}</p>
                <span class="badge ${this.getTaskStatusClass(task.status)}">${task.status}</span>
            </div>
        `).join('');
    }

    setupEventListeners() {
        document.getElementById('mentee-filter').addEventListener('change', () => {
            // Future implementation for filtering
            console.log('Mentee filter changed');
        });

        document.getElementById('add-mentee').addEventListener('click', () => {
            alert('Add Mentee functionality will be implemented');
        });

        document.getElementById('create-task').addEventListener('click', () => {
            alert('Create Task functionality will be implemented');
        });
    }

    getStatusClass(attendance) {
        if (attendance >= 90) return 'badge-success';
        if (attendance >= 80) return 'badge-info';
        if (attendance >= 70) return 'badge-warning';
        return 'badge-danger';
    }

    getAttendanceStatus(attendance) {
        if (attendance >= 90) return 'Excellent';
        if (attendance >= 80) return 'Good';
        if (attendance >= 70) return 'Average';
        return 'Needs Improvement';
    }

    getTaskStatusClass(status) {
        switch(status) {
            case 'Completed': return 'badge-success';
            case 'In Progress': return 'badge-info';
            case 'Pending': return 'badge-warning';
            default: return 'badge-secondary';
        }
    }

    static init() {
        return new MentorDashboard();
    }
}

document.addEventListener('DOMContentLoaded', () => MentorDashboard.init());