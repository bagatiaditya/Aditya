# TrustChain

TrustChain is a decentralized platform for creating, managing, and verifying digital credentials on the blockchain.

## Project Overview

This project aims to create a secure and transparent system for credential verification using blockchain technology. It allows users to:

- Create and issue digital credentials
- Store credentials securely on the blockchain
- Share credentials with third parties
- Verify the authenticity of credentials instantly

## Project Structure

The project is organized into several components:

1. **Landing Page** - Introduces the TrustChain concept and features
2. **Authentication System** - Firebase-based user authentication
3. **Credential Management Dashboard** - For creating and managing digital credentials
4. **Verification Logic** - Implementation of blockchain-based verification
5. **Verification Visualization** - Visual representation of verification status
6. **Credential Sharing** - Secure system for sharing credentials with others
7. **Database Structure** - Firestore database for storing credentials and verification records
8. **User Profile** - User settings and profile management

## Development Roadmap

- MYA-1: Create landing page introducing the TrustChain concept ✅
- MYA-2: Install and configure Firebase Extension for authentication ✅
- MYA-3: Create credential creation and management dashboard
- MYA-4: Implement credential verification logic using mock blockchain
- MYA-5: Design and develop the verification visualization component
- MYA-6: Build credential sharing and verification request page
- MYA-7: Set up Firestore database structure for credentials and verification records
- MYA-8: Implement user profile and settings page

## Technologies Used

- HTML5, CSS3, JavaScript
- Firebase Authentication
- Firebase Firestore
- Blockchain Technology (mock implementation)

## Authentication Features

The authentication system includes:

- Email/password registration and login
- Google sign-in integration
- Password reset functionality
- User session management
- Secure authentication flow
- Protected routes for authenticated users
- User profile data storage in Firestore

## Getting Started

### Prerequisites

- Web browser (Chrome, Firefox, Safari, Edge)
- Internet connection

### Installation

1. Clone the repository:
```
git clone https://github.com/your-username/trustchain-app.git
```

2. Navigate to the project directory:
```
cd trustchain-app
```

3. Open the index.html file in your web browser:
```
open index.html
```

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Register your app in the Firebase console
3. Enable Authentication (Email/Password and Google providers)
4. Create a Firestore database
5. Update the firebaseConfig in js/firebase-config.js with your Firebase project details:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Features

- **Secure Credential Storage**: Credentials are stored on a blockchain, making them immutable and secure
- **User-Controlled Sharing**: Users maintain control over who can access their credentials
- **Instant Verification**: Credentials can be verified in real-time
- **Tamper-Proof**: Blockchain technology ensures credentials cannot be forged or altered

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries, please contact us at contact@trustchain.com 