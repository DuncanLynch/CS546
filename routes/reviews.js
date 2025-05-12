import express from 'express';
import * as classData from '../data/classes.js'
import * as userData from '../data/users.js'
const router = express.Router();

router
.route('/review/:id')
.get(async (req, res) => {
    const id = xss(req.params.id)
    try{
        const classList = await classData.getAllClasses()
        for(let i = 0; i<classList.length; i++){
            for(let j = 0; j<classList[i].reviews.length; j++){
                if(classList[i].reviews[j]._id == id) return res.status(200).send(classList[i].reviews[j])
            }
        }
        return res.status(404).send("404: Review not found")
    }catch(e){
        return res.status(500).send("500: " + e)
    }
})
.delete(async (req, res) => {
    const id = xss(req.params.id)
    try{
        const deletedReview = await classData.deleteReview(id) //waiting on this function
        await userData.deleteReview(id) //waiting on this function
        return res.status(200).send(deletedReview)
    }catch(e){
        return res.status(404).send("404: " + e)
    }

})
.put(async (req, res) => {
    const id = xss(req.params.id)
    const course_code = xss(req.body.course_code)
    const professor_id = xss(req.body.professor_id)
    const review_title = xss(req.body.review_title)
    const reviewer_id = xss(req.body.reviewer_id)
    const review_date = xss(req.body.review_date)
    const review_contents = xss(req.body.review_contents)
    const likes = xss(req.body.likes)
    const dislikes = xss(req.body.dislikes)
    const review_quality_rating = xss(req.bodyreview_quality_rating)
    const review_difficulty_rating = xss(req.body.review_difficulty_rating)
    const review_total_rating = xss(req.body.review_total_rating)
    try{
        const updatedReview = await classData.updateReview(id, course_code, professor_id, review_title, reviewer_id, review_date, review_contents, likes, dislikes, review_quality_rating, review_difficulty_rating, review_total_rating)//waiting on this function
        return res.status(200).send(updatedReview)
    }catch (e){
        return res.status(404).send("404: "+ e)
    }
})
router
.route('/:classId')
.get(async (req, res) => {
    const classId = xss(req.params.id)
    try {
        const reviews = await classData.getClassById(classId).reviews
        return res.status(200).json(reviews);
    } catch (e) {
    // Something went wrong with the server!
        return res.status(404).send(e);
    }
})
.post(async (req, res) => {
    const course_code = xss(req.body.course_code)
    const professor_id = xss(req.body.professor_id)
    const review_title = xss(req.body.review_title)
    const reviewer_id = xss(req.body.reviewer_id)
    const review_date = xss(req.body.review_date) 
    const review_contents = xss(req.body.review_contents) 
    const review_quality_rating = xss(req.body.review_quality_rating)
    const review_difficulty_rating = xss(req.body.review_difficulty_rating)
    const review_total_rating = xss(req.body.review_total_rating)
    const user_name = xss(req.session.user_name)
    try{
        const newReview = await classData.addReview(course_code, professor_id, review_title, reviewer_id, review_date, review_contents, review_quality_rating, review_difficulty_rating, review_total_rating)
        await userData.addReview(user_name, newReview) //awaiting on this function, update param upon duncan push
        return res.status(200).send(newReview)

    }catch(e){
        return res.status(404).send(e);
    }
})
export default router