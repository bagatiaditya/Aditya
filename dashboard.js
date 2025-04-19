document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, update UI
            updateUserInfo(user);
        } else {
            // No user is signed in, redirect to login
            window.location.href = 'login.html';
        }
    });

    // Update user information in the UI
    function updateUserInfo(user) {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = user.displayName || user.email;
        }
    }

    // Toggle sidebar
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            document.querySelector('.dashboard-container').classList.toggle('sidebar-collapse');
        });
    }

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            firebase.auth().signOut().then(() => {
                // Sign-out successful, redirect to login
                window.location.href = 'login.html';
            }).catch((error) => {
                // An error happened
                console.error('Error during sign out:', error);
            });
        });
    }

    // Add click event to action buttons (for future development)
    const actionButtons = document.querySelectorAll('.action-card .tech-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.parentElement.querySelector('h4').textContent;
            
            // Show a techno-style notification instead of an alert
            showTechNotification(`${action} protocol initiated. Implementation pending.`);
        });
    });

    // Add click listener to sidebar items (for future development)
    const sidebarItems = document.querySelectorAll('.tech-nav-item:not(.active) a');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            document.querySelectorAll('.tech-nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.parentElement.classList.add('active');
            
            const feature = this.querySelector('span').textContent;
            showTechNotification(`${feature} module access requested. Implementation pending.`);
        });
    });

    // Show techno-style notification
    function showTechNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'tech-notification';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-terminal';
        
        const messageText = document.createElement('span');
        messageText.className = 'mono-text';
        messageText.textContent = message;
        
        notification.appendChild(icon);
        notification.appendChild(messageText);
        
        // Add notification to the page
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Remove after timeout
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 4000);
    }

    // Fetch user stats from Firestore (placeholder for future implementation)
    function fetchUserStats(userId) {
        // This is a placeholder for future implementation
        // Will fetch actual stats from Firestore
        
        // For demo purposes, we'll just show some mock data after a delay
        setTimeout(() => {
            const statCounts = document.querySelectorAll('.stat-count');
            
            // Set mock values with counting animation
            if (statCounts.length >= 4) {
                animateCounter(statCounts[0], 0, 3, 1500); // My Credentials
                animateCounter(statCounts[1], 0, 2, 1500); // Shared
                animateCounter(statCounts[2], 0, 5, 1500); // Verified
                animateCounter(statCounts[3], 0, 1, 1500); // Pending
            }
        }, 1000);
    }
    
    // Animate counter for tech effect
    function animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    // Fetch recent activities (placeholder for future implementation)
    function fetchRecentActivities(userId) {
        // This would fetch activities from Firestore in the real implementation
        
        // For now, we'll leave the empty state message
    }

    // Mock data loading
    setTimeout(() => {
        const user = firebase.auth().currentUser;
        if (user) {
            fetchUserStats(user.uid);
            fetchRecentActivities(user.uid);
        }
    }, 1000);
    
    // Add tech theme-specific styles dynamically
    const techStyles = document.createElement('style');
    techStyles.textContent = `
        .tech-notification {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: var(--tech-medium);
            color: var(--tech-accent);
            padding: 15px 20px;
            border-left: 3px solid var(--tech-accent);
            clip-path: polygon(
                0 10px, 
                10px 0, 
                100% 0, 
                100% calc(100% - 10px), 
                calc(100% - 10px) 100%, 
                0 100%
            );
            display: flex;
            align-items: center;
            max-width: 400px;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .tech-notification.visible {
            transform: translateY(0);
            opacity: 1;
        }
        
        .tech-notification i {
            margin-right: 10px;
            font-size: 16px;
        }
    `;
    document.head.appendChild(techStyles);
}); 