$(document).ready(function () {
    $('#searchInput').on('keyup', function () {
        const query = $(this).val().toLowerCase();
        $('#classlist li').each(function () {
            const className = $(this).text().toLowerCase().substring(0,8);
            $(this).toggle(className.includes(query));
        });
    });
});

$(document).ready(function() {
    $.ajax({
      url: '/class/',
      method: 'GET',
      dataType: 'json',
      success: function(classes) {
        const $ul = $('#classlist');
        classes.forEach(cls => {
          const $a = $('<a>')
            .attr('href', `/class/${cls.course_code}`)
            .text(`${cls.course_code} - ${cls.course_name}`);
          const $li = $('<li>').append($a);
          $ul.append($li);
        });
      },
      error: function(xhr, status, error) {
        console.error('Failed to load classes:', error);
      }
    });
  });