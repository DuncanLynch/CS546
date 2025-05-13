$(document).ready(function() {
    $('#signin-form').on('submit', function(e) {
      e.preventDefault();
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
        $('form').append('<div id="errorMessages" style="color: red;"></div>');
        errorMessages.forEach(msg => {
          $('#errorMessages').append('<p>' + msg + '</p>');
        });
        return;
      }
      $.ajax({
        url: '/user/login',
        type: 'POST',
        data: {
          user_name: userName,
          password: password,
        },
        success: function(response) {
            console.log(response)
            window.location.href = '/';
        },
        error: function(response) {
          alert(response.responseJSON.error);
        }
      });
    });
  });
  