function validate_user_name(user_name) {
  if (typeof user_name !== "string") return false;
  if (user_name.trim() === "") return false;
  if (user_name.length === 0 || user_name.length > 25)
      return false

  if (!/^[A-Za-z0-9_]+$/.test(user_name))
      return false

  return user_name;
}

function validate_password(password) {
  if (typeof password !== "string") return false;
  if (password.trim() === "") return false;
  if (password.length === 0)
      return false;

  if (!/^[A-Za-z0-9!@#$%^&*()_\-+=\[\]{}|\\:;"'<>,.?/~`]+$/.test(password))
      return false;

  return password;
}

$(document).ready(function() {
    $('#signup-form').on('submit', function(e) {
      
      $('#errorMessages').remove();
      const userName = $('#user_name').val().trim();
      const password = $('#password').val().trim();
      const email = $('#email').val().trim();
      let isValid = true;
      let errorMessages = [];
      if (!userName || !validate_user_name(userName)) {
        isValid = false;
        errorMessages.push('Username is invalid.');
      }
      if (!password || !validate_password(password)) {
        isValid = false;
        errorMessages.push('Password is invalid.');
      }
      if (!email) {
        isValid = false;
        errorMessages.push('Email is required.');
      }
      const emailPattern = /^[a-zA-Z0-9._-]+@stevens.edu$/;
      if (email && !emailPattern.test(email)) {
        isValid = false;
        errorMessages.push('Please enter a valid stevens email.');
      }
      if (!isValid) {
        e.preventDefault();
        $('form').append('<div id="errorMessages" style="color: red;"></div>');
        errorMessages.forEach(msg => {
          $('#errorMessages').append('<p>' + msg + '</p>');
        });
        return;
      }
    });
  });
  