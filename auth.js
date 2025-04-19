document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            if (window.location.pathname.includes('login.html') || 
                window.location.pathname.includes('register.html') ||
                window.location.pathname.includes('forgot-password.html')) {
                window.location.href = 'dashboard.html';
            }
        }
    });

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorElement = document.getElementById('login-error');
            
            errorElement.style.display = 'none';
            
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Signed in
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    errorElement.textContent = error.message + " (Code: " + error.code + ")";
                    console.error("Firebase auth error:", error);
                    errorElement.style.display = 'block';
                });
        });
    }

    // Register Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const errorElement = document.getElementById('register-error');
            
            errorElement.style.display = 'none';
            
            // Check if passwords match
            if (password !== confirmPassword) {
                errorElement.textContent = 'Passwords do not match';
                errorElement.style.display = 'block';
                return;
            }
            
            // Create account
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Add user details to Firestore
                    const user = userCredential.user;
                    
                    return user.updateProfile({
                        displayName: name
                    }).then(() => {
                        // Create user document in Firestore
                        return db.collection('users').doc(user.uid).set({
                            name: name,
                            email: email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }).then(() => {
                        window.location.href = 'dashboard.html';
                    });
                })
                .catch((error) => {
                    errorElement.textContent = error.message + " (Code: " + error.code + ")";
                    console.error("Firebase auth error:", error);
                    errorElement.style.display = 'block';
                });
        });
    }

    // Reset Password Form
    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const messageElement = document.getElementById('reset-message');
            const errorElement = document.getElementById('reset-error');
            
            messageElement.style.display = 'none';
            errorElement.style.display = 'none';
            
            firebase.auth().sendPasswordResetEmail(email)
                .then(() => {
                    messageElement.textContent = 'Password reset email sent. Check your inbox.';
                    messageElement.style.display = 'block';
                    messageElement.className = 'message success-message';
                    resetForm.reset();
                })
                .catch((error) => {
                    errorElement.textContent = error.message + " (Code: " + error.code + ")";
                    console.error("Firebase auth error:", error);
                    errorElement.style.display = 'block';
                });
        });
    }

    // Google Sign In
    const googleLoginButton = document.getElementById('google-login');
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', function() {
            signInWithGoogle();
        });
    }

    const googleRegisterButton = document.getElementById('google-register');
    if (googleRegisterButton) {
        googleRegisterButton.addEventListener('click', function() {
            signInWithGoogle();
        });
    }

    function signInWithGoogle() {
        firebase.auth().signInWithPopup(googleProvider)
            .then((result) => {
                const user = result.user;
                const isNewUser = result.additionalUserInfo.isNewUser;
                
                if (isNewUser) {
                    // Create user document in Firestore
                    return db.collection('users').doc(user.uid).set({
                        name: user.displayName,
                        email: user.email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        window.location.href = 'dashboard.html';
                    });
                } else {
                    window.location.href = 'dashboard.html';
                }
            })
            .catch((error) => {
                alert(error.message + " (Code: " + error.code + ")");
            });
    }

    // Forgot Password Link
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'forgot-password.html';
        });
    }

    // Password Toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            togglePasswordVisibility(passwordInput, this);
        });
    }

    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const confirmPasswordInput = document.getElementById('confirm-password');
            togglePasswordVisibility(confirmPasswordInput, this);
        });
    }

    function togglePasswordVisibility(input, icon) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }

    // Error message helper
    function getErrorMessage(errorCode) {
        switch(errorCode) {
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'This email is already registered';
            case 'auth/weak-password':
                return 'Password is too weak (minimum 6 characters)';
            case 'auth/operation-not-allowed':
                return 'This operation is not allowed';
            case 'auth/account-exists-with-different-credential':
                return 'An account already exists with the same email address but different sign-in credentials';
            case 'auth/popup-closed-by-user':
                return 'Sign in was cancelled by closing the popup';
            default:
                return 'An error occurred. Please try again.';
        }
    }
}); 