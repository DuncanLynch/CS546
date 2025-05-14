$(document).ready(function() {
    $('#signup-form').on('submit', function(e) {
      
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
  