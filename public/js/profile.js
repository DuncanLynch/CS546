$(document).ready(function () {
  const container = $('.user-review-container');
  if (!userData || !userData.reviews || userData.reviews.length === 0) {
    container.append('<p>No reviews yet :)</p>');
  }else {
    $.ajax({
      url: `/user/${userData.user_name}`,
      method: "GET",
      success: function (user) {
        user.reviews.forEach((rev) => {
          const id = rev.professor_id;
          $.ajax({
            url: `/reviews/review/${rev._rid.toString()}`,
            type: "GET",
            success: function (review) {
              $.ajax({
                url: `/professor/${id}`,
                method: "GET",
                success: function (prof) {
                  const li = $('<li>');
                  const card = $(`
                    <div class="review-card">
                      <div class="review-header">
                        <div class="reviewer-info">
                          <h2><b>${review.course_code}</b></h2>
                          <h3>Professor ${prof.professor_name} (${prof.email})</h3>
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
                        <button class="like-button" data-id="${review._rid}">👍 ${review.likes}</button>
                        <button class="dislike-button" data-id="${review._rid}">👎 ${review.dislikes}</button>
                      </div>
                    </div>
                  `);

                  li.append(card);
                  container.append(li);
                },
                error: function () {
                  console.error(`Failed to load professor ${review.professor_id}`);
                }
              });
            },
            error: function () {
              console.error("Something went wrong getting review");
            }
          });
        });
      },
      error: function () {
        console.error("Failed to load user data");
      }
    });
  }
  const wishlistContainer = $(".wishlist-container");

  

  $.ajax({
    url: `/user/${userData.user_name}`,
    method: "GET",
    success: function (user) {
      if (user.wishlist.length === 0) {
        wishlistContainer.append("<p>No professors to display. Go add some 😀</p>");
      }
      user.wishlist.forEach((prof_id) => {
        $.ajax({
          url: "/professor/" + prof_id,
          method: "GET",
          success: function (prof) {
            const li = $("<li>");
            const card = $(`
              <div class="wishlist-card">
                <h3>${prof.professor_name}</h3>
                <p>Email: ${prof.email}</p>
                <p>Courses: ${prof.courses.join(', ')}</p>
              </div>
            `);

            li.append(card);
            wishlistContainer.append(li);
          },
          error: function () {
            console.error("Failed to get professor with ID: " + prof_id);
          }
        });
      });
    },
    error: function () {
      console.error("Wishlist failed");
    }
  });
});