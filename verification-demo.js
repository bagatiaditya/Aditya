// Certificate data storage (simulating blockchain)
let blockchainCertificates = [];

// Student data
const student = {
    name: "PRADYUMNA KULKARNI",
    id: "2BL23CS088",
    university: "VTU - Visvesvaraya Technological University"
};

// Subject results sample
const sampleSubjects = [
    { code: "BCS301", name: "MATHEMATICS FOR COMPUTER SCIENCE", internalMarks: 39, externalMarks: 24, total: 63, result: "P" },
    { code: "BCS302", name: "DIGITAL DESIGN & COMPUTER ORGANIZATION", internalMarks: 32, externalMarks: 22, total: 54, result: "P" },
    { code: "BCS303", name: "OPERATING SYSTEMS", internalMarks: 44, externalMarks: 25, total: 69, result: "P" },
    { code: "BCS304", name: "DATA STRUCTURES AND APPLICATIONS", internalMarks: 43, externalMarks: 9, total: 52, result: "F" },
    { code: "BCSL305", name: "DATA STRUCTURES LAB", internalMarks: 37, externalMarks: 32, total: 69, result: "P" },
    { code: "BSCK307", name: "SOCIAL CONNECT AND RESPONSIBILITY", internalMarks: 100, externalMarks: 0, total: 100, result: "P" },
    { code: "BPEK359", name: "PHYSICAL EDUCATION", internalMarks: 81, externalMarks: 0, total: 81, result: "P" },
    { code: "BCS306A", name: "OBJECT ORIENTED PROGRAMMING WITH JAVA", internalMarks: 39, externalMarks: 25, total: 64, result: "P" },
    { code: "BCS358C", name: "PROJECT MANAGEMENT WITH GIT", internalMarks: 45, externalMarks: 40, total: 85, result: "P" }
];

// Simulated Google Drive integration
const googleDrive = {
    uploadFile: function(fileName, fileData) {
        console.log(`Uploading ${fileName} to Google Drive...`);
        // Simulate a Google Drive file ID
        return "1" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },
    shareFile: function(fileId, email) {
        console.log(`Sharing file ${fileId} with ${email}`);
        return `https://drive.google.com/file/d/${fileId}/view`;
    },
    generateViewLink: function(fileId) {
        return `https://drive.google.com/file/d/${fileId}/view`;
    }
};

// PDF certificate templates
const certificateTemplates = {
    standard: "Blue professional design with university seal",
    honor: "Gold-bordered design with honors distinction",
    distinction: "Red and gold design with highest distinction marking"
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Setup role selection
    setupRoleSelection();
    
    // Setup event listeners for each role's actions
    setupUniversityActions();
    setupStudentActions();
    setupEmployerActions();
    
    // By default, select student role
    selectRole('student');
});

// Setup role selection buttons
function setupRoleSelection() {
    document.getElementById('universityRole').addEventListener('click', () => selectRole('university'));
    document.getElementById('studentRole').addEventListener('click', () => selectRole('student'));
    document.getElementById('employerRole').addEventListener('click', () => selectRole('employer'));
}

// Function to select a role
function selectRole(role) {
    console.log("Selecting role:", role);
    
    // Hide all sections
    document.querySelectorAll('.role-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(role + 'Section').style.display = 'block';
    
    // Add active class to clicked button
    document.getElementById(role + 'Role').classList.add('active');
    
    // Load role-specific content
    if (role === 'university') {
        loadUniversityDashboard();
    } else if (role === 'student') {
        loadStudentCertificates();
    } else if (role === 'employer') {
        resetEmployerVerification();
    }
}

// Function to handle actual PDF file upload
function handlePDFUpload(file, certificate) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject("No file selected");
            return;
        }
        
        if (file.type !== 'application/pdf') {
            reject("Only PDF files are allowed");
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Get file data
            const fileData = e.target.result;
            
            // Generate a file name if not provided
            const fileName = file.name || `${certificate.id}_${certificate.studentName.replace(/\s+/g, '_')}_${certificate.examType}.pdf`;
            
            // Simulate uploading to Google Drive
            const fileId = googleDrive.uploadFile(fileName, fileData);
            
            // Add Google Drive info to the certificate
            certificate.pdfFileName = fileName;
            certificate.googleDriveId = fileId;
            certificate.googleDriveLink = googleDrive.generateViewLink(fileId);
            certificate.pdfData = fileData; // Store the file data
            
            resolve(certificate);
        };
        
        reader.onerror = function() {
            reject("Error reading the file");
        };
        
        // Read the file as data URL
        reader.readAsDataURL(file);
    });
}

// Generate a basic PDF transcript preview
function generateTranscriptPreview(certificate) {
    return `
        <div class="transcript-preview">
            <div class="transcript-header">
                <div class="transcript-logo">${certificate.university}</div>
                <h2 class="transcript-title">PROVISIONAL RESULT</h2>
            </div>
            
            <div class="transcript-subtitle">
                VTU PROVISIONAL RESULTS OF UG / PG December-2024 / January-2025 EXAMINATION.
            </div>
            
            <div class="transcript-student-info">
                <table class="info-table">
                    <tr>
                        <td>University Seat Number</td>
                        <td>: ${certificate.studentId}</td>
                    </tr>
                    <tr>
                        <td>Student Name</td>
                        <td>: ${certificate.studentName}</td>
                    </tr>
                    <tr>
                        <td>Semester</td>
                        <td>: ${certificate.semester}</td>
                    </tr>
                </table>
            </div>
            
            <div class="transcript-results">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Internal Marks</th>
                            <th>External Marks</th>
                            <th>Total</th>
                            <th>Result</th>
                            <th>Announced On</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${certificate.subjects.map(subject => `
                            <tr>
                                <td>${subject.code}</td>
                                <td>${subject.name}</td>
                                <td>${subject.internalMarks}</td>
                                <td>${subject.externalMarks}</td>
                                <td>${subject.total}</td>
                                <td>${subject.result}</td>
                                <td>${certificate.announcedDate}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="transcript-footer">
                <div class="transcript-verification">
                    <p>Certificate ID: ${certificate.id}</p>
                    <p>Blockchain Hash: ${certificate.hash.substring(0, 12)}...</p>
                </div>
            </div>
        </div>
    `;
}

// Simulate PDF preview - use actual PDF if available
function showPDFPreview(certificate) {
    if (certificate.pdfData) {
        // Use actual uploaded PDF
        return `
            <div class="pdf-actual-preview">
                <iframe src="${certificate.pdfData}" width="100%" height="600px" style="border: none;"></iframe>
            </div>
        `;
    } else if (certificate.type === 'transcript') {
        // Use transcript preview
        return generateTranscriptPreview(certificate);
    } else {
        // Use simulated PDF preview
        return `
            <div class="pdf-preview">
                <div class="pdf-header">
                    <div class="pdf-logo">${certificate.university}</div>
                    <h2 class="pdf-title">Certificate of Completion</h2>
                </div>
                <div class="pdf-content">
                    <p class="pdf-statement">This certifies that</p>
                    <p class="pdf-name">${certificate.studentName}</p>
                    <p class="pdf-statement">has successfully completed</p>
                    <p class="pdf-course">${certificate.name}</p>
                    <p class="pdf-grade">with a grade of <span class="grade-value">${certificate.tamperedGrade || certificate.grade}</span></p>
                    <p class="pdf-date">Issued on: ${certificate.date}</p>
                </div>
                <div class="pdf-footer">
                    <div class="pdf-signature">
                        <p>University Registrar</p>
                        <img src="#" alt="Digital Signature">
                    </div>
                    <div class="pdf-seal">
                        <img src="#" alt="University Seal">
                    </div>
                    <div class="pdf-verification">
                        <p>Certificate ID: ${certificate.id}</p>
                        <p>Blockchain Hash: ${certificate.hash.substring(0, 12)}...</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// University Functions
function setupUniversityActions() {
    const universityContent = document.createElement('div');
    universityContent.id = 'universityContent';
    
    // Create tabs for different certificate types
    universityContent.innerHTML = `
        <div class="university-tabs">
            <button class="tab-button active" data-tab="singleCertificate">Single Certificate</button>
            <button class="tab-button" data-tab="transcript">Academic Transcript</button>
        </div>
        
        <div class="tab-content" id="singleCertificateTab">
            <form id="issueForm">
                <h3>Issue Single Certificate for ${student.name}</h3>
                <div class="form-group">
                    <label for="certName">Certificate Name:</label>
                    <input type="text" id="certName" placeholder="e.g. Bachelor of Computer Science" required>
                </div>
                <div class="form-group">
                    <label for="certGrade">Grade/Result:</label>
                    <input type="text" id="certGrade" placeholder="e.g. A+ or 95%" required>
                </div>
                <div class="form-group">
                    <label for="certDate">Date of Issue:</label>
                    <input type="date" id="certDate" required>
                </div>
                <div class="form-group">
                    <label for="pdfFile">Upload PDF Certificate:</label>
                    <input type="file" id="pdfFile" accept="application/pdf" required>
                    <small class="file-help">Upload the signed PDF certificate document</small>
                </div>
                <button type="submit" class="btn">Upload PDF & Issue Certificate</button>
            </form>
        </div>
        
        <div class="tab-content" id="transcriptTab" style="display:none;">
            <form id="transcriptForm">
                <h3>Issue Academic Transcript for ${student.name}</h3>
                <div class="form-group">
                    <label for="examType">Exam Type:</label>
                    <input type="text" id="examType" value="UG / PG December-2024 / January-2025" required>
                </div>
                <div class="form-group">
                    <label for="semester">Semester:</label>
                    <input type="text" id="semester" value="3" required>
                </div>
                <div class="form-group">
                    <label for="announcedDate">Announced Date:</label>
                    <input type="text" id="announcedDate" value="2025-02-28" required>
                </div>
                <div class="form-group">
                    <label>Subject Results:</label>
                    <div class="subjects-container">
                        <table class="subjects-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Subject</th>
                                    <th>Internal</th>
                                    <th>External</th>
                                    <th>Total</th>
                                    <th>Result</th>
                                </tr>
                            </thead>
                            <tbody id="subjectsTableBody">
                                <!-- Subjects will be added here dynamically -->
                            </tbody>
                        </table>
                        <div class="table-actions">
                            <button type="button" id="loadSampleData" class="btn secondary-btn">Load Sample Data</button>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="transcriptPdfFile">Upload PDF Transcript:</label>
                    <input type="file" id="transcriptPdfFile" accept="application/pdf">
                    <small class="file-help">Upload the official transcript PDF (optional)</small>
                </div>
                <button type="submit" class="btn">Issue Transcript</button>
            </form>
        </div>
        
        <div id="issuedCertificatesSection"></div>
    `;
    
    const universitySection = document.getElementById('universitySection');
    if (universitySection.querySelector('#universityContent')) {
        universitySection.querySelector('#universityContent').remove();
    }
    universitySection.appendChild(universityContent);
    
    // Setup tab switching
    universityContent.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Hide all tabs
            universityContent.querySelectorAll('.tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            
            // Show selected tab
            document.getElementById(tabId + 'Tab').style.display = 'block';
            
            // Update active state
            universityContent.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Setup subject table
    const subjectsTableBody = document.getElementById('subjectsTableBody');
    
    // Add load sample data button
    document.getElementById('loadSampleData').addEventListener('click', function() {
        subjectsTableBody.innerHTML = '';
        
        sampleSubjects.forEach(subject => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" class="subject-code" value="${subject.code}" required></td>
                <td><input type="text" class="subject-name" value="${subject.name}" required></td>
                <td><input type="number" class="subject-internal" value="${subject.internalMarks}" required></td>
                <td><input type="number" class="subject-external" value="${subject.externalMarks}" required></td>
                <td><input type="number" class="subject-total" value="${subject.total}" required></td>
                <td><input type="text" class="subject-result" value="${subject.result}" required></td>
            `;
            subjectsTableBody.appendChild(row);
        });
    });
    
    // Handle single certificate form submission
    document.getElementById('issueForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const certName = document.getElementById('certName').value;
        const certGrade = document.getElementById('certGrade').value;
        const certDate = document.getElementById('certDate').value;
        const pdfFile = document.getElementById('pdfFile').files[0];
        
        if (!pdfFile) {
            alert("Please upload a PDF certificate file.");
            return;
        }
        
        // Show upload in progress
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.innerHTML = `
            <p><i class="fas fa-spinner fa-spin"></i> Uploading PDF certificate...</p>
        `;
        universityContent.appendChild(loadingMsg);
        
        // Create certificate with unique hash
        const certificate = {
            id: 'CERT-' + Date.now(),
            type: 'single',
            name: certName,
            grade: certGrade,
            date: certDate,
            university: student.university,
            studentName: student.name,
            studentId: student.id,
            hash: generateHash(student.university + certName + certGrade + certDate + student.name + student.id),
            timestamp: new Date().toISOString()
        };
        
        // Handle PDF upload
        handlePDFUpload(pdfFile, certificate)
            .then(updatedCert => {
                // Add to blockchain (simulated)
                blockchainCertificates.push(updatedCert);
                
                // Remove loading message
                loadingMsg.remove();
                
                // Preview the certificate
                const previewDiv = document.createElement('div');
                previewDiv.className = 'certificate-preview-container';
                previewDiv.innerHTML = `
                    <h3>Certificate Preview</h3>
                    ${showPDFPreview(updatedCert)}
                    <div class="preview-actions">
                        <button class="btn close-preview">Close Preview</button>
                    </div>
                `;
                universityContent.appendChild(previewDiv);
                
                previewDiv.querySelector('.close-preview').addEventListener('click', function() {
                    previewDiv.remove();
                    // Show success message
                    alert(`Certificate "${certName}" issued successfully to ${student.name} and uploaded to Google Drive`);
                    document.getElementById('issueForm').reset();
                    
                    // Display issued certificates
                    loadUniversityDashboard();
                });
            })
            .catch(error => {
                // Remove loading message
                loadingMsg.remove();
                alert(`Error: ${error}`);
            });
    });
    
    // Handle transcript form submission
    document.getElementById('transcriptForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const examType = document.getElementById('examType').value;
        const semester = document.getElementById('semester').value;
        const announcedDate = document.getElementById('announcedDate').value;
        const pdfFile = document.getElementById('transcriptPdfFile').files[0];
        
        // Collect subjects data
        const subjects = [];
        subjectsTableBody.querySelectorAll('tr').forEach(row => {
            const subject = {
                code: row.querySelector('.subject-code').value,
                name: row.querySelector('.subject-name').value,
                internalMarks: parseInt(row.querySelector('.subject-internal').value),
                externalMarks: parseInt(row.querySelector('.subject-external').value),
                total: parseInt(row.querySelector('.subject-total').value),
                result: row.querySelector('.subject-result').value
            };
            subjects.push(subject);
        });
        
        if (subjects.length === 0) {
            alert("Please add at least one subject result.");
            return;
        }
        
        // Show processing message
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.innerHTML = `
            <p><i class="fas fa-spinner fa-spin"></i> Processing transcript data...</p>
        `;
        universityContent.appendChild(loadingMsg);
        
        // Create transcript certificate
        const transcript = {
            id: 'TR-' + Date.now(),
            type: 'transcript',
            examType: examType,
            semester: semester,
            announcedDate: announcedDate,
            subjects: subjects,
            university: student.university,
            studentName: student.name,
            studentId: student.id,
            hash: generateHash(student.university + examType + semester + JSON.stringify(subjects) + student.name + student.id),
            timestamp: new Date().toISOString()
        };
        
        // Handle transcript processing
        const processTranscript = () => {
            if (pdfFile) {
                // If PDF was uploaded, handle it
                return handlePDFUpload(pdfFile, transcript);
            } else {
                // No PDF uploaded, just use the data as is
                transcript.pdfFileName = `${transcript.id}_${transcript.studentName.replace(/\s+/g, '_')}_Transcript.pdf`;
                transcript.googleDriveId = googleDrive.uploadFile(transcript.pdfFileName, "Transcript data");
                transcript.googleDriveLink = googleDrive.generateViewLink(transcript.googleDriveId);
                return Promise.resolve(transcript);
            }
        };
        
        processTranscript()
            .then(updatedTranscript => {
                // Add to blockchain (simulated)
                blockchainCertificates.push(updatedTranscript);
                
                // Remove loading message
                loadingMsg.remove();
                
                // Preview the certificate
                const previewDiv = document.createElement('div');
                previewDiv.className = 'certificate-preview-container';
                previewDiv.innerHTML = `
                    <h3>Transcript Preview</h3>
                    ${showPDFPreview(updatedTranscript)}
                    <div class="preview-actions">
                        <button class="btn close-preview">Close Preview</button>
                    </div>
                `;
                universityContent.appendChild(previewDiv);
                
                previewDiv.querySelector('.close-preview').addEventListener('click', function() {
                    previewDiv.remove();
                    // Show success message
                    alert(`Academic Transcript for Semester ${semester} issued successfully to ${student.name}`);
                    document.getElementById('transcriptForm').reset();
                    subjectsTableBody.innerHTML = '';
                    
                    // Display issued certificates
                    loadUniversityDashboard();
                });
            })
            .catch(error => {
                // Remove loading message
                loadingMsg.remove();
                alert(`Error: ${error}`);
            });
    });
}

function loadUniversityDashboard() {
    const issuedCertsDiv = document.createElement('div');
    issuedCertsDiv.className = 'issued-certificates';
    issuedCertsDiv.innerHTML = '<h3>Issued Certificates & Transcripts</h3>';
    
    if (blockchainCertificates.length === 0) {
        issuedCertsDiv.innerHTML += '<p>No certificates have been issued yet.</p>';
    } else {
        const certTable = document.createElement('table');
        certTable.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Student</th>
                    <th>Date</th>
                    <th>PDF</th>
                    <th>Blockchain Hash</th>
                </tr>
            </thead>
            <tbody id="issuedCertsTbody"></tbody>
        `;
        issuedCertsDiv.appendChild(certTable);
        
        const tbody = certTable.querySelector('tbody');
        blockchainCertificates.forEach(cert => {
            const row = document.createElement('tr');
            
            // Determine certificate details based on type
            let details = '';
            if (cert.type === 'transcript') {
                details = `Semester ${cert.semester} Transcript`;
            } else {
                details = `${cert.name}: ${cert.grade}`;
            }
            
            row.innerHTML = `
                <td>${cert.id}</td>
                <td>${cert.type === 'transcript' ? 'Transcript' : 'Certificate'}</td>
                <td>${details}</td>
                <td>${cert.studentName}</td>
                <td>${cert.type === 'transcript' ? cert.announcedDate : cert.date}</td>
                <td><a href="#" class="drive-link preview-cert" data-id="${cert.id}"><i class="fas fa-file-pdf"></i> View PDF</a></td>
                <td><code>${cert.hash.substring(0, 16)}...</code></td>
            `;
            tbody.appendChild(row);
        });
        
        // Add event listeners for PDF preview
        certTable.querySelectorAll('.preview-cert').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const certId = this.getAttribute('data-id');
                const cert = blockchainCertificates.find(c => c.id === certId);
                
                const previewDiv = document.createElement('div');
                previewDiv.className = 'certificate-preview-container';
                previewDiv.innerHTML = `
                    <h3>${cert.type === 'transcript' ? 'Transcript' : 'Certificate'} Preview</h3>
                    ${showPDFPreview(cert)}
                    <div class="preview-actions">
                        <button class="btn close-preview">Close Preview</button>
                    </div>
                `;
                
                const universityContent = document.getElementById('universityContent');
                universityContent.appendChild(previewDiv);
                
                previewDiv.querySelector('.close-preview').addEventListener('click', function() {
                    previewDiv.remove();
                });
            });
        });
    }
    
    // Replace existing issued certificates section
    const existingContent = document.getElementById('issuedCertificatesSection');
    existingContent.innerHTML = '';
    existingContent.appendChild(issuedCertsDiv);
}

// Student Functions
function setupStudentActions() {
    const studentContent = document.createElement('div');
    studentContent.id = 'studentContent';
    
    const studentSection = document.getElementById('studentSection');
    if (studentSection.querySelector('#studentContent')) {
        studentSection.querySelector('#studentContent').remove();
    }
    studentSection.appendChild(studentContent);
}

function loadStudentCertificates() {
    const studentContent = document.getElementById('studentContent');
    studentContent.innerHTML = `
        <h3>${student.name}'s Certificates</h3>
        <p>Your certificates are securely stored as PDFs in Google Drive and verified on the blockchain.</p>
    `;
    
    if (blockchainCertificates.length === 0) {
        studentContent.innerHTML += '<p>You have no certificates yet.</p>';
        return;
    }
    
    // Display certificates with download/tamper options
    const certList = document.createElement('div');
    certList.className = 'certificate-list';
    
    blockchainCertificates.forEach(cert => {
        const certCard = document.createElement('div');
        certCard.className = 'certificate-card';
        certCard.innerHTML = `
            <h4>${cert.name}</h4>
            <p><strong>ID:</strong> ${cert.id}</p>
            <p><strong>University:</strong> <span id="university-${cert.id}">${cert.university}</span></p>
            <p><strong>Student Name:</strong> <span id="studentName-${cert.id}">${cert.studentName}</span></p>
            <p><strong>Grade:</strong> <span id="grade-${cert.id}">${cert.grade}</span></p>
            <p><strong>Issue Date:</strong> <span id="date-${cert.id}">${cert.date}</span></p>
            <p><strong>PDF:</strong> <a href="#" class="drive-link preview-cert" data-id="${cert.id}"><i class="fas fa-file-pdf"></i> ${cert.pdfFileName}</a></p>
            <div class="certificate-actions">
                <button class="download-cert" data-id="${cert.id}">Download PDF</button>
                <button class="tamper-cert" data-id="${cert.id}">Tamper with Certificate</button>
                <button class="share-cert" data-id="${cert.id}">Share with Employer</button>
            </div>
        `;
        certList.appendChild(certCard);
    });
    
    studentContent.appendChild(certList);
    
    // Add event listeners for PDF preview
    studentContent.querySelectorAll('.preview-cert').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const certId = this.getAttribute('data-id');
            const cert = blockchainCertificates.find(c => c.id === certId);
            
            const previewDiv = document.createElement('div');
            previewDiv.className = 'certificate-preview-container';
            previewDiv.innerHTML = `
                <h3>Certificate Preview</h3>
                ${showPDFPreview(cert)}
                <div class="preview-actions">
                    <button class="btn close-preview">Close Preview</button>
                </div>
            `;
            
            studentContent.appendChild(previewDiv);
            
            previewDiv.querySelector('.close-preview').addEventListener('click', function() {
                previewDiv.remove();
            });
        });
    });
    
    // Add event listeners for buttons
    document.querySelectorAll('.download-cert').forEach(btn => {
        btn.addEventListener('click', function() {
            const certId = this.getAttribute('data-id');
            const cert = blockchainCertificates.find(c => c.id === certId);
            alert(`Certificate PDF "${cert.pdfFileName}" downloaded from Google Drive (simulation)`);
        });
    });
    
    document.querySelectorAll('.tamper-cert').forEach(btn => {
        btn.addEventListener('click', function() {
            const certId = this.getAttribute('data-id');
            const cert = blockchainCertificates.find(c => c.id === certId);
            
            // Create tamper options dialog
            const tamperOptions = document.createElement('div');
            tamperOptions.className = 'tamper-options';
            tamperOptions.innerHTML = `
                <h3>Select Field to Tamper With</h3>
                <div class="tamper-field-options">
                    <button class="tamper-field" data-field="grade">Grade</button>
                    <button class="tamper-field" data-field="university">University Name</button>
                    <button class="tamper-field" data-field="studentName">Student Name</button>
                    <button class="tamper-field" data-field="date">Issue Date</button>
                </div>
                <button class="btn cancel-tamper">Cancel</button>
            `;
            
            studentContent.appendChild(tamperOptions);
            
            // Handle tamper field selection
            tamperOptions.querySelectorAll('.tamper-field').forEach(fieldBtn => {
                fieldBtn.addEventListener('click', function() {
                    const field = this.getAttribute('data-field');
                    let newValue;
                    
                    switch(field) {
                        case 'grade':
                            newValue = prompt(`Enter tampered grade (current: ${cert.grade}):`, cert.grade);
                            if (newValue && newValue !== cert.grade) {
                                document.getElementById(`grade-${certId}`).textContent = newValue;
                                document.getElementById(`grade-${certId}`).style.color = 'red';
                                cert.tamperedGrade = newValue;
                            }
                            break;
                        case 'university':
                            newValue = prompt(`Enter tampered university name (current: ${cert.university}):`, cert.university);
                            if (newValue && newValue !== cert.university) {
                                document.getElementById(`university-${certId}`).textContent = newValue;
                                document.getElementById(`university-${certId}`).style.color = 'red';
                                cert.tamperedUniversity = newValue;
                            }
                            break;
                        case 'studentName':
                            newValue = prompt(`Enter tampered student name (current: ${cert.studentName}):`, cert.studentName);
                            if (newValue && newValue !== cert.studentName) {
                                document.getElementById(`studentName-${certId}`).textContent = newValue;
                                document.getElementById(`studentName-${certId}`).style.color = 'red';
                                cert.tamperedStudentName = newValue;
                            }
                            break;
                        case 'date':
                            newValue = prompt(`Enter tampered issue date (current: ${cert.date}):`, cert.date);
                            if (newValue && newValue !== cert.date) {
                                document.getElementById(`date-${certId}`).textContent = newValue;
                                document.getElementById(`date-${certId}`).style.color = 'red';
                                cert.tamperedDate = newValue;
                            }
                            break;
                    }
                    
                    if (newValue) {
                        // Mark certificate as tampered
                        cert.isTampered = true;
                        cert.tamperedFields = cert.tamperedFields || [];
                        if (!cert.tamperedFields.includes(field)) {
                            cert.tamperedFields.push(field);
                        }
                        
                        // Update tamper button
                        btn.textContent = 'Tampered!';
                        btn.classList.add('tampered');
                        
                        // Simulate PDF editing
                        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} modified in the PDF (simulation). The blockchain still has the original data.`);
                        
                        tamperOptions.remove();
                    }
                });
            });
            
            tamperOptions.querySelector('.cancel-tamper').addEventListener('click', function() {
                tamperOptions.remove();
            });
        });
    });
    
    document.querySelectorAll('.share-cert').forEach(btn => {
        btn.addEventListener('click', function() {
            const certId = this.getAttribute('data-id');
            const cert = blockchainCertificates.find(c => c.id === certId);
            
            // Simulate Google Drive sharing
            const employerEmail = prompt("Enter employer's email address to share certificate:", "employer@company.com");
            
            if (employerEmail) {
                // Generate share link
                const shareLink = googleDrive.shareFile(cert.googleDriveId, employerEmail);
                
                // Check if certificate is tampered
                if (cert.isTampered) {
                    // Share the tampered certificate
                    const tamperedFields = cert.tamperedFields.join(', ');
                    alert(`Certificate PDF "${cert.pdfFileName}" shared with ${employerEmail} via Google Drive (with tampered ${tamperedFields})`);
                } else {
                    alert(`Certificate PDF "${cert.pdfFileName}" shared with ${employerEmail} via Google Drive (original)`);
                }
                
                // Add to shared certificates
                cert.shared = true;
                cert.sharedWith = employerEmail;
                cert.shareLink = shareLink;
                
                // Switch to employer role automatically
                selectRole('employer');
                
                // Load this certificate for verification
                prepareVerification(certId);
            }
        });
    });
}

// Employer Functions
function setupEmployerActions() {
    const employerContent = document.createElement('div');
    employerContent.id = 'employerContent';
    employerContent.innerHTML = `
        <h3>Verify Student Credentials</h3>
        <p>No certificates have been shared yet. Ask the candidate to share their certificates via Google Drive.</p>
    `;
    
    const employerSection = document.getElementById('employerSection');
    if (employerSection.querySelector('#employerContent')) {
        employerSection.querySelector('#employerContent').remove();
    }
    employerSection.appendChild(employerContent);
}

function resetEmployerVerification() {
    const employerContent = document.getElementById('employerContent');
    employerContent.innerHTML = `
        <h3>Verify Student Credentials</h3>
        <p>No certificates have been shared yet. Ask the candidate to share their certificates via Google Drive.</p>
    `;
}

function prepareVerification(certId) {
    const cert = blockchainCertificates.find(c => c.id === certId);
    
    const employerContent = document.getElementById('employerContent');
    employerContent.innerHTML = `
        <h3>Verify Certificate</h3>
        <div class="verification-card">
            <h4>${cert.name}</h4>
            <p><strong>ID:</strong> ${cert.id}</p>
            <p><strong>University:</strong> ${cert.tamperedUniversity || cert.university}</p>
            <p><strong>Student:</strong> ${cert.tamperedStudentName || cert.studentName} (${cert.studentId})</p>
            <p><strong>Grade:</strong> ${cert.tamperedGrade || cert.grade}</p>
            <p><strong>Issue Date:</strong> ${cert.tamperedDate || cert.date}</p>
            <p><strong>Shared PDF:</strong> <a href="#" class="drive-link preview-cert" data-id="${cert.id}"><i class="fas fa-file-pdf"></i> ${cert.pdfFileName}</a></p>
            <button id="verifyCertificate" class="verify-btn">Verify on Blockchain</button>
        </div>
        <div id="verificationResult" class="verification-result" style="display:none;"></div>
    `;
    
    // Add event listener for PDF preview
    employerContent.querySelector('.preview-cert').addEventListener('click', function(e) {
        e.preventDefault();
        const certId = this.getAttribute('data-id');
        const cert = blockchainCertificates.find(c => c.id === certId);
        
        const previewDiv = document.createElement('div');
        previewDiv.className = 'certificate-preview-container';
        previewDiv.innerHTML = `
            <h3>Certificate Preview</h3>
            ${showPDFPreview(cert)}
            <div class="preview-actions">
                <button class="btn close-preview">Close Preview</button>
            </div>
        `;
        
        employerContent.appendChild(previewDiv);
        
        previewDiv.querySelector('.close-preview').addEventListener('click', function() {
            previewDiv.remove();
        });
    });
    
    document.getElementById('verifyCertificate').addEventListener('click', function() {
        verifyOnBlockchain(certId);
    });
}

function verifyOnBlockchain(certId) {
    const cert = blockchainCertificates.find(c => c.id === certId);
    const resultDiv = document.getElementById('verificationResult');
    
    // Simulate blockchain verification process
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p>Verifying certificate on blockchain...</p>';
    
    setTimeout(() => {
        resultDiv.innerHTML = '<p>Retrieving certificate hash from blockchain...</p>';
        
        setTimeout(() => {
            resultDiv.innerHTML = '<p>Extracting certificate data from PDF document...</p>';
            
            setTimeout(() => {
                resultDiv.innerHTML = '<p>Comparing certificate data with blockchain record...</p>';
                
                setTimeout(() => {
                    // Check if any fields were tampered
                    if (cert.isTampered) {
                        // Calculate hash with original values
                        const originalHash = cert.hash;
                        
                        // Calculate hash with tampered values
                        let currentData = (cert.tamperedUniversity || cert.university) + 
                                         cert.name + 
                                         (cert.tamperedGrade || cert.grade) + 
                                         (cert.tamperedDate || cert.date) + 
                                         (cert.tamperedStudentName || cert.studentName) + 
                                         cert.studentId;
                        const tamperedHash = generateHash(currentData);
                        
                        // Get list of tampered fields
                        const tamperedFieldsList = cert.tamperedFields.map(field => {
                            switch(field) {
                                case 'grade': return 'Grade';
                                case 'university': return 'University Name';
                                case 'studentName': return 'Student Name';
                                case 'date': return 'Issue Date';
                                default: return field;
                            }
                        }).join(', ');
                        
                        resultDiv.innerHTML = `
                            <h3 class="verification-failed">Verification Failed!</h3>
                            <p>The certificate PDF has been tampered with.</p>
                            <div class="verification-details">
                                <p><strong>Blockchain Hash:</strong> <code>${originalHash.substring(0, 24)}...</code></p>
                                <p><strong>Certificate Hash:</strong> <code>${tamperedHash.substring(0, 24)}...</code></p>
                                <p class="tamper-warning">The following fields appear to have been modified: ${tamperedFieldsList}</p>
                                <p>For the original certificate, please contact ${cert.university} directly.</p>
                            </div>
                        `;
                    } else {
                        resultDiv.innerHTML = `
                            <h3 class="verification-success">Verification Successful!</h3>
                            <p>The certificate PDF is authentic and matches the blockchain record.</p>
                            <div class="verification-details">
                                <p><strong>Blockchain Hash:</strong> <code>${cert.hash.substring(0, 24)}...</code></p>
                                <p><strong>Certificate Hash:</strong> <code>${cert.hash.substring(0, 24)}...</code></p>
                                <p class="verify-success">All certificate details are verified and authentic.</p>
                                <p>PDF certificate is securely stored on Google Drive with timestamp verification.</p>
                            </div>
                        `;
                    }
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}

// Utility function to generate a simple hash (simulation of blockchain hash)
function generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to hex string and add some random bits to make it look like a real hash
    return Math.abs(hash).toString(16) + Date.now().toString(16) + Math.random().toString(16).substring(2, 10);
} 