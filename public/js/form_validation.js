document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent form submission
            const user_name = document.getElementById('user_name').value.trim();
            const password = document.getElementById('password').value.trim();
            if (!user_name || !password) {
                alert("Username and Password are required.");
                return;
            }
            try {
                const response = await axios.post('/user/login', {
                    user_name,
                    password
                });
                alert("Login successful!");
                window.location.href = "/dashboard";
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    alert("Invalid username or password.");
                } else if (error.response?.data?.message) {
                    alert("Error: " + error.response.data.message);
                } else {
                    alert("An unexpected error occurred.");
                }
            }
        });
    }
});
