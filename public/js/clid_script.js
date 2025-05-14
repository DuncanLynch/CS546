$(document).ready(function () {
  let activeButton = "0";

  $('#0').on('click', function () {
    $('#wishlist-container').empty().hide() //hide add to wishlist when on all Professors
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
      
      const reviewCounts = {};
      classData.reviews.forEach((review) => {
        const id = review.professor_id;
        reviewCounts[id] = (reviewCounts[id] || 0) + 1;
      });

      const sortedProfessors = [...classData.professors].sort((a, b) => {
        return (reviewCounts[b] || 0) - (reviewCounts[a] || 0);
      });

      sortedProfessors.forEach(function (profId) {
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

              const wishlistButton = $(`
                <button class="add-wishlist" data-id="${profId}">
                  ⭐ Add <b>${professor.professor_name}</b> to Wishlist
                </button>
              `);
              $('#wishlist-container').empty().append(wishlistButton).show();
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
    const sortedReviews = [...classData.reviews].sort((a, b) => {
      const aLikes = a.likes || 0;
      const bLikes = b.likes || 0;
      return bLikes - aLikes;
    });

  sortedReviews.forEach(function (review) {
    const prof = $.ajax({url: `/professor/${review.professor_id}`, type: "GET", success: function (response) {
    const commentHTML = (review.comments || []).map(comment => `
      <div class="comment">
        <p><span class='strong'>${comment.user_name}</span> (${new Date(comment.date).toLocaleDateString()}):</p>
        <p>${comment.text}</p>
      </div>
    `).join('');

    const li = $('<li>')
    .data('professor-id', review.professor_id)
    .data('reviewer-name', review.reviewer_name)

    .append(`
      <div class="review-card">
        <div class="review-header">
          <div class="reviewer-info">
            <p class='strong'>${review.reviewer_name}</p>
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
              <div><span class='strong'>Difficulty:</span> ${review.review_difficulty_rating}</div>
              <div><span class='strong'>Quality:</span> ${review.review_quality_rating}</div>
            </div>
            <div class="review-content">
              <h4>${review.review_title}</h4>
              <p>${review.review_contents}</p>
            </div>
          </div>
        </div>
        <div class="review-footer">
          <div id="like-col">
            <div class="like-row">
              <button class="like-button" data-id="${review._rid}">👍 ${review.likes || 0}</button>
              <button class="dislike-button" data-id="${review._rid}">👎 ${review.dislikes || 0}</button>
            </div>  
          </div>
        </div>
        <div class="comments-section">
        <h5>Comments</h5>
          <div class="overflow-container">
            ${commentHTML || "<p id='nocom'>No comments yet.</p>"}
          </div>
          <form class="comment-form" id="${review._rid}">
            <input type="text" name="commentText" placeholder="Add a comment" required />
            <button type="submit">${userData ? 'Post' : 'You Must Be Logged in to Post A Comment!'}</button>
          </form>
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

    const errorDiv = $('<div id="errorMessages">');
    if (errorMessages.length > 0) {
      
      errorMessages.forEach(function (msg) {
        errorDiv.append(`<p class='error'>${msg}</p>`);
      });
      $('#review-form').append(errorDiv);
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
            errorDiv.append(`<p class='error'>Please no profanity!</p>`);
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
                errorDiv.append(`<p>Review submitted successfully!</p>`);
                $('#review-form')[0].reset();
                window.location.reload();
              },
              error: function () {
                $(".error").remove();
                errorDiv.append(`<p>Failed to submit review. Please try again.</p>`);
              }
            });
          },
          error: function () {
            $(".error").remove();
            errorDiv.append(`<p>Failed to fetch professor ID. Please try again.</p>`);
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
        const reviewerName = $(`.like-button[data-id="${reviewId}"]`).closest('li').data('reviewer-name');
        const id = userData._id.toString();
        const like = isLike ? 1 : 0;
        let likers = response.likers;
        const status = likers[id];
        
        const reviewFooter = $(`.like-button[data-id="${reviewId}"]`).closest('div')
        if (like == status) {
          $(".error").remove();
          reviewFooter.append('<p class="error">You cannot ' + (isLike ? 'like' : 'dislike') + ' more than once!</p>');
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
          user_name: reviewerName,
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
            $(".error").remove();
          },
          error: function () {
            $(".error").remove();
            $('#like-col').append('<p class="error">Failed to like the review!</p>');
          }
        });
      },
      error: function () {
        $(".error").remove();
        $('.review-container').append('<p class="error">Failed to fetch the review data!</p>');
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
    const reviewerName = form.closest('li').data('reviewer-name');


    
    $.ajax({
      url: 'https://raw.githubusercontent.com/zacanger/profane-words/master/words.json',
      type: 'GET',
      dataType: 'json',
      success: function (data) { 
        let errorMessages = [];
        const commentWords = commentText.split(/\s+/);
        let badword = false;
        for (const word of commentWords) {
          if (data.includes(word.toLowerCase())) {
            badword = true;
          }
        }
        if (badword) {
            errorMessages.push('Please no profanity.');
            form.find('input[name="commentText"]').val('');
        }
        if (errorMessages.length > 0) {
          errorMessages.forEach(function (msg) {
            form.append(`<p class='error'>${msg}</p>`);
          });
          return
        }
        $.ajax({
          url: `/reviews/comment/${reviewId}`,
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            classId: classData._id,
            commentText: commentText, 
            reviewer: reviewerName,
          }),
         success: function (newComment) {
            $('#nocom').hide();
            const commentHTML = `
              <div class="comment">
                <p><span class='strong'>${userData.user_name}</span> (${new Date().toISOString().substring(0,10)}):</p>
                <p>${commentText}</p>
              </div>
            `;
            form.before(commentHTML);
            form[0].reset();
            $(".error").remove();
          },
          error: function (error) {
            $(".error").remove();
            form.append(`<p class='error'>Failed to post comment</p>`);
          }
        });
      }
    });
  });

  $('#wishlist-container').on('click', '.add-wishlist', function() {
    if (!userData) return;
    const button = $(this);
    const id = button.data('id');

    $.ajax({
      url: `/professor/${userData._id}/${id}`,
      method: "POST",
      success: function(response){
        if (response.added)
          button.text("✅ Added");
        else 
          button.text("❌ Already Added!");
      },
      error: function(e){
      }
    });
  });
});