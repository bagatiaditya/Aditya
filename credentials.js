document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, initialize the page
            initCredentialsPage(user.uid);
        } else {
            // No user is signed in, redirect to login
            window.location.href = 'login.html';
        }
    });

    // Global variables
    let currentUserId = null;
    let credentials = [];
    let selectedCredentialId = null;

    // Initialize the credentials page
    function initCredentialsPage(userId) {
        currentUserId = userId;
        
        // Initialize event listeners
        initEventListeners();
        
        // Load credentials from Firestore
        loadCredentials();
    }

    // Initialize all event listeners
    function initEventListeners() {
        // Add credential button
        document.getElementById('add-credential-btn').addEventListener('click', openNewCredentialModal);
        
        // Empty state add button
        document.getElementById('empty-add-btn').addEventListener('click', openNewCredentialModal);
        
        // Close modal button
        document.getElementById('close-modal').addEventListener('click', closeModal);
        
        // Save credential form
        document.getElementById('credential-form').addEventListener('submit', saveCredential);
        
        // Delete credential button
        document.getElementById('delete-credential').addEventListener('click', confirmDeleteCredential);
        
        // Confirmation modal buttons
        document.querySelector('.confirm-close').addEventListener('click', closeConfirmModal);
        document.querySelector('.confirm-cancel').addEventListener('click', closeConfirmModal);
        document.querySelector('.confirm-delete').addEventListener('click', deleteCredential);
        
        // View toggle buttons
        document.getElementById('grid-view-btn').addEventListener('click', function() {
            setViewMode('grid');
        });
        
        document.getElementById('list-view-btn').addEventListener('click', function() {
            setViewMode('list');
        });
        
        // Search functionality
        document.getElementById('search-credentials').addEventListener('input', filterCredentials);
        
        // Filter dropdowns
        document.getElementById('filter-type').addEventListener('change', filterCredentials);
        document.getElementById('filter-status').addEventListener('change', filterCredentials);
        document.getElementById('sort-by').addEventListener('change', filterCredentials);
    }

    // Load credentials from Firestore
    function loadCredentials() {
        showLoadingState();
        
        db.collection('users').doc(currentUserId).collection('credentials')
            .get()
            .then((querySnapshot) => {
                credentials = [];
                querySnapshot.forEach((doc) => {
                    credentials.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                renderCredentials();
                updateEmptyState();
            })
            .catch((error) => {
                showTechNotification(`Error loading credentials: ${error.message}`);
                console.error("Error loading credentials: ", error);
            });
    }

    // Render credentials in the grid/list
    function renderCredentials() {
        const credentialsGrid = document.getElementById('credentials-grid');
        const emptyState = document.getElementById('empty-state');
        
        // Clear existing credentials
        const existingCards = credentialsGrid.querySelectorAll('.credential-card');
        existingCards.forEach(card => card.remove());
        
        // If no credentials, show empty state
        if (credentials.length === 0) {
            emptyState.style.display = 'flex';
            return;
        }
        
        // Hide empty state
        emptyState.style.display = 'none';
        
        // Create credential cards
        credentials.forEach(credential => {
            const card = createCredentialCard(credential);
            credentialsGrid.appendChild(card);
        });
    }

    // Create a credential card element
    function createCredentialCard(credential) {
        const card = document.createElement('div');
        card.className = 'credential-card tech-card';
        card.dataset.id = credential.id;
        
        if (selectedCredentialId === credential.id) {
            card.classList.add('selected');
        }
        
        const statusClass = `status-${credential.status}`;
        
        // Format dates
        const issueDate = new Date(credential.issueDate).toLocaleDateString();
        const expiryDate = credential.expiryDate ? new Date(credential.expiryDate).toLocaleDateString() : 'N/A';
        
        card.innerHTML = `
            <div class="credential-header">
                <div>
                    <h4 class="credential-name">${credential.name}</h4>
                    <div class="credential-type">${formatType(credential.type)}</div>
                </div>
                <span class="credential-status ${statusClass}">${formatStatus(credential.status)}</span>
            </div>
            <div class="credential-info">
                <div class="info-row">
                    <span class="info-label">Issuer:</span>
                    <span class="info-value">${credential.issuer}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Issued:</span>
                    <span class="info-value">${issueDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Expires:</span>
                    <span class="info-value">${expiryDate}</span>
                </div>
            </div>
            <div class="credential-hash mono-text">${credential.hash || 'hash:0x0000000000000000'}</div>
        `;
        
        // Add click event to open edit modal
        card.addEventListener('click', function() {
            openEditCredentialModal(credential.id);
        });
        
        return card;
    }

    // Format credential type for display
    function formatType(type) {
        if (!type) return 'Unknown';
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    // Format credential status for display
    function formatStatus(status) {
        if (!status) return 'Unknown';
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    // Update empty state display
    function updateEmptyState() {
        const emptyState = document.getElementById('empty-state');
        emptyState.style.display = credentials.length === 0 ? 'flex' : 'none';
    }

    // Show loading state
    function showLoadingState() {
        const credentialsGrid = document.getElementById('credentials-grid');
        credentialsGrid.innerHTML = `
            <div class="tech-empty-state full-width">
                <i class="fas fa-circle-notch fa-spin"></i>
                <p class="mono-text">LOADING_CREDENTIALS</p>
            </div>
        `;
    }

    // Open modal to create a new credential
    function openNewCredentialModal() {
        // Reset form
        document.getElementById('credential-form').reset();
        document.getElementById('credential-id').value = '';
        document.getElementById('modal-title').textContent = 'New Credential';
        
        // Hide delete button for new credentials
        document.getElementById('delete-credential').style.display = 'none';
        
        // Show hash overlay
        document.querySelector('.hash-overlay').style.display = 'flex';
        
        // Set default status to active
        document.getElementById('credential-status').value = 'active';
        
        // Set default issue date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('issue-date').value = today;
        
        // Open modal
        const modal = document.getElementById('credential-modal');
        modal.classList.add('active');
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('credential-name').focus();
        }, 100);
    }

    // Open modal to edit an existing credential
    function openEditCredentialModal(credentialId) {
        // Find the credential
        const credential = credentials.find(c => c.id === credentialId);
        if (!credential) return;
        
        // Set selected credential
        selectedCredentialId = credentialId;
        highlightSelectedCard();
        
        // Populate form
        document.getElementById('credential-id').value = credential.id;
        document.getElementById('credential-name').value = credential.name;
        document.getElementById('credential-type').value = credential.type;
        document.getElementById('credential-status').value = credential.status;
        document.getElementById('credential-issuer').value = credential.issuer;
        document.getElementById('credential-description').value = credential.description || '';
        
        // Format dates for input fields
        if (credential.issueDate) {
            const issueDate = new Date(credential.issueDate).toISOString().split('T')[0];
            document.getElementById('issue-date').value = issueDate;
        }
        
        if (credential.expiryDate) {
            const expiryDate = new Date(credential.expiryDate).toISOString().split('T')[0];
            document.getElementById('expiry-date').value = expiryDate;
        }
        
        // Set hash value
        document.getElementById('credential-hash').value = credential.hash || '';
        document.querySelector('.hash-overlay').style.display = credential.hash ? 'none' : 'flex';
        
        // Update modal title
        document.getElementById('modal-title').textContent = 'Edit Credential';
        
        // Show delete button
        document.getElementById('delete-credential').style.display = 'block';
        
        // Open modal
        const modal = document.getElementById('credential-modal');
        modal.classList.add('active');
        
        // Render verification chain
        renderVerificationChain(credential);
    }

    // Highlight the selected credential card
    function highlightSelectedCard() {
        // Remove selected class from all cards
        const cards = document.querySelectorAll('.credential-card');
        cards.forEach(card => card.classList.remove('selected'));
        
        // Add selected class to the current card
        if (selectedCredentialId) {
            const selectedCard = document.querySelector(`.credential-card[data-id="${selectedCredentialId}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
        }
    }

    // Close the credential modal
    function closeModal() {
        const modal = document.getElementById('credential-modal');
        modal.classList.remove('active');
    }

    // Open confirmation modal for deletion
    function confirmDeleteCredential() {
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.classList.add('active');
    }

    // Close confirmation modal
    function closeConfirmModal() {
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.classList.remove('active');
    }

    // Save a credential (create or update)
    function saveCredential(e) {
        e.preventDefault();
        
        // Get form values
        const credentialId = document.getElementById('credential-id').value;
        const name = document.getElementById('credential-name').value;
        const type = document.getElementById('credential-type').value;
        const status = document.getElementById('credential-status').value;
        const issuer = document.getElementById('credential-issuer').value;
        const issueDate = document.getElementById('issue-date').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const description = document.getElementById('credential-description').value;
        
        // Create credential object
        const credentialData = {
            name,
            type,
            status,
            issuer,
            issueDate: new Date(issueDate).toISOString(),
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
            description,
            updatedAt: new Date().toISOString()
        };
        
        // Generate hash for new credentials
        if (!credentialId) {
            credentialData.createdAt = new Date().toISOString();
            credentialData.hash = generateCredentialHash(credentialData);
        }
        
        // Reference to the user's credentials collection
        const credentialRef = credentialId 
            ? db.collection('users').doc(currentUserId).collection('credentials').doc(credentialId)
            : db.collection('users').doc(currentUserId).collection('credentials').doc();
        
        // Save to Firestore
        credentialRef.set(credentialId ? credentialData : { ...credentialData, createdAt: new Date().toISOString() }, { merge: true })
            .then(() => {
                showTechNotification(`Credential ${credentialId ? 'updated' : 'created'} successfully`);
                closeModal();
                loadCredentials();
            })
            .catch((error) => {
                showTechNotification(`Error saving credential: ${error.message}`);
                console.error("Error saving credential: ", error);
            });
    }

    // Delete a credential
    function deleteCredential() {
        const credentialId = document.getElementById('credential-id').value;
        if (!credentialId) return;
        
        db.collection('users').doc(currentUserId).collection('credentials').doc(credentialId).delete()
            .then(() => {
                showTechNotification('Credential deleted successfully');
                closeConfirmModal();
                closeModal();
                
                // Remove from local array
                credentials = credentials.filter(c => c.id !== credentialId);
                
                // Clear selected credential
                if (selectedCredentialId === credentialId) {
                    selectedCredentialId = null;
                    clearVerificationChain();
                }
                
                renderCredentials();
                updateEmptyState();
            })
            .catch((error) => {
                showTechNotification(`Error deleting credential: ${error.message}`);
                console.error("Error deleting credential: ", error);
            });
    }

    // Generate a hash for the credential
    function generateCredentialHash(credentialData) {
        // In a real application, this would use a proper cryptographic function
        // For demo purposes, we'll create a simple hash
        const dataString = JSON.stringify(credentialData);
        const randomPart = Math.random().toString(36).substring(2, 10);
        return `0x${randomPart}${Date.now().toString(16)}`;
    }

    // Filter and sort credentials based on search and filters
    function filterCredentials() {
        const searchTerm = document.getElementById('search-credentials').value.toLowerCase();
        const typeFilter = document.getElementById('filter-type').value;
        const statusFilter = document.getElementById('filter-status').value;
        const sortOption = document.getElementById('sort-by').value;
        
        // Filter the credentials
        let filteredCredentials = credentials.filter(credential => {
            // Search term filter
            const matchesSearch = 
                credential.name.toLowerCase().includes(searchTerm) ||
                credential.issuer.toLowerCase().includes(searchTerm) ||
                (credential.description && credential.description.toLowerCase().includes(searchTerm));
            
            // Type filter
            const matchesType = !typeFilter || credential.type === typeFilter;
            
            // Status filter
            const matchesStatus = !statusFilter || credential.status === statusFilter;
            
            return matchesSearch && matchesType && matchesStatus;
        });
        
        // Sort the credentials
        filteredCredentials.sort((a, b) => {
            switch (sortOption) {
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
        
        // Update the credentials array with filtered and sorted results
        credentials = filteredCredentials;
        
        // Re-render the credentials
        renderCredentials();
        updateEmptyState();
    }

    // Set view mode (grid or list)
    function setViewMode(mode) {
        const gridBtn = document.getElementById('grid-view-btn');
        const listBtn = document.getElementById('list-view-btn');
        const credentialsGrid = document.getElementById('credentials-grid');
        
        if (mode === 'grid') {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            credentialsGrid.classList.remove('list-view');
        } else {
            gridBtn.classList.remove('active');
            listBtn.classList.add('active');
            credentialsGrid.classList.add('list-view');
        }
        
        // Save preference to localStorage
        localStorage.setItem('credentialsViewMode', mode);
    }

    // Render the verification chain visualization
    function renderVerificationChain(credential) {
        const chainContainer = document.querySelector('.chain-container');
        clearVerificationChain();
        
        // Create placeholder nodes for the verification chain
        const nodes = [
            { id: 'issuer', label: 'Issuer', icon: 'fa-building', x: '20%', y: '50%' },
            { id: 'credential', label: credential.name, icon: 'fa-certificate', x: '50%', y: '50%', active: true },
            { id: 'verification', label: 'Verification', icon: 'fa-check-circle', x: '80%', y: '50%' }
        ];
        
        // Add additional nodes
        nodes.push(
            { id: 'creation', label: 'Created', icon: 'fa-plus-circle', x: '35%', y: '25%' },
            { id: 'blockchain', label: 'Blockchain', icon: 'fa-link', x: '65%', y: '25%' },
            { id: 'revocation', label: 'Revocation', icon: 'fa-times-circle', x: '35%', y: '75%' },
            { id: 'audit', label: 'Audit Log', icon: 'fa-history', x: '65%', y: '75%' }
        );
        
        // Create nodes
        nodes.forEach(node => {
            const nodeElement = document.createElement('div');
            nodeElement.className = `chain-node ${node.active ? 'active' : ''}`;
            nodeElement.id = `node-${node.id}`;
            nodeElement.style.left = node.x;
            nodeElement.style.top = node.y;
            
            nodeElement.innerHTML = `
                <i class="fas ${node.icon}"></i>
                <span class="chain-node-text">${node.label}</span>
            `;
            
            chainContainer.appendChild(nodeElement);
        });
        
        // Create connectors
        createConnector('node-issuer', 'node-credential');
        createConnector('node-credential', 'node-verification');
        createConnector('node-issuer', 'node-creation');
        createConnector('node-creation', 'node-credential');
        createConnector('node-credential', 'node-blockchain');
        createConnector('node-blockchain', 'node-verification');
        createConnector('node-issuer', 'node-revocation');
        createConnector('node-revocation', 'node-credential');
        createConnector('node-credential', 'node-audit');
        createConnector('node-audit', 'node-verification');
        
        // Hide placeholder text
        const placeholderText = document.querySelector('.placeholder-text');
        placeholderText.style.display = 'none';
    }

    // Create a connector line between nodes
    function createConnector(fromNodeId, toNodeId) {
        const chainContainer = document.querySelector('.chain-container');
        const fromNode = document.getElementById(fromNodeId);
        const toNode = document.getElementById(toNodeId);
        
        if (!fromNode || !toNode) return;
        
        const connector = document.createElement('div');
        connector.className = 'chain-connector';
        
        // Get node positions
        const fromRect = fromNode.getBoundingClientRect();
        const toRect = toNode.getBoundingClientRect();
        const containerRect = chainContainer.getBoundingClientRect();
        
        // Calculate center points relative to container
        const fromX = fromRect.left - containerRect.left + fromRect.width / 2;
        const fromY = fromRect.top - containerRect.top + fromRect.height / 2;
        const toX = toRect.left - containerRect.left + toRect.width / 2;
        const toY = toRect.top - containerRect.top + toRect.height / 2;
        
        // Calculate length and angle
        const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
        
        // Set connector style
        connector.style.width = `${length}px`;
        connector.style.left = `${fromX}px`;
        connector.style.top = `${fromY}px`;
        connector.style.transform = `rotate(${angle}deg)`;
        connector.style.transformOrigin = `0 0`;
        
        chainContainer.appendChild(connector);
    }

    // Clear verification chain visualization
    function clearVerificationChain() {
        const chainContainer = document.querySelector('.chain-container');
        
        // Remove all nodes and connectors
        const nodes = chainContainer.querySelectorAll('.chain-node');
        const connectors = chainContainer.querySelectorAll('.chain-connector');
        
        nodes.forEach(node => node.remove());
        connectors.forEach(connector => connector.remove());
        
        // Show placeholder text
        const placeholderText = document.querySelector('.placeholder-text');
        placeholderText.style.display = 'block';
    }
    
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

    // Load view preference from localStorage
    function loadViewPreference() {
        const savedViewMode = localStorage.getItem('credentialsViewMode');
        if (savedViewMode) {
            setViewMode(savedViewMode);
        }
    }

    // Load view preference on init
    loadViewPreference();
}); 