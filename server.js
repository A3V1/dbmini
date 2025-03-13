const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the frontend directory
app.use(express.static('frontend'));

// Route handler for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'mit-wpu-login.html'));
});

// Route handlers for different pages
const pages = [
    'admin-dashboard',
    'mentor-dashboard',
    'mentee-dashboard',
    'meeting-schedule',
    'student-profile'
];

// Handle both with and without .html extension
pages.forEach(page => {
    // Handle without .html
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', `${page}.html`));
    });
    // Handle with .html
    app.get(`/${page}.html`, (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', `${page}.html`));
    });
});

// Handle 404 - Page Not Found
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', 'mit-wpu-login.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 