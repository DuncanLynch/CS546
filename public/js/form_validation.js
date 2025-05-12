document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('signin-form');
    const registerForm = document.getElementById('signup-form');

    function isStevensEmail(email) {
        return /^[a-zA-Z0-9._%+-]+@stevens\.edu$/.test(email);
    }

    function validateForm(e, formType) {
        const email = e.target.querySelector('input[name="email"]');
        const password = e.target.querySelector('input[name="password"]');
    
        if (!email || !password) {
            alert("Email and password are required.");
             e.preventDefault();
        return;
        }

        if (!isStevensEmail(email.value.trim())) {
            alert("Please use a valid @stevens.edu email.");
            e.preventDefault();
        return;
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => validateForm(e, 'login'));
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => validateForm(e, 'register'));
    }
});   