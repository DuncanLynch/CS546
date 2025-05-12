
import express from 'express';
import * as classData from '../data/classes.js'
const router = express.Router();
import xss from 'xss'
router
.route('/')
.get(async (req, res) => {
    try {
        const classList = await classData.getAllClasses()
        return res.status(200).json(classList);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(500).send("500: " + e);
    }
})
.post(async (req, res) => {
    const course_code = xss(req.body.course_code)
    const course_name = xss(req.body.course_name)
    const course_description = xss(req.body.course_description)
    const typically_offered = xss(req.body.typically_offered)
    const prerequisites = xss(req.body.prerequisites)
    const class_total_rating = xss(req.body.class_total_rating)
    const class_total_difficulty = xss(req.body.class_total_difficulty)
    const class_total_quality = xss(req.body.class_total_quality)
    try {
        const newClass = await classData.createClass(course_code, course_name, course_description, typically_offered, prerequisites, class_total_rating, class_total_difficulty, class_total_quality)
        return res.status(200).json(newClass);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(500).send("500: " + e);
    }
})
router
.route('/:id')
.delete(async (req, res) => {
    const id = xss(req.params.id)
    try {
        const deletedClass = await classData.deleteClass(id)
        return res.status(200).json(deletedClass)
    }catch (e){
        return res.status(404).send("404: "+ e)
    }
})
router
.route('/:course_code')
.get(async (req, res) => {
    try{
        const course_code = xss(req.params.course_code);
        const foundClass = await classData.getClassbyCourseCode(course_code);
        //CHANGE THE VALUES OF THIS OBJECT BELOW HOW YOU LIKE, IF YOU NEED MORE DATA PASSED INTO YOUR COURSE PAGE JUST ASK ME, FOR NOW I AM JUST PASSING A COURSE OBJECT
        //THIS TEST OBJECT DOES NOT HAVE A _id PARAMETER, IN THE REAL DEAL IT WILL HAVE ONE, FOR NOW JUST PRETEND LIKE IT HAS ONE
        //CHANGE CLASSPAGE TO THE NAME OF THE CLASS PAGE HANDLEBARS FILE
        return res.status(200).render('classpage', {
            class: foundClass, 
            userJson: JSON.stringify(req.session.user)})
    }catch (e){
        return res.status(404).send("404: "+ e)
    }
    
})
export default router
