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
    const prof = $.ajax({url: `/professor/${review.professor_id}`, type: "GET", success: function (response) {
    const commentHTML = (review.comments || []).map(comment => `
      <div class="comment">
        <p><strong>${comment.user_name}</strong> (${new Date(comment.date).toLocaleDateString()}):</p>
        <p>${comment.text}</p>
      </div>
    `).join('');

    const li = $('<li>').data('professor-id', review.professor_id)
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
        <div class="comments-section">
          <h5>Comments</h5>
          ${commentHTML || "<p>No comments yet.</p>"}
          <form class="comment-form" id="${review._rid}">
            <input type="text" name="commentText" placeholder="Add a comment" required />
            <button type="submit">${userData ? 'Post' : 'You Must Be Logged in to Post A Comment!'}</button>
          </form>
        </div>
      </div>
    `);



      $('.review-container').append(li);
    }})
    
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

    const nameParts = professorName.split(" ");
    const nameRegex = /^[A-Z][a-z]+$/;
    if (
      nameParts.length !== 2 ||
      !nameRegex.test(nameParts[0]) ||
      !nameRegex.test(nameParts[1])
    ) {
      errorMessages.push("Professor name must be in 'First Last' format with capitalization.");
    }

    const stevensRegex = /^[a-zA-Z0-9._%+-]+@stevens\.edu$/;
    if (!stevensRegex.test(professorEmail)) {
      errorMessages.push("Email must be a valid stevens.edu address.");
    }

    const checkBadWords = (text) => {
      const lowerText = text.toLowerCase();
      return bad_words.some((word) => lowerText.includes(word));
    };

    if (checkBadWords(title)) {
      errorMessages.push("Review title contains inappropriate language.");
    }
    if (checkBadWords(reviewContents)) {
      errorMessages.push("Review content contains inappropriate language.");
    }


    if (!title) {
      errorMessages.push('Review title is required.');
    }

    if (!reviewContents) {
        errorMessages.push('Review contents are required.');
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

 
    if (errorMessages.length > 0) {
      const errorDiv = $('<div id="errorMessages">');
      errorMessages.forEach(function (msg) {
        errorDiv.append(`<p class='error'>'${msg}'</p>`);
      });
      $('form').append(errorDiv);
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
            review_date: new Date().toISOString().substring(0,10),
            reviewer_id: userData._id
          },
          success: function (response) {
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
  $('.review-container').on('click', '.like-button, .dislike-button', function () {
  if (!userData) return;

  const isLike = $(this).hasClass('like-button');
  const button = $(this);
  const reviewId = button.data('id');
  const reviewCard = button.closest('.review-card');
  const courseCode = classData.course_code;

  const currentCount = parseInt(button.text().match(/\d+/)[0]);

  const newCount = currentCount + 1;

  const updatedFields = {
    course_code: courseCode,
    _rid: reviewId,
    updatedFields: {}
  };

  if (isLike) {
    updatedFields.updatedFields.likes = newCount;
  } else {
    updatedFields.updatedFields.dislikes = newCount;
  }

  $.ajax({
    url: `/reviews/review/${reviewId}`,
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(updatedFields),
    success: function () {
      button.html((isLike ? '👍 ' : '👎 ') + newCount);
    },
    error: function () {
      alert('Failed to update review. Please try again.');
    }
  });
});
  $('.review-container').on('submit', '.comment-form', function (e) {
    e.preventDefault();

    if (!userData) {
      return;
    }

    const form = $(this);
    const reviewId = form.attr('id');
    const commentText = form.find('input[name="commentText"]').val().trim();

    if (!commentText) return;
    const checkBadWords = (text) => {
      const lowerText = text.toLowerCase();
      return bad_words.some((word) => lowerText.includes(word));
    };
    let errorMessages = [];
    if (checkBadWords(commentText)) {
      errorMessages.push("Comment contains inappropriate language.");
    }
    if (errorMessages.length > 0) {
      errorMessages.forEach(function (msg) {
        errorDiv.append(`<p class='error'>'${msg}'</p>`);
      });
    }
    $.ajax({
      url: `/reviews/comment/${reviewId}`,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        classId: classData._id,
        commentText: commentText, 
      }),
      success: function (newComment) {
        
        const commentHTML = `
          <div class="comment">
            <p><strong>${userData.user_name}</strong> (${new Date().toISOString().substring(0,10)}):</p>
            <p>${commentText}</p>
          </div>
        `;
        form.before(commentHTML);
        form[0].reset();
      },
      error: function (error) {
        alert(`Failed to post comment.`);
      }
    });
  });


});
