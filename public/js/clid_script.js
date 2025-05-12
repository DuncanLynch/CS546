$(document).ready(function () {
  let activeButton = null;
  if (classData.professors && classData.professors.length > 0) {
    $('.prof-rev').removeAttr('hidden');

    classData.professors.forEach(function (profId) {
      $.ajax({
        url: `/professor/${profId}`,
        method: 'GET',
        success: function (professor) {
          const button = $('<button>')
            .text(professor.professor_name)
            .attr('data-id', profId)
            .addClass('professor-button');
          button.on('click', function () {
            $('.review-container li').each(function () {
              const review = $(this);
              const reviewProfessorId = review.data('professor-id');

              if (reviewProfessorId === profId) {
                review.show();
              } else {
                review.hide();
              }
            });

            if (activeButton) {
              $(`#${activeButton}`).removeClass("professor-button-active");
              $(`#${activeButton}`).addClass("professor-button");
            }
            activeButton = profId;
            button.addClass('professor-button-active');
            button.removeClass('professor-button');
          });
          $('.professor-buttons').append(button);
        },
        error: function () {
          console.error(`Failed to fetch data for professor ID ${profId}`);
        }
      });
    });
  } else {
    $('.prof-rev').attr('hidden', true);
  }

  classData.reviews.forEach(function (review) {
    const li = $('<li>').data('professor-id', review.professor_id)
      .append(
        `<p>Title: ${review.review_title}</p>
         <p>Rating: ${review.review_total_rating}</p>
         <p>Review: ${review.review_contents}</p>`
      );
    $('.review-container').append(li);
  });

  $('#review-form').on('submit', function (e) {
    e.preventDefault(); 
    $('#errorMessages').remove();
    const errorMessages = [];

    const professorName = $('#professor-name').val().trim();
    const professorEmail = $('#professor-email').val().trim();
    const title = $('#review-title').val().trim();
    const totalRating = parseFloat($('#total-rating').val().trim());
    const difficultyRating = parseFloat($('#difficulty-rating').val().trim()); 
    const qualityRating = parseFloat($('#quality-rating').val().trim());
    const reviewContents = $('#review').val().trim();

    if (!professorName) {
      errorMessages.push('Professor name is required.');
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!professorEmail || !emailRegex.test(professorEmail)) {
      errorMessages.push('A valid professor email is required.');
    }

    if (!title) {
      errorMessages.push('Review title is required.');
    }

    if (isNaN(totalRating) || totalRating < 1 || totalRating > 5) {
      errorMessages.push('Total rating must be a number between 1 and 5.');
    }

    if (isNaN(difficultyRating) || difficultyRating < 1 || difficultyRating > 5) {
      errorMessages.push('Difficulty rating must be a number between 1 and 5.');
    }

    if (isNaN(qualityRating) || qualityRating < 1 || qualityRating > 5) {
      errorMessages.push('Quality rating must be a number between 1 and 5.');
    }

    if (!reviewContents) {
      errorMessages.push('Review contents are required.');
    }

    if (errorMessages.length > 0) {
      const errorDiv = $('<div id="errorMessages" style="color: red;">');
      errorMessages.forEach(function (msg) {
        errorDiv.append('<p>' + msg + '</p>');
      });
      $('form').prepend(errorDiv);
      return;
    }
    const courseCode = classData.course_code;
    $.ajax({
      url: '/professor',
      type: 'POST',
      data: {
        course_code: courseCode,
        email: professorEmail,
        professor_name: professorName
      },
      success: function (response) {
        const professorId = response.professor_id;
        console.log(response);
        $.ajax({
          url: `/review/${classData._id}`,
          type: 'POST',
          data: {
            course_code: classData.course_code,
            professor_id: professorId,
            review_title: title,
            review_total_rating: totalRating,
            review_difficulty_rating: difficultyRating,
            review_quality_rating: qualityRating,
            review_contents: reviewContents,
            user_name: userData.user_name,
            review_date: new Date().toISOString(),
            reviewer_id: userData._id
          },
          success: function (response) {
            console.log(response);
            alert('Review submitted successfully!');
            $('#review-form')[0].reset();
          },
          error: function () {
            alert('Failed to submit review. Please try again.');
          }
        });
      },
      error: function () {
        alert('Failed to fetch professor ID. Please try again.');
      }
    });
  });
});
