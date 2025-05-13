import express from 'express';
import * as classData from '../data/classes.js'
import * as userData from '../data/users.js'
import xss from 'xss'
import { process_id, validate, validate_string, process_unsignedint, process_numerical_rating, process_course_code, validate_yyyymmdd_date, validate_number, validate_user_name, validate_prerequisites} from "../validation.js";
import { ObjectId } from 'mongodb';
const router = express.Router();

router
.route('/review/:id')
.get(async (req, res) => {
    let id = null;
    try{
        if (!(Object.keys(req.body).length === 0)) {
            return res.status(400).send("400: Route was not expecting json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        id = validate(xss(req.params.id), validate_string, [process_id])
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if (id === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try{
        const classList = await classData.getAllClasses()
        for(let i = 0; i<classList.length; i++){
            for(let j = 0; j<classList[i].reviews.length; j++){
                if(classList[i].reviews[j]._rid == id) return res.status(200).send(classList[i].reviews[j])
            }
        }
        return res.status(404).send("404: Review not found")
    }catch(e){
        return res.status(500).send("500: " + e)
    }
})
.delete(async (req, res) => {
    let id = null;
    try{
        if (!(Object.keys(req.body).length === 0)) {
            return res.status(400).send("400: Route was not expecting json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        id = validate(xss(req.params.id), validate_string, [process_id])
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if (id === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try{
        const deletedReview = await classData.deleteReview(id)
        await userData.deleteReview(id)
        return res.status(200).send(deletedReview)
    }catch(e){
        return res.status(404).send("404: " + e)
    }
})
.put(async (req, res) => {
    const rid = xss(req.params.id)
    const course_code = xss(req.body.course_code)
    const updatedFields = req.body.updatedFields;
    const user_name = xss(req.body.user_name);
    let updatedReview;
    let rid, course_code, updatedFields, user_name = null
    try{
        if (!req.body || !(Object.keys(req.body).length === 4)) {
            return res.status(400).send("400: Invalid length of json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        rid = validate(xss(req.params.id), validate_string, [process_id])
        course_code = validate(xss(req.body.course_code), validate_string, [process_course_code])
        user_name = validate(xss(req.body.user_name), validate_string, [validate_user_name])
                /*
                    professor_id
                    review_title
                    reviewer_id
                    reviewer_name
                    review_date
                    review_contents
                    likes
                    dislikes
        
        */
        updatedFields = req.body.updatedFields
        if( !(updatedFields.constructor === Object)) return res.status(400).send("400: Expected an object");
        for(let i in updatedFields){
            if(i === "professor_id") updatedFields[i] = validate(xss(req.body.updatedFields.professor_id), validate_string, [process_id])
            else if(i === "review_title") updatedFields[i] = validate(xss(req.body.updatedFields.review_title), validate_string, []);
            else if(i === "reviewer_id") updatedFields[i] = validate(xss(req.body.updatedFields.reviewer_id), validate_string, [process_id])
            else if(i === "review_date") updatedFields[i] = validate(xss(req.body.updatedFields.review_date), validate_string, [validate_yyyymmdd_date]);
            else if(i === "review_contents") updatedFields[i] = validate(xss(req.body.updatedFields.review_contents), validate_string, []);
            else if(i === "likes")  updatedFields[i] = validate(Number(xss(req.body.updatedFields.likes)), validate_number, [process_unsignedint]);
            else if(i === "dislikes") updatedFields[i] = validate(Number(xss(req.body.updatedFields.dislikes)), validate_number, [process_unsignedint]);
            else return res.status(400).send("400: Unexpected key in updatedFields");
        }
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    console.log(updatedFields)
    try{
        updatedReview = await classData.updateReview(course_code, rid, updatedFields) ;  
    }catch (e){
        console.log(e)
        return res.status(404).send("404: "+ e)
    }
    try {
        await userData.updateReview(user_name, rid, updatedFields);
    }
    catch(e) {
        return res.status(201).send(updatedReview);
    }
    
    return res.status(200).send(updatedReview)
})
router
.route('/review/:id/comments')
.post(async (req, res) => {
    let reviewId, classId, userId, comment_contents = null;
    try{
        if (!req.body || !(Object.keys(req.body).length === 3)) {
            return res.status(400).send("400: Invalid length of json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        reviewId = validate(xss(req.params.id), validate_string, [process_id])
        classId = validate(xss(req.body.classId), validate_string, [process_id])
        userId = validate(xss(req.body.userId), validate_string, [process_id])
        comment_contents = validate(xss(req.body.comment_contents), validate_string, []) //find specific validation function
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if(reviewId === null || classId === null || userId === null || comment_contents === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try{
        const newComment = await classData.addComment(classId, reviewId, userId, comment_contents)
        return res.status(200).send(newComment)
    }catch (e){
        return res.status(404).send("404: " + e)
    }
})
.get(async (req, res) => {
    let id = null;
    try{
        if (!(Object.keys(req.body).length === 0)) {
            return res.status(400).send("400: Route was not expecting json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        id = validate(xss(req.params.id), validate_string, [process_id])
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if (id === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try{
        const classList = await classData.getAllClasses()
        for(let i = 0; i<classList.length; i++){
            for(let j = 0; j<classList[i].reviews.length; j++){
                if(classList[i].reviews[j]._rid == id) return res.status(200).send(classList[i].reviews[j].comments)
            }
        }
        return res.status(404).send("404: Review not found so can't return comments")
    }catch{
        return res.status(500).send("500: " + e)
    }

})
router
.route('/review/:reviewId/comments/:commentId')//fix
.get(async (req, res) => {
    let id, commentId = null;
    try{
        if (!(Object.keys(req.body).length === 0)) {
            return res.status(400).send("400: Route was not expecting json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        id = validate(xss(req.params.reviewId), validate_string, [process_id])
        commentId = validate(xss(req.params.commentId), validate_string, [process_id])
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if (id === null || commentId === null) return res.status(500).send("500: One or more inputs was not set in validation")
    let reviewobj = null;
    try{
        const classList = await classData.getAllClasses()
        for(let i = 0; i<classList.length; i++){
            for(let j = 0; j<classList[i].reviews.length; j++){
                if(classList[i].reviews[j]._rid.toString() == id.toString()) reviewobj = classList[i].reviews[j]
            }
        }
        if(reviewobj === null) return res.status(404).send("404: Review not found so can't return comments")
        for(let i = 0; i<reviewobj.comments.length; i++){
            if(reviewobj.comments[i]._id === commentId) return res.status(200).send(reviewobj.comments[i])
        }
        return res.status(404).send("404: Comment not found inside review")
    }catch(e){
        return res.status(500).send("500: " + e)
    }
})

router
.route('/:classId')
.get(async (req, res) => {
    let classId = null;
    try{
        if (!(Object.keys(req.body).length === 0)) {
            return res.status(400).send("400: Route was not expecting json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        classId = validate(xss(req.params.classId), validate_string, [process_id])
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if (classId === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try {
        const reviews = await classData.getClassById(classId).reviews
        return res.status(200).json(reviews);
    } catch (e) {
    // Something went wrong with the server!
        return res.status(404).send(e);
    }
})
.post(async (req, res) => {
    console.log("hi");
    let classId, course_code, professor_id, review_title, reviewer_id, review_date, review_contents, review_quality_rating, review_difficulty_rating, review_total_rating, user_name = null
    try{
        if (!req.body || !(Object.keys(req.body).length === 10)) {
            return res.status(400).send("400: Invalid length of json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        classId = validate(xss(req.params.classId), validate_string, [process_id])
        course_code = validate(xss(req.body.course_code), validate_string, [process_course_code])
        professor_id = validate(xss(req.body.professor_id), validate_string, [process_id])
        review_title = validate(xss(req.body.review_title), validate_string, []); //find specific validation function
        reviewer_id = validate(xss(req.body.reviewer_id), validate_string, [process_id])
        review_date = validate(xss(req.body.review_date), validate_string, [validate_yyyymmdd_date]);
        review_contents = validate(xss(req.body.review_contents), validate_string, [])
        review_quality_rating = validate( Number(xss(req.body.review_quality_rating.toString())) , validate_number, [process_numerical_rating])
        review_difficulty_rating = validate( Number(xss(req.body.review_difficulty_rating.toString())) , validate_number, [process_numerical_rating])
        review_total_rating = validate( Number(xss(req.body.review_total_rating.toString())) , validate_number, [process_numerical_rating])
        user_name = validate(xss(req.body.user_name), validate_string, [validate_user_name])
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if (classId === null || course_code === null || professor_id === null || review_title === null || reviewer_id === null || review_date === null || review_contents === null || review_quality_rating === null || review_difficulty_rating === null || review_total_rating === null || user_name === null) return res.status(500).send("500: One or more inputs was not set in validation")
    console.log("post review")
    try{
        const newReview = await classData.addReview({course_code, professor_id, review_title, reviewer_id, review_date, review_contents, review_quality_rating, review_difficulty_rating, review_total_rating, user_name, _rid: _rid.toString() })
        await userData.addReview(user_name, newReview) //awaiting on this function, update param upon duncan push
        return res.status(200).send(newReview)
    }catch(e){
        console.log(e);
        return res.status(404).send(e);
    }
})
router
.route('/comment/:id')
.post(async (req, res) => {
  try {
    const reviewId = validate(xss(req.params.id), validate_string, [process_id]);
    const commentText = xss(req.body.commentText);
    const classId = xss(req.body.classId)
    const reviewer = xss(req.body.reviewer)
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'User must be logged in to comment.' });
    }

    const user_name = validate(req.session.user.user_name, validate_string, [validate_user_name]);

    let userSuccess = false;
    let classSuccess = false;
    const commentId = new ObjectId();
    classSuccess = await classData.addComment(user_name, reviewId, classId, commentText, commentId);
    userSuccess = await userData.addComment(user_name, reviewId, commentText, commentId, reviewer);

    if (!userSuccess && !classSuccess) {
      return res.status(500).json({ error: 'Failed to add comment to both user and class records.' });
    }

    return res.status(200).json({ message: 'Comment added successfully.'});

  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.message });
  }
});

export default router;