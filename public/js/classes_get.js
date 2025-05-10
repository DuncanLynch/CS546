$(document).ready(function() {
    $.ajax({
      url: '/class/',
      method: 'GET',
      dataType: 'json',
      success: function(classes) {
        const $ul = $('<ul>', { id: 'classlist' });
        classes.forEach(cls => {
          const $li = $('<li>').text(`${cls.course_code} - ${cls.course_name}`);
          $ul.append($li);
        });
        $('body').append($ul); // You can append it elsewhere if needed
      },
      error: function(xhr, status, error) {
        console.error('Failed to load classes:', error);
      }
    });
  });