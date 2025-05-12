(function () {
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', (event) => {
            let user_name = document.getElementById('user_name').value.trim();
            let password = document.getElementById('password').value.trim();
            let errorMessage = '';

            if(!user_name || password)errorMessage = "Username and Password Required";

            if (errorMessage) {
                event.preventDefault();
                alert(errorMessage);
            }
        });
    }
})();
