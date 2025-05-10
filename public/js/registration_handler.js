$(document).ready(function() {
    $('#signup-form').on('submit', function(e) {
      e.preventDefault();
      $('#errorMessages').remove();
      const userName = $('#user_name').val().trim();
      const password = $('#password').val().trim();
      const email = $('#email').val().trim();
      let isValid = true;
      let errorMessages = [];
      if (!userName) {
        isValid = false;
        errorMessages.push('Username is required.');
      }
      if (!password) {
        isValid = false;
        errorMessages.push('Password is required.');
      }
      if (!email) {
        isValid = false;
        errorMessages.push('Email is required.');
      }
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (email && !emailPattern.test(email)) {
        isValid = false;
        errorMessages.push('Please enter a valid email.');
      }
  
      if (!isValid) {
        $('form').prepend('<div id="errorMessages" style="color: red;"></div>');
        errorMessages.forEach(msg => {
          $('#errorMessages').append('<p>' + msg + '</p>');
        });
        return;
      }
      $.ajax({
        url: '/user/register',
        type: 'POST',
        data: {
          user_name: userName,
          password: password,
          email: email
        },
        success: function(response) {
          window.location.href = '/user/login';
        },
        error: function(xhr, status, error) {
          alert('Registration failed. Please try again.');
        }
      });
    });
  });
  