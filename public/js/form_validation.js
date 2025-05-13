$(document).ready(function() {
    $('#signin-form').on('submit', function(e) {
      
      $('#errorMessages').remove();
      const userName = $('#user_name').val().trim();
      const password = $('#password').val().trim();
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
  