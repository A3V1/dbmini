// Sample Data Initialization
const SAMPLE_DATA = {
    users: [
        // Admins
        { unique_user_no: 1, name: "Admin One", official_mail_id: 'admin1@college.edu', prn_id: 'PRN001', phone_num: '9876543210', role: 'admin', calendar_id: 'calendar001' },
        { unique_user_no: 2, name: "Admin Two", official_mail_id: 'admin2@college.edu', prn_id: 'PRN002', phone_num: '9876543211', role: 'admin', calendar_id: 'calendar002' },
        // Mentors
        { unique_user_no: 3, name: "Dr. Sarah Johnson", official_mail_id: 'mentor1@college.edu', prn_id: 'PRN003', phone_num: '9876543212', role: 'mentor', calendar_id: 'calendar003' },
        { unique_user_no: 4, name: "Prof. Michael Chen", official_mail_id: 'mentor2@college.edu', prn_id: 'PRN004', phone_num: '9876543213', role: 'mentor', calendar_id: 'calendar004' },
        { unique_user_no: 5, name: "Dr. Emily Brown", official_mail_id: 'mentor3@college.edu', prn_id: 'PRN005', phone_num: '9876543214', role: 'mentor', calendar_id: 'calendar005' },
        // Sample Mentees
        { unique_user_no: 8, name: "John Smith", official_mail_id: 'mentee1@college.edu', prn_id: 'PRN008', phone_num: '9876543217', role: 'mentee', calendar_id: 'calendar008' },
        { unique_user_no: 9, name: "Alice Johnson", official_mail_id: 'mentee2@college.edu', prn_id: 'PRN009', phone_num: '9876543218', role: 'mentee', calendar_id: 'calendar009' },
        { unique_user_no: 10, name: "David Wilson", official_mail_id: 'mentee3@college.edu', prn_id: 'PRN010', phone_num: '9876543219', role: 'mentee', calendar_id: 'calendar010' },
        { unique_user_no: 11, name: "Emma Davis", official_mail_id: 'mentee4@college.edu', prn_id: 'PRN011', phone_num: '9876543220', role: 'mentee', calendar_id: 'calendar011' },
        { unique_user_no: 12, name: "Michael Brown", official_mail_id: 'mentee5@college.edu', prn_id: 'PRN012', phone_num: '9876543221', role: 'mentee', calendar_id: 'calendar012' }
    ],

    mentors: [
        { 
            mentor_id: 1, 
            unique_user_no: 3, 
            room_no: 'Room A101', 
            timetable: 'Mon-Wed: 10AM-1PM', 
            department: 'Computer Science', 
            academic_background: 'PhD in Computer Science from MIT, 10 years of teaching experience' 
        },
        { 
            mentor_id: 2, 
            unique_user_no: 4, 
            room_no: 'Room B202', 
            timetable: 'Tue-Thu: 11AM-2PM', 
            department: 'Mathematics', 
            academic_background: 'PhD in Applied Mathematics, Research focus on Machine Learning' 
        },
        { 
            mentor_id: 3, 
            unique_user_no: 5, 
            room_no: 'Room C303', 
            timetable: 'Mon-Wed: 2PM-5PM', 
            department: 'Physics', 
            academic_background: 'PhD in Theoretical Physics, Former NASA researcher' 
        }
    ],

    mentees: [
        { mentee_id: 1, unique_user_no: 8, mentor_id: 1 },
        { mentee_id: 2, unique_user_no: 9, mentor_id: 1 },
        { mentee_id: 3, unique_user_no: 10, mentor_id: 1 },
        { mentee_id: 4, unique_user_no: 11, mentor_id: 1 },
        { mentee_id: 5, unique_user_no: 12, mentor_id: 1 }
    ],

    mentee_academics: [
        { 
            mentee_id: 1, 
            course: 'B.Tech Computer Science', 
            year: 3, 
            attendance: 92.5, 
            academic_context: 'excellent', 
            academic_background: 'Consistent top performer, particularly strong in programming and algorithms.' 
        },
        { 
            mentee_id: 2, 
            course: 'B.Tech Computer Science', 
            year: 2, 
            attendance: 85.0, 
            academic_context: 'good', 
            academic_background: 'Strong academic record, active in coding competitions.' 
        },
        { 
            mentee_id: 3, 
            course: 'B.Tech Computer Science', 
            year: 3, 
            attendance: 78.5, 
            academic_context: 'average', 
            academic_background: 'Showing improvement in recent assessments, needs support in advanced topics.' 
        },
        { 
            mentee_id: 4, 
            course: 'B.Tech Computer Science', 
            year: 1, 
            attendance: 95.0, 
            academic_context: 'excellent', 
            academic_background: 'Freshman with strong foundation in programming basics.' 
        },
        { 
            mentee_id: 5, 
            course: 'B.Tech Computer Science', 
            year: 2, 
            attendance: 72.0, 
            academic_context: 'poor', 
            academic_background: 'Struggling with core subjects, requires additional support.' 
        }
    ],

    communications: [
        {
            communication_id: 1,
            sender_id: 3,
            receiver_id: 8,
            message_content: "Great progress on your recent project! Let's discuss your approach in our next meeting.",
            message_status: 'delivered',
            attached_file: null,
            type: 'feedback',
            timestamp: '2024-03-15T10:30:00'
        },
        {
            communication_id: 2,
            sender_id: 8,
            receiver_id: 3,
            message_content: "Thank you! I've implemented the suggested improvements. Can we review them together?",
            message_status: 'read',
            attached_file: 'project_update.pdf',
            type: 'one-to-one',
            timestamp: '2024-03-15T11:15:00'
        },
        {
            communication_id: 3,
            sender_id: 3,
            receiver_id: 8,
            message_content: "Important: Next week's department seminar attendance is mandatory.",
            message_status: 'delivered',
            attached_file: 'seminar_schedule.pdf',
            type: 'announcement',
            timestamp: '2024-03-16T09:00:00'
        },
        {
            communication_id: 4,
            sender_id: 9,
            receiver_id: 3,
            message_content: "Need guidance on the advanced algorithms assignment.",
            message_status: 'delivered',
            attached_file: 'assignment_draft.pdf',
            type: 'one-to-one',
            timestamp: '2024-03-16T14:20:00'
        },
        {
            communication_id: 5,
            sender_id: 3,
            receiver_id: 10,
            message_content: "Your recent test performance shows improvement. Keep up the good work!",
            message_status: 'read',
            attached_file: null,
            type: 'feedback',
            timestamp: '2024-03-16T15:45:00'
        }
    ],

    achievements: [
        {
            achievement_id: 1,
            mentor_id: 1,
            mentee_id: 1,
            title: 'Outstanding Project Award',
            description: 'Exceptional performance in semester project on AI applications',
            date_awarded: '2024-03-01',
            badge_icon: 'assets/badges/project-excellence.png'
        },
        {
            achievement_id: 2,
            mentor_id: 1,
            mentee_id: 2,
            title: 'Perfect Attendance',
            description: 'Maintained 100% attendance for the entire semester',
            date_awarded: '2024-02-15',
            badge_icon: 'assets/badges/attendance.png'
        },
        {
            achievement_id: 3,
            mentor_id: 1,
            mentee_id: 3,
            title: 'Most Improved Student',
            description: 'Significant improvement in academic performance',
            date_awarded: '2024-03-10',
            badge_icon: 'assets/badges/improvement.png'
        },
        {
            achievement_id: 4,
            mentor_id: 1,
            mentee_id: 4,
            title: 'Programming Excellence',
            description: 'Outstanding performance in programming assignments',
            date_awarded: '2024-03-12',
            badge_icon: 'assets/badges/programming.png'
        }
    ],

    emergency_alerts: [
        {
            alert_id: 1,
            comm_id: 1,
            alert_reason: 'Request for urgent meeting regarding project deadline',
            alert_status: 'resolved',
            timestamp: '2024-03-10T14:30:00'
        },
        {
            alert_id: 2,
            comm_id: 2,
            alert_reason: 'Need immediate clarification on assignment requirements',
            alert_status: 'pending',
            timestamp: '2024-03-16T11:20:00'
        },
        {
            alert_id: 3,
            comm_id: 4,
            alert_reason: 'Urgent help needed with debugging code',
            alert_status: 'pending',
            timestamp: '2024-03-16T15:30:00'
        }
    ],

    activity_logs: [
        {
            log_id: 1,
            user_id: 3,
            activity: 'Logged in to the system',
            log_time: '2024-03-16T09:00:00',
            ip_address: '192.168.1.100',
            last_login: '2024-03-15T17:30:00'
        },
        {
            log_id: 2,
            user_id: 3,
            activity: 'Reviewed mentee progress',
            log_time: '2024-03-16T10:15:00',
            ip_address: '192.168.1.100',
            last_login: '2024-03-16T09:00:00'
        },
        {
            log_id: 3,
            user_id: 3,
            activity: 'Awarded achievement',
            log_time: '2024-03-16T11:30:00',
            ip_address: '192.168.1.100',
            last_login: '2024-03-16T09:00:00'
        },
        {
            log_id: 4,
            user_id: 3,
            activity: 'Scheduled meeting',
            log_time: '2024-03-16T14:20:00',
            ip_address: '192.168.1.100',
            last_login: '2024-03-16T09:00:00'
        },
        {
            log_id: 5,
            user_id: 3,
            activity: 'Sent feedback',
            log_time: '2024-03-16T15:45:00',
            ip_address: '192.168.1.100',
            last_login: '2024-03-16T09:00:00'
        }
    ]
};

// Initialize sample data in localStorage
function initializeSampleData() {
    // Clear existing data
    clearAllData();
    
    // Set new data
    Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
    });

    // Set current user (for demo purposes, set as first mentor)
    const currentUser = SAMPLE_DATA.users.find(u => u.role === 'mentor');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Clear all data from localStorage
function clearAllData() {
    Object.keys(SAMPLE_DATA).forEach(key => {
        localStorage.removeItem(key);
    });
    localStorage.removeItem('currentUser');
}

// Initialize data when the script loads
initializeSampleData(); 