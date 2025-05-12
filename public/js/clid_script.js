$(document).ready(function () {
  let activeButton = "0";

  $('#0').on('click', function () {
    $('.review-container li').show(); // Show all reviews

    if (activeButton) {
      $(`#${activeButton}`).removeClass("professor-button-active");
      $(`#${activeButton}`).addClass("professor-button");
    }

    activeButton = "0";
    $('#0').addClass('professor-button-active');
    $('#0').removeClass('professor-button');
  });

  if (classData.professors && classData.professors.length > 0) {
    $('.prof-rev').removeAttr('hidden');

    classData.professors.forEach(function (profId) {
      $.ajax({
        url: `/professor/${profId}`,
        method: 'GET',
        success: function (professor) {
          const button = $('<button>')
            .text(professor.professor_name)
            .attr('id', profId)
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
    $.ajax({
      url: `/professor/${review.professor_id}`,
      type: "GET",
      success: function (response) {
        const li = $('<li>')
          .data('professor-id', review.professor_id)
          .append(`
            <div class="review-card">
              <div class="review-header">
                <div class="reviewer-info">
                  <p><strong>${review.reviewer_name}</strong></p>
                  <p>Professor ${response.professor_name} (${response.email})</p>
                </div>
                <div class="review-date">
                  <p>${review.review_date}</p>
                </div>
              </div>
              <div class="review-body">
                <div class="overall-rating">
                  <div class="rating-badge">${review.review_total_rating}</div>
                  <p>Overall</p>
                </div>
                <div class="other-info">
                  <div class="other-ratings">
                    <div><strong>Difficulty:</strong> ${review.review_difficulty_rating}</div>
                    <div><strong>Quality:</strong> ${review.review_quality_rating}</div>
                  </div>
                  <div class="review-content">
                    <h4>${review.review_title}</h4>
                    <p>${review.review_contents}</p>
                  </div>
                </div>
              </div>
              <div class="review-footer">
                <button class="like-button" data-id="${review._rid}">👍 ${review.likes || 0}</button>
                <button class="dislike-button" data-id="${review._rid}">👎 ${review.dislikes || 0}</button>
              </div>
            </div>
          `);

        $('.review-container').append(li);
      }
    });
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

    $.ajax({
      url: 'https://raw.githubusercontent.com/zacanger/profane-words/master/words.json',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        const reviewWords = $('#review').val().split(/\s+/);
        for (const word of reviewWords) {
          if (data.includes(word.toLowerCase())) {
            alert('Please no profanity.');
            $('#review').val('');
            return;
          }
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
            const professorId = response._id;
            $.ajax({
              url: `/reviews/${classData._id}`,
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
                review_date: new Date().toISOString().substring(0, 10),
                reviewer_id: userData._id
              },
              xhrFields: {
                withCredentials: true
              },
              success: function () {
                alert('Review submitted successfully!');
                $('#review-form')[0].reset();
                window.location.reload();
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
      }
    });
  });

  $('.review-container').on('click', '.like-button, .dislike-button', function () {
    const button = $(this);
    const reviewId = button.data('id');
    const isLike = button.hasClass('like-button');
    const courseCode = classData.course_code;

    if (!userData) return;

    $.ajax({
      url: `/reviews/review/${reviewId}`,
      type: 'GET',
      success: function (response) {
        const id = userData._id.toString();
        const like = isLike ? 1 : 0;
        let likers = response.likers;
        const status = likers[id];
        

        if (like == status) {
          alert('You cannot ' + (isLike ? 'like' : 'dislike') + ' more than once! Your passion is much appreciated though.');
          return;
        }

        if(status != undefined && status != like) {
        likers[userData._id] = like;
        }
        else{
        likers[userData._id] = like;
        }

        const likes = Object.values(likers).filter(l => l == 1).length;
        const dislikes = Object.values(likers).filter(v => v == 0).length;

        const updatedFields = {
          course_code: courseCode,
          _rid: reviewId,
          updatedFields:{
            likes,
            dislikes,
            likers
          }
        };

        $.ajax({
          url: `/reviews/review/${reviewId}`,
          type: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify(updatedFields),
          success: function () {
            $(`.like-button[data-id="${reviewId}"]`).html(`👍 ${likes}`);
            $(`.dislike-button[data-id="${reviewId}"]`).html(`👎 ${dislikes}`);
          },
          error: function () {
            alert('Failed to update review. Please try again.');
          }
        });
      },
      error: function () {
        alert('Failed to fetch review data. Please try again.');
      }
    });
  });
});