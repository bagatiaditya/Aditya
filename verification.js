// Firebase Authentication & Firestore References
let auth;
let db;
let storage;

// DOM Elements
const roleBtns = document.querySelectorAll('.role-btn');
const roleSections = document.querySelectorAll('.role-section');
const methodTabs = document.querySelectorAll('.method-tab');
const methodPanels = document.querySelectorAll('.method-panel');
const uploadZone = document.querySelector('.upload-zone');
const startScanBtn = document.getElementById('startScanBtn');
const verifyHashBtn = document.getElementById('verifyHashBtn');
const issueCertificateForm = document.getElementById('issueCertificateForm');
const biometricAuthBtn = document.getElementById('biometricAuthBtn');
const fingerprint = document.querySelector('.fingerprint');
const scanProgress = document.querySelector('.scan-progress .progress');
const statusText = document.querySelector('.status-text');
const credentialsList = document.querySelector('.credentials-list');
const credentialContainer = document.getElementById('credential-container');

// Initialize Firebase
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    setupEventListeners();
    
    // Select student role by default if no other role is selected
    setTimeout(() => {
        const activeRole = document.querySelector('.role-btn.active');
        if (!activeRole) {
            document.getElementById('studentRole').click();
        }
    }, 100);
    
    checkAuthState();
});

// Initialize Firebase with config
function initializeFirebase() {
    try {
        // Use the global Firebase auth that was initialized in firebase-config.js
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        showNotification('Error initializing application. Please try again later.', 'error');
    }
}

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.email);
            // Update user display
            document.getElementById('userDisplay').textContent = user.email;
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'inline-block';
            
            // Check user's role in Firestore
            checkUserRole(user.uid);
        } else {
            // User is signed out
            console.log('User is signed out');
            document.getElementById('userDisplay').textContent = 'Guest';
            document.getElementById('loginBtn').style.display = 'inline-block';
            document.getElementById('logoutBtn').style.display = 'none';
        }
    });
}

// Check user role in Firestore
async function checkUserRole(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            const userRole = userData.role || 'student';
            
            // Select the appropriate role button
            if (userRole === 'university') {
                document.getElementById('universityRole').click();
            } else if (userRole === 'student') {
                document.getElementById('studentRole').click();
            } else if (userRole === 'employer') {
                document.getElementById('employerRole').click();
            }
        } else {
            console.log('No user data found');
            // Default to student role
            document.getElementById('studentRole').click();
        }
    } catch (error) {
        console.error('Error checking user role:', error);
        showNotification('Error retrieving user data', 'error');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Role switcher
    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchRole(btn);
        });
    });
    
    // Method tabs
    methodTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const method = tab.getAttribute('data-method');
            switchMethod(tab, method);
        });
    });
    
    // File upload zone
    if (uploadZone) {
        uploadZone.addEventListener('click', () => {
            document.getElementById('certificateFile').click();
        });
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
        
        const certificateFile = document.getElementById('certificateFile');
        if (certificateFile) {
            certificateFile.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    handleFileUpload(e.target.files[0]);
                }
            });
        }
    }
    
    // QR Scanner button
    if (startScanBtn) {
        startScanBtn.addEventListener('click', startQrScanner);
    }
    
    // Hash verification
    if (verifyHashBtn) {
        verifyHashBtn.addEventListener('click', verifyHash);
    }
    
    // Issue certificate form
    if (issueCertificateForm) {
        issueCertificateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            issueCertificate();
        });
    }
    
    // Biometric authentication
    if (biometricAuthBtn) {
        biometricAuthBtn.addEventListener('click', startBiometricAuth);
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut()
                .then(() => {
                    console.log('User signed out');
                    window.location.href = 'index.html';
                })
                .catch(error => {
                    console.error('Error signing out:', error);
                    showNotification('Error signing out. Please try again.', 'error');
                });
        });
    }
}

// Switch role tabs
function switchRole(clickedBtn) {
    console.log("Switching role to:", clickedBtn.id);
    
    // Update buttons
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    clickedBtn.classList.add('active');
    
    // Determine the role from the button id
    let role;
    if (clickedBtn.id === 'universityRole') {
        role = 'university';
    } else if (clickedBtn.id === 'studentRole') {
        role = 'student';
    } else if (clickedBtn.id === 'employerRole') {
        role = 'employer';
    }
    
    console.log("Selected role:", role);
    
    // Update sections
    document.querySelectorAll('.role-section').forEach(section => {
        section.style.display = 'none';
    });
    
    if (role) {
        const sectionElement = document.getElementById(`${role}Section`);
        console.log("Showing section:", `${role}Section`, sectionElement);
        if (sectionElement) {
            sectionElement.style.display = 'block';
        }
    }
}

// Switch verification method
function switchMethod(clickedTab, method) {
    // Update tabs
    methodTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    clickedTab.classList.add('active');
    
    // Update panels
    methodPanels.forEach(panel => {
        panel.classList.remove('active');
    });
    const methodPanel = document.getElementById(`${method}Panel`);
    if (methodPanel) {
        methodPanel.classList.add('active');
    }
    
    // Hide verification process when switching methods
    const verificationProcess = document.querySelector('.verification-process');
    if (verificationProcess) {
        verificationProcess.style.display = 'none';
    }
}

// Handle file upload
function handleFileUpload(file) {
    if (!file) return;
    
    // Update UI to show selected file
    const fileDetails = document.querySelector('.file-details');
    const fileNameElement = document.getElementById('selected-filename');
    
    if (fileNameElement && fileDetails) {
        fileNameElement.textContent = file.name;
        fileDetails.style.display = 'flex';
    }
    
    // Add click event to verify button
    const verifyFileBtn = document.getElementById('verifyFileBtn');
    if (verifyFileBtn) {
        verifyFileBtn.onclick = () => startVerificationProcess(file);
    }
}

// Start QR code scanner
function startQrScanner() {
    const scannerPlaceholder = document.querySelector('.scanner-placeholder');
    if (!scannerPlaceholder) return;
    
    // In a real implementation, this would initialize a camera-based QR scanner
    // For this demo, we'll simulate a successful scan after a delay
    
    scannerPlaceholder.innerHTML = '<i class="fas fa-camera fa-pulse"></i><p>Scanning...</p>';
    
    setTimeout(() => {
        // Simulate a successful scan
        scannerPlaceholder.innerHTML = '<i class="fas fa-check-circle"></i><p>QR Code detected!</p>';
        
        // Start verification process with the QR data
        startVerificationProcess({ type: 'qr', data: 'sample-credential-hash-123456' });
    }, 3000);
}

// Verify hash
function verifyHash() {
    const hashInput = document.getElementById('hashInput');
    if (!hashInput) return;
    
    const hash = hashInput.value.trim();
    
    if (!hash) {
        showNotification('Please enter a valid hash', 'warning');
        return;
    }
    
    // Start verification with the hash
    startVerificationProcess({ type: 'hash', data: hash });
}

// Start verification process
function startVerificationProcess(data) {
    // Show verification process container
    const verificationProcess = document.querySelector('.verification-process');
    if (!verificationProcess) return;
    
    verificationProcess.style.display = 'block';
    
    // Get verification step elements
    const blockchainVerification = document.getElementById('blockchainVerification');
    const integrityCheck = document.getElementById('integrityCheck');
    const issuerVerification = document.getElementById('issuerVerification');
    const fraudDetection = document.getElementById('fraudDetection');
    
    if (!blockchainVerification || !integrityCheck || !issuerVerification || !fraudDetection) return;
    
    // Reset all steps to pending
    [blockchainVerification, integrityCheck, issuerVerification, fraudDetection].forEach(step => {
        step.className = 'verification-step status-pending';
    });
    
    // Start blockchain verification
    blockchainVerification.className = 'verification-step status-processing';
    
    setTimeout(() => {
        // Complete blockchain verification
        blockchainVerification.className = 'verification-step status-success';
        
        // Start integrity check
        integrityCheck.className = 'verification-step status-processing';
        
        setTimeout(() => {
            // Complete integrity check
            integrityCheck.className = 'verification-step status-success';
            
            // Start issuer verification
            issuerVerification.className = 'verification-step status-processing';
            
            setTimeout(() => {
                // Complete issuer verification
                issuerVerification.className = 'verification-step status-success';
                
                // Start fraud detection
                fraudDetection.className = 'verification-step status-processing';
                
                setTimeout(() => {
                    // Determine if verification is successful (70% chance of success)
                    const isVerified = Math.random() > 0.3;
                    
                    if (isVerified) {
                        fraudDetection.className = 'verification-step status-success';
                        
                        // Show success result
                        setTimeout(() => {
                            showVerificationResult(true);
                        }, 1000);
                    } else {
                        fraudDetection.className = 'verification-step status-error';
                        
                        // Show failure result
                        setTimeout(() => {
                            showVerificationResult(false);
                        }, 1000);
                    }
                }, 1500);
            }, 1500);
        }, 1500);
    }, 1500);
}

// Show verification result
function showVerificationResult(isVerified) {
    const modal = document.getElementById('verificationResultModal');
    if (!modal) return;
    
    const resultIcon = modal.querySelector('.result-icon i');
    const resultTitle = modal.querySelector('.result-title h3');
    const resultMessage = modal.querySelector('.result-title p');
    const verifiedDetails = document.getElementById('verifiedDetails');
    
    if (!resultIcon || !resultTitle || !resultMessage || !verifiedDetails) return;
    
    if (isVerified) {
        resultIcon.className = 'fas fa-check-circle';
        resultIcon.style.color = 'var(--success-color, #28a745)';
        resultTitle.textContent = 'Certificate Verified';
        resultMessage.textContent = 'This certificate is valid and has not been tampered with.';
        
        // Show and populate details
        verifiedDetails.style.display = 'block';
        document.getElementById('verifiedName').textContent = 'Bachelor of Science in Computer Science';
        document.getElementById('verifiedIssuer').textContent = 'MIT University';
        document.getElementById('verifiedStudent').textContent = 'John Smith';
        document.getElementById('verifiedDate').textContent = '2023-05-15';
    } else {
        resultIcon.className = 'fas fa-times-circle';
        resultIcon.style.color = 'var(--error-color, #dc3545)';
        resultTitle.textContent = 'Verification Failed';
        resultMessage.textContent = 'This certificate is invalid or has been tampered with.';
        
        // Hide details
        verifiedDetails.style.display = 'none';
    }
    
    // Show the modal
    modal.classList.add('active');
}

// Biometric authentication
function startBiometricAuth() {
    if (!fingerprint || !statusText || !scanProgress) return;
    
    fingerprint.classList.add('scanning');
    statusText.textContent = 'Scanning your fingerprint...';
    
    // Animate progress bar
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        scanProgress.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Authentication successful
            completeAuthentication();
        }
    }, 150);
}

// Complete authentication and show credentials
function completeAuthentication() {
    if (!fingerprint || !statusText) return;
    
    fingerprint.classList.remove('scanning');
    fingerprint.classList.add('authenticated');
    statusText.textContent = 'Authentication successful!';
    
    // Show credentials after successful authentication
    setTimeout(() => {
        const biometricAuth = document.querySelector('.biometric-auth');
        const credentialContainer = document.getElementById('credential-container');
        
        if (biometricAuth && credentialContainer) {
            biometricAuth.style.display = 'none';
            credentialContainer.style.display = 'block';
            
            // Load student credentials
            loadStudentCredentials();
        }
    }, 1000);
}

// Check if student is authenticated and load credentials
function checkAndLoadStudentCredentials() {
    const user = auth.currentUser;
    
    const biometricAuth = document.querySelector('.biometric-auth');
    const credentialContainer = document.getElementById('credential-container');
    
    if (!biometricAuth || !credentialContainer) return;
    
    // For demonstration, always show biometric auth first
    biometricAuth.style.display = 'block';
    credentialContainer.style.display = 'none';
}

// Load student credentials
function loadStudentCredentials() {
    // In a real app, this would fetch actual credentials from Firestore
    // For this demo, we'll display sample data
    const credentials = [
        {
            id: 'cred001',
            name: 'Bachelor of Computer Science',
            issuer: 'MIT University',
            issueDate: '2023-05-15',
            type: 'degree'
        },
        {
            id: 'cred002',
            name: 'Web Development Certification',
            issuer: 'Stanford University',
            issueDate: '2023-08-10',
            type: 'certificate'
        },
        {
            id: 'cred003',
            name: 'Machine Learning Specialization',
            issuer: 'Google Academy',
            issueDate: '2023-11-20',
            type: 'certificate'
        }
    ];
    
    // Remove empty state if it exists
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Get the credentials list element
    const credentialsList = document.querySelector('.credentials-list');
    if (!credentialsList) return;
    
    // Clear existing credentials
    credentialsList.innerHTML = '';
    
    // Add credentials
    credentials.forEach(credential => {
        const card = document.createElement('div');
        card.className = 'credential-card';
        card.innerHTML = `
            <div class="credential-icon">
                <i class="fas fa-${credential.type === 'degree' ? 'graduation-cap' : 'certificate'}"></i>
            </div>
            <div class="credential-details">
                <h4>${credential.name}</h4>
                <p>Issued by: ${credential.issuer}</p>
                <p>Date: ${credential.issueDate}</p>
            </div>
            <div class="credential-actions">
                <button class="btn view-btn" data-id="${credential.id}">View</button>
                <button class="btn share-btn" data-id="${credential.id}">Share</button>
            </div>
        `;
        
        credentialsList.appendChild(card);
        
        // Add event listeners
        card.querySelector('.view-btn').addEventListener('click', () => {
            showCredentialDetails(credential);
        });
        
        card.querySelector('.share-btn').addEventListener('click', () => {
            shareCredential(credential);
        });
    });
}

// Show credential details
function showCredentialDetails(credential) {
    const modal = document.getElementById('credentialModal');
    if (!modal) return;
    
    // Populate modal with credential details
    const credentialName = document.getElementById('credentialName');
    const credentialIssuer = document.getElementById('credentialIssuer');
    const credentialStudent = document.getElementById('credentialStudent');
    const credentialType = document.getElementById('credentialType');
    const credentialDate = document.getElementById('credentialDate');
    const credentialHash = document.getElementById('credentialHash');
    
    if (credentialName) credentialName.textContent = credential.name;
    if (credentialIssuer) credentialIssuer.textContent = credential.issuer;
    if (credentialStudent) credentialStudent.textContent = auth.currentUser ? auth.currentUser.displayName || auth.currentUser.email : 'John Smith';
    if (credentialType) credentialType.textContent = credential.type.charAt(0).toUpperCase() + credential.type.slice(1);
    if (credentialDate) credentialDate.textContent = credential.issueDate;
    if (credentialHash) credentialHash.textContent = `e7d81c34a7b4f149b5abe4f1f7c7b783cc3ea94149d9a3${credential.id}f4c9b773`;
    
    // Show the modal
    modal.classList.add('active');
}

// Share credential
function shareCredential(credential) {
    // In a real app, this would open sharing options
    alert(`Sharing credential: ${credential.name} - This feature is coming soon!`);
}

// Issue certificate (university section)
function issueCertificate() {
    const universityName = document.getElementById('universityName');
    const studentEmail = document.getElementById('studentEmail');
    const certificateName = document.getElementById('certificateName');
    const certificateType = document.getElementById('certificateType');
    
    if (!universityName || !studentEmail || !certificateName || !certificateType) return;
    
    if (!universityName.value || !studentEmail.value || !certificateName.value || !certificateType.value) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Simulate issuing certificate
    const issueButton = issueCertificateForm.querySelector('button[type="submit"]');
    if (!issueButton) return;
    
    const originalText = issueButton.textContent;
    issueButton.textContent = 'Processing...';
    issueButton.disabled = true;
    
    setTimeout(() => {
        // Update counters
        const totalIssuedCount = document.getElementById('totalIssuedCount');
        const activeCount = document.getElementById('activeCount');
        const recentActivityCount = document.getElementById('recentActivityCount');
        
        if (totalIssuedCount) totalIssuedCount.textContent = parseInt(totalIssuedCount.textContent) + 1;
        if (activeCount) activeCount.textContent = parseInt(activeCount.textContent) + 1;
        if (recentActivityCount) recentActivityCount.textContent = parseInt(recentActivityCount.textContent) + 1;
        
        // Reset form
        issueCertificateForm.reset();
        
        // Reset button
        issueButton.textContent = originalText;
        issueButton.disabled = false;
        
        // Show success notification
        showNotification('Certificate issued successfully!', 'success');
    }, 2000);
}

// Load university stats
function loadUniversityStats() {
    // In a real app, these would be loaded from Firestore
    // For demo, we'll use placeholder values
    const totalIssuedCount = document.getElementById('totalIssuedCount');
    const activeCount = document.getElementById('activeCount');
    const recentActivityCount = document.getElementById('recentActivityCount');
    
    if (totalIssuedCount) totalIssuedCount.textContent = '126';
    if (activeCount) activeCount.textContent = '122';
    if (recentActivityCount) recentActivityCount.textContent = '8';
}

// Show notification
function showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // In a real implementation, this would show a toast or notification
    // For now, we'll use an alert
    alert(message);
}

// Wait for the page to fully load
window.onload = function() {
    console.log("Window loaded - applying role fix");
    
    // Get the role buttons
    const universityRole = document.getElementById('universityRole');
    const studentRole = document.getElementById('studentRole');
    const employerRole = document.getElementById('employerRole');
    
    // Get the role sections
    const universitySection = document.getElementById('universitySection');
    const studentSection = document.getElementById('studentSection');
    const employerSection = document.getElementById('employerSection');
    
    // Function to handle role selection
    function handleRoleSelect(role) {
        console.log("Selecting role:", role);
        
        // Hide all sections
        if (universitySection) universitySection.style.display = 'none';
        if (studentSection) studentSection.style.display = 'none';
        if (employerSection) employerSection.style.display = 'none';
        
        // Remove active class from all buttons
        if (universityRole) universityRole.classList.remove('active');
        if (studentRole) studentRole.classList.remove('active');
        if (employerRole) employerRole.classList.remove('active');
        
        // Show selected section and activate button
        if (role === 'university') {
            if (universitySection) universitySection.style.display = 'block';
            if (universityRole) universityRole.classList.add('active');
        } else if (role === 'student') {
            if (studentSection) studentSection.style.display = 'block';
            if (studentRole) studentRole.classList.add('active');
        } else if (role === 'employer') {
            if (employerSection) employerSection.style.display = 'block';
            if (employerRole) employerRole.classList.add('active');
        }
    }
    
    // Add click handlers
    if (universityRole) {
        universityRole.onclick = function() {
            handleRoleSelect('university');
        };
    }
    
    if (studentRole) {
        studentRole.onclick = function() {
            handleRoleSelect('student');
        };
    }
    
    if (employerRole) {
        employerRole.onclick = function() {
            handleRoleSelect('employer');
        };
    }
    
    // Select student role by default
    handleRoleSelect('student');
};